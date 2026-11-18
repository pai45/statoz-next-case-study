import {revealPhase} from './presenter-reveal.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const browser=await chromium.launch({channel:'chrome',headless:true});
await fs.mkdir('test-results/revision',{recursive:true});
try{const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 const records=JSON.parse(await fs.readFile('public/data/current-games-captures.json','utf8'));assert.equal(records.length,5);
 for(const record of records){assert.equal(crypto.createHash('sha256').update(await fs.readFile('public/'+record.file)).digest('hex'),record.sha256);assert.deepEqual(record.viewport,{width:852,height:393});}
 console.log('PASS five actual current Games landscape captures and provenance');
 for(const width of [390,768,1024,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4411/');await page.waitForFunction(()=>document.querySelector('.hero-games-device img')?.naturalWidth>0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const ratio=await page.locator('.hero-games-device .device-screen').evaluate(e=>e.clientWidth/e.clientHeight);assert.ok(Math.abs(ratio-852/393)<.02);
  await page.goto('http://127.0.0.1:4411/#games');await page.locator('.games-product-frame').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`test-results/revision/games-${width}.png`,fullPage:true});
 }
 console.log('PASS responsive real Games devices at 390, 768, 1024 and 1440 widths');
 await revealPhase(page,'screens');await page.locator('.landscape-gallery .device-frame').waitFor();
 for(const id of ['home','longbow','rally','yorker','hoop-legacy']){
  await page.waitForFunction(id=>document.querySelector('.screen-display img')?.getAttribute('src')?.endsWith('/'+id+'.png'),id);
  await page.waitForFunction(()=>document.querySelector('.screen-display img')?.naturalWidth>0);
  if(id!=='hoop-legacy')await page.getByRole('button',{name:'Next screen'}).click();
 }
 console.log('PASS five-screen source Games gallery');
 await page.getByRole('button',{name:'Back to introduction'}).click();await revealPhase(page,'demo');
 const frame=await(await page.locator('.games-product-frame').elementHandle()).contentFrame();const before=await frame.evaluate(()=>({width:innerWidth,height:innerHeight,timeOrigin:performance.timeOrigin}));assert.equal(before.width,852);assert.equal(before.height,393);
 await page.setViewportSize({width:390,height:844});assert.deepEqual(await frame.evaluate(()=>({width:innerWidth,height:innerHeight,timeOrigin:performance.timeOrigin})),before);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'test-results/revision/real-games-mobile.png',fullPage:true});console.log('PASS frame continuity on resize');
}finally{await browser.close()}
