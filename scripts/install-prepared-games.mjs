import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),staged=path.resolve(root,process.argv[2]||''),destination=path.join(root,'demos/games');
for(const target of [staged,destination]){const relative=path.relative(root,target);if(relative.startsWith('..')||path.isAbsolute(relative)||target===root)throw Error('Unsafe package path');}
await fs.access(path.join(staged,'index.html'));await fs.access(path.join(staged,'case-study-bridge.js'));
if(await fs.stat(destination).catch(()=>null)){const backup=path.join(root,'.cache/previous-games-package-'+Date.now());await fs.rename(destination,backup);}
await fs.rename(staged,destination);
const sourceFiles=[],source=path.join(root,'.cache/current-games-web');
for(const entry of await fs.readdir(path.join(source,'src'),{recursive:true,withFileTypes:true}))if(entry.isFile()){const file=path.join(entry.parentPath||entry.path,entry.name);sourceFiles.push({path:path.relative(source,file).split(path.sep).join('/'),sha256:crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')});}
const catalogue=JSON.parse(await fs.readFile(path.join(destination,'game-library/catalogue.json'),'utf8'));const selected=['longbow','grand-prix-dash','yorker','hoop-legacy'];
await fs.writeFile(path.join(root,'public/data/games-web-build.json'),JSON.stringify({product:'StatOz Games Web',source:'../statoz-games-web',method:'Current source compiled in an isolated directory; presentation transport added to the document head',builtAt:new Date().toISOString(),viewport:{width:852,height:393},basePath:'/statoz-next-games-web',catalogueRevision:catalogue.revision,selectedGames:catalogue.games.filter(entry=>selected.includes(entry.id)),sourceFiles},null,2));
console.log('Installed the current Games Web app and accepted game library.');
