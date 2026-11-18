// Build the real Sports Web app in an isolated directory; source files are never edited.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'..'),source=path.resolve(root,'../statoz-sports-web');
const work=path.join(root,'.cache/current-sports-web'),destination=path.join(root,'demos/sports');
await fs.mkdir(work,{recursive:true});
const inputs=['src','public','next.config.ts','tsconfig.json','postcss.config.mjs','next-env.d.ts','package.json'];
if(!process.argv.includes('--package-only'))for(const input of inputs){const target=path.resolve(work,input),relative=path.relative(work,target);if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Unsafe cache path');await fs.rm(target,{recursive:true,force:true});await fs.cp(path.join(source,input),target,{recursive:true});}
const modules=path.join(work,'node_modules');
if(!await fs.lstat(modules).catch(()=>null))await fs.symlink(path.join(source,'node_modules'),modules,'junction');
const sourceFiles=[];
async function collect(directory,relative='src'){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const name=path.posix.join(relative,entry.name),file=path.join(directory,entry.name);if(entry.isDirectory())await collect(file,name);else sourceFiles.push({path:name,sha256:crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')});}}
await collect(path.join(work,'src'));
console.log('Building the current Sports Web source in the case-study cache.');
const status=process.argv.includes('--package-only')?0:await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(source,'node_modules/next/dist/bin/next'),'build','--webpack'],{cwd:work,stdio:'inherit',windowsHide:true,env:{...process.env,GITHUB_PAGES:'true',NEXT_PUBLIC_BASE_PATH:'/statoz-next-sports-web',NEXT_TELEMETRY_DISABLED:'1'}});child.on('error',reject);child.on('exit',resolve)});
if(status!==0)throw new Error('Sports Web build failed; the previous packaged app is preserved.');
// Preserve a working package until the fresh source build has succeeded.
const staged=path.join(root,'.cache/sports-package-'+Date.now());
await fs.cp(path.join(work,'out'),staged,{recursive:true});
const {fixStaticPrefetch}=await import(pathToFileURL(path.join(source,'scripts/fix-static-prefetch.mjs')).href);
const aliases=await fixStaticPrefetch(staged);
await fs.copyFile(path.join(root,'scripts/sports-frame-bridge.js'),path.join(staged,'case-study-bridge.js'));
async function installBridge(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await installBridge(file);else if(entry.name.endsWith('.html')){const html=await fs.readFile(file,'utf8');await fs.writeFile(file,html.replace('<head>','<head><script src="/statoz-next-sports-web/case-study-bridge.js"></script>'));}}}
await installBridge(staged);
const backup=path.join(root,'.cache/previous-sports-package-'+Date.now());
for(const target of [staged,destination,backup]){const relative=path.relative(root,path.resolve(target));if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Package path escaped the case-study directory.');}
if(await fs.stat(destination).catch(()=>null))await fs.rename(destination,backup);
await fs.rename(staged,destination);
await fs.mkdir(path.join(root,'public/data'),{recursive:true});
await fs.writeFile(path.join(root,'public/data/sports-web-build.json'),JSON.stringify({product:'StatOz Sports Web',source:'../statoz-sports-web',method:'Unmodified source compiled in an isolated case-study directory',builtAt:new Date().toISOString(),mobileViewport:{width:390,height:844},basePath:'/statoz-next-sports-web',navigationAliases:aliases,sourceFiles},null,2));
console.log('Packaged the actual current Sports Web app. Source product files remain unchanged.');
