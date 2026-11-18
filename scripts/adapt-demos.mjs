import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
let replacements=0,aliases=0;
async function walk(directory,base=directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory()){await walk(file,base);continue;}
 if(entry.name.endsWith('.js')&&!file.includes(path.sep+'game-library'+path.sep)){const text=await fs.readFile(file,'utf8');let next=text.replaceAll('http://127.0.0.1:4405/catalogue.json','http://127.0.0.1:4413/statoz-next-games-web/game-library/catalogue.json').replaceAll('https://pai45.github.io/statoz-next-games-web/game-library/catalogue.json','http://127.0.0.1:4413/statoz-next-games-web/game-library/catalogue.json');
 // The copied older host SDK bases relative game links at the catalogue root.
 // Resolve relative HTML attributes against the accepted entry URL AFTER its
 // SHA check, so multi-file games load their own styles/scripts. Artifact files stay byte-identical.
 next=next.replace('html:new TextDecoder().decode(c),entry:s,root:new URL("./",r).href','html:new TextDecoder().decode(c).replace(/(src|href)=(["\x27])(\\.\\/[^"\x27]+)\\2/g,(_m,k,q,v)=>k+"="+q+new URL(v,n).href+q),entry:s,root:new URL("./",r).href');
 next=next.replace('<base href=${JSON.stringify(t.artifactRoot)}>','<base href=${JSON.stringify(new URL("./",e.match(/<link rel="stylesheet" href="(http[^" ]+)"/)?.[1]||t.artifactRoot).href)}>');
 if(next!==text){await fs.writeFile(file,next);replacements++;}}
 const relative=path.relative(base,file),parts=relative.split(path.sep),index=parts.findIndex(p=>p.startsWith('__next.'));
 if(index>=0&&index<parts.length-1&&entry.name.endsWith('.txt')){const target=path.join(base,...parts.slice(0,index),parts.slice(index).join('.'));const bytes=await fs.readFile(file);await fs.writeFile(target,bytes);aliases++;}
}}
for(const product of ['sports','games'])await walk(path.join(root,'demos',product));
console.log(`Localized ${replacements} catalogue references; created ${aliases} static navigation aliases. Source projects unchanged.`);
