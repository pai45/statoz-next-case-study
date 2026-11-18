import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..'), out = path.join(root, 'out');
const base = '/statoz-next-case-study', shared = base + '/shared-assets';
process.env.STATOZ_BASE_PATH = base;
process.env.STATOZ_BUILD_DIRECTORY = '.cache/pages-build';
const pagesBuildDirectory = path.join(root, process.env.STATOZ_BUILD_DIRECTORY);
await import('./build.mjs');
if (path.resolve(out) !== path.join(root, 'out')) throw new Error('Invalid output directory');
await fs.rm(out, { recursive: true, force: true });
await fs.cp(pagesBuildDirectory, out, { recursive: true });
async function files(directory, relative = '') {
  const all = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const name = relative ? relative + '/' + entry.name : entry.name;
    if (entry.isDirectory()) all.push(...await files(path.join(directory, entry.name), name));
    else if (entry.isFile()) all.push(name);
    else throw new Error('Only regular demo files are supported: ' + name);
  }
  return all;
}
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
// The Sports assets are a byte-identical subset of Games assets. Fail if a
// future refresh introduces a conflict instead of silently choosing artwork.
const sportsAssets = path.join(root, 'demos/sports/assets'), gamesAssets = path.join(root, 'demos/games/assets');
for (const relative of await files(sportsAssets)) {
  const [a, b] = await Promise.all([fs.readFile(path.join(sportsAssets, relative)), fs.readFile(path.join(gamesAssets, relative))]);
  if (!a.equals(b)) throw new Error('Shared product asset differs: ' + relative);
}
await fs.cp(gamesAssets, path.join(out, 'shared-assets'), { recursive: true });
const catalogue = JSON.parse(await fs.readFile(path.join(root, 'demos/games/game-library/catalogue.json'), 'utf8'));
const currentReleases = new Set(catalogue.games.map(game => game.entry.split('/').slice(0, 3).join('/')));
const tasks = [];
let aliasesSkipped = 0, oldReleasesSkipped = 0;
for (const product of ['sports', 'games']) {
  const source = path.join(root, 'demos', product), destination = path.join(out, 'demos', product);
  const oldBase = '/statoz-next-' + product + '-web', productBase = base + '/demos/' + product;
  for (const relative of await files(source)) {
    if (relative.startsWith('assets/')) continue;
    if (relative.startsWith('game-library/releases/') && !currentReleases.has(relative.slice('game-library/'.length).split('/').slice(0, 3).join('/'))) { oldReleasesSkipped++; continue; }
    const parts = relative.split('/'), segment = parts.findIndex(part => part.startsWith('__next.'));
    if (segment >= 0 && segment < parts.length - 1 && relative.endsWith('.txt')) {
      const alias = [...parts.slice(0, segment), parts.slice(segment).join('.')].join('/');
      const [original, flattened] = await Promise.all([fs.readFile(path.join(source, relative)), fs.readFile(path.join(source, alias)).catch(() => null)]);
      if (flattened?.equals(original)) { aliasesSkipped++; continue; }
    }
    tasks.push(async () => {
      const from = path.join(source, relative), to = path.join(destination, relative);
      await fs.mkdir(path.dirname(to), { recursive: true });
      if (relative.startsWith('game-library/') || !/\.(?:html|js|css|json|txt|xml|webmanifest)$/.test(relative)) { await fs.copyFile(from, to); return; }
      let text = await fs.readFile(from, 'utf8');
      if (relative.endsWith('.js')) {
        text = text.replace(/(["'])http:\/\/127\.0\.0\.1:4413\/statoz-next-games-web\/game-library\/catalogue\.json\1/g, 'location.origin+' + JSON.stringify(base + '/demos/games/game-library/catalogue.json'));
        // The vendored design-system helper uses an arrow rather than the
        // application's function declaration. Adapt both implementations.
        text = text.replace(/(\w+)=>(["'])\/statoz-next-(?:sports|games)-web\2\+\1/g, (_match, value) => `${value}=>${value}.startsWith("/assets/")?${JSON.stringify(shared)}+${value}.slice(7):${JSON.stringify(productBase)}+${value}`);
        // publicAsset() also receives dynamic paths such as player portraits.
        text = text.replace(/return (\w+)\.startsWith\("\/"\)\?`\$\{(\w+)\}\$\{\1\}`:\1/g, (_match, value, prefix) => `return ${value}.startsWith("/assets/")?${JSON.stringify(shared)}+${value}.slice(7):${value}.startsWith("/")?\`\$\{${prefix}\}\$\{${value}\}\`:${value}`);
      }
      text = text.replaceAll(oldBase + '/assets/', shared + '/').replaceAll(oldBase, productBase);
      if (relative.endsWith('.css')) text = text.replace(/url\((["']?)\/assets\//g, 'url($1' + shared + '/');
      if (relative === 'case-study-bridge.js') text = text.replace("parentOrigin='http://127.0.0.1:4411'", 'parentOrigin=location.origin');
      if (relative.endsWith('.html')) text = text.replace('<head>', `<head><script src="${productBase}/case-study-boot.js" data-product="${product}"></script>`);
      await fs.writeFile(to, text);
    });
  }
  await fs.mkdir(destination, { recursive: true });
  await fs.copyFile(path.join(root, 'scripts/case-study-boot.js'), path.join(destination, 'case-study-boot.js'));
}
let cursor = 0;
await Promise.all(Array.from({ length: 24 }, async () => { while (cursor < tasks.length) await tasks[cursor++](); }));
// Case study CSS and HTML use ordinary static public URLs.
for (const relative of await files(pagesBuildDirectory)) {
  if (!/\.(html|css)$/.test(relative)) continue;
  const file = path.join(out, relative);
  let text = await fs.readFile(file, 'utf8');
  text = text.replace(/(["'(])\/(assets\/|app\.(?:js|css))/g, '$1' + base + '/$2');
  await fs.writeFile(file, text);
}
const html = await fs.readFile(path.join(out, 'index.html'), 'utf8');
for (const route of ['present', 'presenter', 'data', 'admin', 'studio', 'walkthrough']) {
  await fs.mkdir(path.join(out, route), { recursive: true });
  await fs.writeFile(path.join(out, route, 'index.html'), html);
}
await fs.writeFile(path.join(out, '404.html'), html);
await fs.writeFile(path.join(out, '.nojekyll'), '');
// Verify the accepted game bytes after copying. The host URL changes; the
// playable catalogue artifacts and their checksum contract do not.
for (const game of catalogue.games) {
  const bytes = await fs.readFile(path.join(out, 'demos/games/game-library', game.entry));
  if (hash(bytes) !== game.sha256 || bytes.length !== game.bytes) throw new Error('Game artifact changed: ' + game.id);
}
let bytes = 0;
for (const relative of await files(out)) bytes += (await fs.stat(path.join(out, relative))).size;
if (bytes > 990_000_000) throw new Error('Pages export exceeds its 990 MB publication budget: ' + bytes);
await fs.writeFile(path.join(out, 'version.json'), JSON.stringify({
  repository: 'pai45/statoz-next-case-study', commit: process.env.GITHUB_SHA || process.env.STATOZ_BUILD_COMMIT || null,
  basePath: base, siteUrl: 'https://pai45.github.io' + base, builtAt: new Date().toISOString(), bytes,
  games: catalogue.games.length, aliasesSkipped, oldReleasesSkipped,
}, null, 2) + '\n');
console.log(`Pages export ready: ${Math.round(bytes / 1048576)} MiB, ${catalogue.games.length} verified games, ${aliasesSkipped} duplicate navigation files omitted.`);
