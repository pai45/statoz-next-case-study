import {revealPhase} from './presenter-reveal.mjs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {metrics} from '../src/metrics.mjs';
import {clickInDemo} from './demo-pointer.mjs';
await fs.mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
const errors=[],failedResponses=[],external=[],results=[];
await context.route('**/*',route=>{const url=route.request().url();if(url.startsWith('http')&&!/^http:\/\/127\.0\.0\.1:441[123]\//.test(url)){external.push(url);return route.abort()}return route.continue()});
context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failedResponses.push(r.status()+' '+r.url())})});
const page=await context.newPage();page.setDefaultTimeout(15000);
async function step(name,run){try{await run();results.push({name,status:'passed'});console.log('PASS',name)}catch(e){results.push({name,status:'failed',error:e.message});console.log('FAIL',name,e.message);await page.screenshot({path:'test-results/failure-'+results.length+'.png',fullPage:true}).catch(()=>{})}}
const open=path=>page.goto('http://127.0.0.1:4411'+path);
const screenshot=name=>page.screenshot({path:'test-results/'+name+'.png',fullPage:true});
let presenter,audience;
await step('Homepage, all chapters and responsive layout',async()=>{
 await open('/');await page.locator('h1').filter({hasText:'A daily home.'}).waitFor();await screenshot('home-desktop');
 for(const id of ['opportunity','sports','predictions','quizzes','admin','games','studio','traction','business','investment','data']){await open('/#'+id);await page.locator('.chapter-intro h1').waitFor();assert.ok((await page.locator('h1').innerText()).length>10);}
 for(const width of [390,768,1024,1440]){await page.setViewportSize({width,height:900});await open('/');await page.locator('.hero-copy').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow at '+width);if(width===390){await screenshot('home-mobile');await page.getByRole('button',{name:'Toggle chapter navigation'}).click();await page.locator('.chapter-nav.open').waitFor();await page.getByRole('button',{name:/Sports knowledge/}).click();await page.locator('h1').filter({hasText:'Know the game?'}).waitFor();}}
 await page.setViewportSize({width:1440,height:1000});
});
await step('Data search, filters, CSV download and original PDF',async()=>{
 await open('/data');await page.locator('.data-sheet>.data-table-wrap tbody tr').first().waitFor();assert.equal(await page.locator('.data-sheet>.data-table-wrap tbody tr').count(),metrics.length);
 await page.getByPlaceholder('Try predictions, October, coins…').fill('October');assert.ok(await page.locator('.data-sheet>.data-table-wrap tbody tr').count()<metrics.length);
 await page.getByPlaceholder('Try predictions, October, coins…').fill('');await page.getByLabel('Show reconciliation notes only').check();assert.equal(await page.locator('.data-sheet>.data-table-wrap tbody tr').count(),metrics.filter(m=>m.status==='Needs reconciliation').length);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV'}).click();const d=await download;await d.saveAs('test-results/downloaded-data.csv');const csv=await fs.readFile('test-results/downloaded-data.csv','utf8');assert.equal(csv.split('\r\n').length,metrics.length+1);
 const report=await context.request.get('http://127.0.0.1:4411/data/statoz-by-the-numbers-nov-2026.pdf');assert.equal(report.status(),200);assert.ok((await report.body()).subarray(0,4).toString()==='%PDF');
 await page.getByLabel('Show reconciliation notes only').uncheck();await screenshot('data-sheet');
});
await step('Local Admin reference charts and match filters',async()=>{
 await open('/admin?workspace=browser-smoke');await page.getByRole('heading',{name:'Dashboard',exact:true}).waitFor();await page.getByLabel('Reporting period').selectOption('3');assert.match(await page.locator('.financial').innerText(),/50[\s\S]*42[\s\S]*97/);
 await page.getByRole('navigation',{name:'Admin pages'}).getByRole('button',{name:'Weekly trends',exact:true}).click();await page.getByRole('heading',{name:'Weekly trends',exact:true}).waitFor();await page.getByRole('navigation',{name:'Admin pages'}).getByRole('button',{name:'Matches',exact:true}).click();await page.getByLabel('Filter by sport').selectOption('Football');assert.equal(await page.locator('.adm-match').count(),1);await screenshot('admin');
});
await step('Private presenter, audience sync, notes, reorder, hide, blackout and reconnect',async()=>{
 presenter=await context.newPage();await presenter.goto('http://127.0.0.1:4411/presenter');const popup=presenter.waitForEvent('popup');await presenter.getByRole('button',{name:'Open audience window'}).click();audience=await popup;await audience.waitForLoadState();await presenter.getByText('Audience window connected',{exact:true}).waitFor();
 await presenter.locator('.run-select').filter({hasText:'StatOz Sports'}).click();await audience.locator('h1').filter({hasText:'Every match.'}).waitFor();await presenter.getByRole('textbox',{name:/SPEAKER NOTES/}).fill('PRIVATE TEST NOTE — never on audience');assert.ok(!(await audience.locator('body').innerText()).includes('PRIVATE TEST NOTE'));
 const sportsBefore=(await presenter.locator('.run-select').allInnerTexts()).findIndex(text=>text.includes('StatOz Sports'));await presenter.getByRole('button',{name:'Move StatOz Sports up',exact:true}).click();await presenter.waitForFunction(index=>document.querySelectorAll('.run-select')[index]?.textContent.includes('StatOz Sports'),sportsBefore-1);assert.match(await presenter.locator('.run-select').nth(sportsBefore-1).innerText(),/StatOz Sports/);
 await presenter.getByRole('button',{name:'Hide The business model',exact:true}).click();await presenter.getByRole('button',{name:'Show The business model',exact:true}).waitFor();
 await presenter.getByRole('button',{name:'Screens',exact:true}).click();await audience.locator('.screen-display img').waitFor();await presenter.getByRole('button',{name:'2. Match statistics',exact:true}).click();await audience.waitForFunction(()=>document.querySelector('.screen-display img')?.getAttribute('src')?.includes('current-sports/stats'));
 await presenter.getByRole('button',{name:'Blackout screen'}).click();await audience.locator('.blackout-screen').waitFor();assert.equal(await audience.locator('video,iframe').count(),0);await presenter.getByRole('button',{name:'Restore audience'}).click();await audience.locator('.screen-display').waitFor();await audience.reload();await audience.locator('.screen-display img').waitFor();assert.match(await audience.locator('.screen-display img').getAttribute('src'),/current-sports\/stats/);
 await presenter.screenshot({path:'test-results/presenter.png',fullPage:true});await audience.screenshot({path:'test-results/audience.png',fullPage:true});
});
await step('Presenter video playback, seek, pause and chapter cleanup',async()=>{
 await presenter.getByRole('button',{name:'Video',exact:true}).click();await audience.locator('.video-stage video').waitFor();await presenter.getByRole('button',{name:'Play',exact:true}).click();await audience.waitForFunction(()=>{const v=document.querySelector('.video-stage video');return v&&!v.paused&&v.currentTime>14});console.log('VIDEO started');
 await presenter.getByRole('button',{name:'Pause',exact:true}).click();await audience.waitForFunction(()=>document.querySelector('.video-stage video')?.paused);console.log('VIDEO paused');
 await presenter.getByRole('slider',{name:'Seek audience video'}).fill('18');await audience.waitForFunction(()=>Math.abs(document.querySelector('.video-stage video').currentTime-18)<.2);console.log('VIDEO seeked');
 await presenter.locator('.run-select').filter({hasText:'StatOz Admin'}).click();await audience.locator('h1').filter({hasText:'Behind the play.'}).waitFor();assert.equal(await audience.locator('.video-stage video').count(),0);
});
await step('Interactive Studio model loading, animation and camera controls',async()=>{
 await open('/studio');await page.waitForFunction(()=>document.querySelectorAll('select option').length>1);await page.getByRole('button',{name:'Pause animation'}).click();await page.getByRole('button',{name:'Play animation'}).waitFor();await page.getByRole('slider',{name:/Exposure/}).fill('1.5');await page.getByRole('button',{name:'Reset camera'}).click();await page.locator('.model-overlay').waitFor({state:'hidden'});await screenshot('studio');
 await page.getByRole('button',{name:/Formula car/}).click();await page.locator('.model-overlay').waitFor({state:'hidden'});assert.equal(await page.locator('canvas').count(),1);await page.getByRole('button',{name:/Cricketer player/}).click();await page.locator('.model-overlay').waitFor({state:'hidden'});
});
await step('No application errors, failed resources or external runtime dependencies',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(failedResponses,[]);assert.deepEqual(external,[])});
await fs.writeFile('test-results/browser-results.json',JSON.stringify({results,errors,failedResponses,external},null,2));await browser.close();if(results.some(r=>r.status==='failed'))process.exitCode=1;
