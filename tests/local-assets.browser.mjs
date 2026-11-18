import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
await fs.mkdir('test-results/local-assets',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),failed=[],errors=[];
 context.on('page',page=>{page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url())});});
 const page=await context.newPage();
 for(const route of ['/','/#opportunity','/#sports','/#predictions','/#quizzes','/#games','/#admin','/#investment','/data']){
  await page.goto('http://127.0.0.1:4411'+route);
  await page.locator('h1').first().waitFor();
  const images=await page.locator('img').evaluateAll(async images=>Promise.all(images.map(async img=>{img.loading='eager';await img.decode().catch(()=>{});return {src:img.currentSrc||img.src,width:img.naturalWidth}})));
  assert.deepEqual(images.filter(img=>img.width===0),[],'Broken images on '+route);
  assert.ok(images.every(img=>!new URL(img.src).pathname.startsWith('/statoz-next-case-study/')),'Local images must use local asset URLs');
 }
 await page.goto('http://127.0.0.1:4411/');
 await page.locator('.hero-copy').waitFor();
 await page.screenshot({path:'test-results/local-assets/desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/local-assets/mobile.png',fullPage:true});
 assert.deepEqual(failed,[],'Failed local resources');assert.deepEqual(errors,[],'Browser errors');
 console.log('PASS local images, embedded product requests and assets across homepage, eight chapters and data sheet.');
 await context.close();
}finally{await browser.close()}
