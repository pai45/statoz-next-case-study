import fs from 'node:fs/promises';
import path from 'node:path';
/** Copy only real files/directories, with bounded I/O for the large exported app. */
export async function fastCopy(source,destination){
 const info=await fs.lstat(source);if(info.isSymbolicLink())throw Error('Linked packaging input: '+source);
 if(info.isFile()){await fs.mkdir(path.dirname(destination),{recursive:true});await fs.copyFile(source,destination);return;}
 await fs.mkdir(destination,{recursive:true});
 const entries=await fs.readdir(source,{recursive:true,withFileTypes:true});const files=[];
 for(const entry of entries){if(entry.isSymbolicLink())throw Error('Linked packaging input: '+entry.name);const file=path.join(entry.parentPath||entry.path,entry.name),relative=path.relative(source,file);if(entry.isDirectory())await fs.mkdir(path.join(destination,relative),{recursive:true});else if(entry.isFile())files.push([file,path.join(destination,relative)]);}
 let index=0;await Promise.all(Array.from({length:16},async()=>{while(index<files.length){const [from,to]=files[index++];await fs.copyFile(from,to);}}));
}
