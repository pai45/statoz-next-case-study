import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const snapshot = JSON.parse(await fs.readFile(path.join(root, 'demo-snapshot.json'), 'utf8'));
const exists = file => fs.access(path.join(root, file)).then(() => true, () => false);
if (await exists('demos/sports/index.html') && await exists('demos/games/index.html')) {
  console.log('Using the existing presentation-owned demos.');
  process.exit(0);
}
await fs.mkdir(path.join(root, '.cache'), { recursive: true });
const archive = path.join(root, '.cache', snapshot.asset);
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(command + ' failed with exit code ' + result.status);
  return result;
}
if (!await exists('.cache/' + snapshot.asset)) run('gh', ['release', 'download', snapshot.tag, '--repo', snapshot.repository, '--pattern', snapshot.asset, '--dir', '.cache']);
const digest = crypto.createHash('sha256');
for await (const chunk of createReadStream(archive)) digest.update(chunk);
if (digest.digest('hex') !== snapshot.sha256) throw new Error('The demo archive checksum does not match the pinned snapshot.');
const listing = run('tar', ['-tzf', archive], { stdio: 'pipe', encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).stdout;
for (const name of listing.trim().split(/\r?\n/)) {
  if (!name.startsWith('demos/') || name.split(/[\\/]/).includes('..')) throw new Error('Unexpected archive path: ' + name);
}
run('tar', ['-xzf', archive]);
console.log('Installed the verified Sports and Games presentation snapshot.');
