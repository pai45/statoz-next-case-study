import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']}),records=[];
await fs.mkdir('public/assets/current-games',{recursive:true});
try{const context=await browser.newContext({viewport:{width:852,height:393},deviceScaleFactor:2});context.setDefaultTimeout(45000);
 for(const [name,route] of [['home','/'],['longbow','/play/longbow/'],['rally','/play/rally/'],['yorker','/play/yorker/'],['hoop-legacy','/play/hoop-legacy/']]){const page=await context.newPage();await page.goto('http://127.0.0.1:4413/statoz-next-games-web'+route);if(name==='home'){await page.locator('main').first().waitFor();await page.waitForTimeout(1100);}else{await page.locator('iframe').waitFor();const frame=await(await page.locator('iframe').elementHandle()).contentFrame();const ready=name==='longbow'?/PLAY FIRST DRAW/:name==='rally'?/QUICK START/:name==='yorker'?/PLAY FIRST SPELL/:/Build your legacy/i;await frame.getByRole('button',{name:ready}).first().waitFor();await page.waitForTimeout(900);}await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'public/assets/current-games/'+name+'.png',timeout:15000});records.push({file:'assets/current-games/'+name+'.png',source:'Actual current Games Web app and accepted playable game runtime',route,viewport:{width:852,height:393},deviceScaleFactor:2,sha256:crypto.createHash('sha256').update(await fs.readFile('public/assets/current-games/'+name+'.png')).digest('hex')});console.log('Captured actual Games '+name);await page.close();}
 await fs.writeFile('public/data/current-games-captures.json',JSON.stringify(records,null,2));
}finally{await browser.close()}
