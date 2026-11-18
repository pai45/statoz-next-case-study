import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
function build(script){const result=spawnSync(process.execPath,[script],{cwd:root,stdio:'inherit',env:{...process.env,STATOZ_BASE_PATH:'',STATOZ_BUILD_DIRECTORY:'dist'}});if(result.error)throw result.error;assert.equal(result.status,0,script);}
async function snapshot(directory,relative='',files={}){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const name=relative?relative+'/'+entry.name:entry.name,file=path.join(directory,entry.name);if(entry.isDirectory())await snapshot(file,name,files);else files[name]=crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');}return files;}
build('scripts/build.mjs');
const before=await snapshot(path.join(root,'dist'));
build('scripts/build-pages.mjs');
assert.deepEqual(await snapshot(path.join(root,'dist')),before,'Building Pages must leave every local build file unchanged');
console.log('PASS Pages build leaves the complete local dist output unchanged.');
