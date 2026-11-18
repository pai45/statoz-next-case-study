import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const browser=await chromium.launch({channel:'chrome',headless:true}),records=[];
await fs.mkdir('public/assets/current-admin',{recursive:true});
try{const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:2,reducedMotion:'reduce'}),page=await context.newPage();
 for(const id of ['dashboard','stats','weekly','matches','quizzes','predictions','users','payments','assets']){
  await page.goto('http://127.0.0.1:4411/admin?workspace=capture-'+Date.now()+'&page='+id);await page.locator('.adm-main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
  const file='assets/current-admin/'+id+'.png';await page.screenshot({path:'public/'+file});records.push({file,route:'/admin?page='+id,source:'Local interactive reconstruction; original dashboard, weekly trends and matches supplied as admin-1.png through admin-3.png; remaining screens are local demo extensions',viewport:{width:1280,height:800},deviceScaleFactor:2,sha256:crypto.createHash('sha256').update(await fs.readFile('public/'+file)).digest('hex')});console.log('Captured Admin '+id);
 }
 await fs.writeFile('public/data/current-admin-captures.json',JSON.stringify(records,null,2));
}finally{await browser.close()}
