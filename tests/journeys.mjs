import {revealPhase} from './presenter-reveal.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {clickInDemo} from './demo-pointer.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
const failures=[],errors=[],requests=[],results=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
await context.route('**/*',route=>{const u=route.request().url();if(u.startsWith('http')&&!/^http:\/\/127\.0\.0\.1:441[123]\//.test(u)){requests.push(u);return route.abort()}return route.continue()});
const page=await context.newPage();page.setDefaultTimeout(15000);
async function run(name,fn){try{await fn();results.push({name,status:'passed'});console.log('PASS',name)}catch(e){failures.push({name,error:e.message});results.push({name,status:'failed'});console.log('FAIL',name,e.message);await page.screenshot({path:'test-results/journey-failure-'+failures.length+'.png',fullPage:true})}}
await run('Popup-blocked fallback and audience keyboard/fullscreen controls',async()=>{
 const p=await context.newPage();await p.addInitScript(()=>{window.open=()=>null});await p.goto('http://127.0.0.1:4411/presenter');await p.getByRole('button',{name:'Open audience window'}).click();await p.getByText(/popup was blocked/).waitFor();const href=await p.getByRole('link',{name:'Open audience manually'}).getAttribute('href');const a=await context.newPage();await a.goto('http://127.0.0.1:4411'+href);await a.locator('.hero-copy').waitFor();await a.locator('.hero-copy h1').click();await a.keyboard.press('b');await a.locator('.blackout-screen').waitFor();await a.keyboard.press('Escape');await a.locator('.hero-copy').waitFor();await a.getByRole('button',{name:'Toggle fullscreen'}).click();assert.ok(await a.evaluate(()=>!!document.fullscreenElement));await a.evaluate(()=>document.exitFullscreen());await a.close();await p.close();
});
await fs.writeFile('test-results/journey-results.json',JSON.stringify({results,failures,errors,external:requests},null,2));await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);if(failures.length)process.exitCode=1;
