import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {fastCopy} from './fast-copy.mjs';
const root=path.resolve(import.meta.dirname,'..'),source=path.resolve(root,'../statoz-games-web');
const work=path.join(root,'.cache/current-games-web'),destination=path.join(root,'demos/games');
const library=path.join(root,'demos/games/game-library'),catalogue=JSON.parse(await fs.readFile(path.join(library,'catalogue.json'),'utf8'));
const selected=['longbow','grand-prix-dash','yorker','hoop-legacy'];
for(const id of selected){const record=catalogue.games.find(entry=>entry.id===id);if(!record)throw Error('Accepted game not available: '+id);const bytes=await fs.readFile(path.join(library,record.entry));if(crypto.createHash('sha256').update(bytes).digest('hex')!==record.sha256)throw Error('Accepted game bytes changed: '+id);}
await fs.mkdir(work,{recursive:true});
const inputs=['src','public','next.config.ts','tsconfig.json','postcss.config.mjs','next-env.d.ts','package.json'];
if(!process.argv.includes('--package-only'))for(const input of inputs){const target=path.resolve(work,input),relative=path.relative(work,target);if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Unsafe cache path');await fs.rm(target,{recursive:true,force:true});await fastCopy(path.join(source,input),target);}
const modules=path.join(work,'node_modules');if(!await fs.lstat(modules).catch(()=>null))await fs.symlink(path.join(source,'node_modules'),modules,'junction');
const sourceFiles=[];const entries=await fs.readdir(path.join(work,'src'),{recursive:true,withFileTypes:true});
for(const entry of entries)if(entry.isFile()){const file=path.join(entry.parentPath||entry.path,entry.name);sourceFiles.push({path:path.relative(work,file).split(path.sep).join('/'),sha256:crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')});}
console.log('Building the actual current Games Web app in the case-study cache.');
const status=process.argv.includes('--package-only')?0:await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(source,'node_modules/next/dist/bin/next'),'build','--webpack'],{cwd:work,stdio:'inherit',windowsHide:true,env:{...process.env,GITHUB_PAGES:'true',NEXT_PUBLIC_BASE_PATH:'/statoz-next-games-web',NEXT_PUBLIC_GAME_CATALOGUE_URL:'http://127.0.0.1:4413/statoz-next-games-web/game-library/catalogue.json',NEXT_TELEMETRY_DISABLED:'1'}});child.on('error',reject);child.on('exit',resolve)});
if(status!==0)throw Error('Games Web build failed; the current packaged app is preserved.');
const staged=path.join(root,'.cache/games-package-'+Date.now());await fastCopy(path.join(work,'out'),staged);console.log('Copying the verified playable game library.');await fastCopy(library,path.join(staged,'game-library'));
const {fixStaticPrefetch}=await import(pathToFileURL(path.join(source,'scripts/fix-static-prefetch.mjs')).href);const aliases=await fixStaticPrefetch(staged);
await fs.copyFile(path.join(root,'scripts/games-frame-bridge.js'),path.join(staged,'case-study-bridge.js'));
const pages=await fs.readdir(staged,{recursive:true,withFileTypes:true});let index=0;const html=pages.filter(entry=>entry.isFile()&&entry.name.endsWith('.html')&&!path.join(entry.parentPath||entry.path,entry.name).startsWith(path.join(staged,'game-library')+path.sep));
await Promise.all(Array.from({length:12},async()=>{while(index<html.length){const entry=html[index++],file=path.join(entry.parentPath||entry.path,entry.name),text=await fs.readFile(file,'utf8');await fs.writeFile(file,text.replace('<head>','<head><script src="/statoz-next-games-web/case-study-bridge.js"></script>'));}}));
const backup=path.join(root,'.cache/previous-games-package-'+Date.now());for(const target of [staged,destination,backup]){const relative=path.relative(root,path.resolve(target));if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Unsafe package path');}
await fs.rename(destination,backup);
try{await fs.rename(staged,destination)}catch(error){await fs.rename(backup,destination);throw error;}
await fs.writeFile(path.join(root,'public/data/games-web-build.json'),JSON.stringify({product:'StatOz Games Web',source:'../statoz-games-web',method:'Unmodified source compiled in an isolated directory; presentation transport added to the document head',builtAt:new Date().toISOString(),viewport:{width:852,height:393},basePath:'/statoz-next-games-web',catalogueRevision:catalogue.revision,selectedGames:catalogue.games.filter(entry=>selected.includes(entry.id)),navigationAliases:aliases,sourceFiles},null,2));
console.log('Installed the actual Games Web app and verified playable games. Product sources and game artifacts are unchanged.');
