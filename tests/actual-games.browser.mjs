import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {pointInGame,tapInGame} from './game-pointer.mjs';
const base='http://127.0.0.1:4411';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
await fs.mkdir('test-results/actual-games',{recursive:true});
async function app(page){await page.locator('.games-product-frame').waitFor();return (await page.locator('.games-product-frame').elementHandle()).contentFrame();}
async function gameFrame(page){const host=await app(page);await host.locator('iframe').waitFor();const game=await(await host.locator('iframe').elementHandle()).contentFrame();await game.locator('canvas').waitFor();return game;}
try{
 const context=await browser.newContext({viewport:{width:1500,height:1000}}),errors=[],failed=[];context.setDefaultTimeout(45000);
 context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url());});});
 const investor=await context.newPage(),presenter=await context.newPage(),session='games-'+Date.now();
 await investor.goto(base+'/present?session='+session);await presenter.goto(base+'/presenter?session='+session);
 await presenter.locator('.run-select').filter({hasText:'StatOz Games'}).click();
 let pf=await app(presenter),af=await app(investor);await af.getByRole('button',{name:'Game Library',exact:true}).first().waitFor();
 assert.deepEqual(await af.evaluate(()=>({width:innerWidth,height:innerHeight})),{width:852,height:393});
 assert.equal(await investor.locator('.guided-frame').count(),0);assert.equal(await af.locator('.walk-runtime,.games-discovery').count(),0);
 await investor.bringToFront();await tapInGame(investor,af,af.getByRole('button',{name:'Game Library',exact:true}).first());
 await af.getByRole('heading',{name:'Game Library',exact:true}).waitFor();await pf.getByRole('heading',{name:'Game Library',exact:true}).waitFor();
 await tapInGame(investor,af,af.getByRole('tab',{name:'Cricket',exact:true}));
 await pf.waitForFunction(()=>Array.from(document.querySelectorAll('[role="tab"]')).some(e=>e.textContent.trim()==='Cricket'&&e.getAttribute('aria-selected')==='true'));
 await tapInGame(investor,af,af.getByRole('button',{name:'Search games',exact:true}));await af.getByRole('searchbox').fill('Yorker');
 await pf.waitForFunction(()=>Array.from(document.querySelectorAll('input')).some(e=>e.value==='Yorker'));
 await investor.screenshot({path:'test-results/actual-games/library-desktop.png',fullPage:true});
 console.log('PASS actual Games home, native library navigation, sport filter and mirrored search');
 const controls=presenter.getByRole('tablist',{name:'Launch a real game'});assert.equal(await controls.getByRole('tab').count(),5);
 for(const [label,route] of [['Longbow','longbow'],['Rally Dash','rally'],['Yorker','yorker'],['Hoop Legacy','hoop-legacy']]){
  await controls.getByRole('tab',{name:label,exact:true}).click();
  for(const p of [investor,presenter])await p.waitForFunction(route=>document.querySelector('.games-product-frame')?.getAttribute('src')?.includes('/play/'+route+'/'),route);
  await investor.bringToFront();const frame=await gameFrame(investor);
  if(route==='longbow'){
   await tapInGame(investor,frame,frame.getByRole('button',{name:/PLAY FIRST DRAW/}));await frame.getByText(/Hold anywhere to draw/).waitFor();
   const p=await pointInGame(investor,frame,frame.locator('canvas'));await investor.mouse.move(p.x,p.y);await investor.mouse.down();await investor.waitForTimeout(800);await investor.mouse.move(p.x,p.y-12,{steps:8});await investor.mouse.up();
   await frame.getByText('M',{exact:true}).waitFor();
  }else if(route==='rally'){
   await tapInGame(investor,frame,frame.getByRole('button',{name:/QUICK START/}));await investor.waitForTimeout(3500);
   await investor.keyboard.down('ArrowUp');await frame.waitForFunction(()=>/\b[1-9]\d*\nKM\/H/.test(document.body.innerText));await investor.keyboard.up('ArrowUp');
  }else if(route==='yorker'){
   await frame.waitForFunction(()=>!document.body.innerText.includes('PREPARING THE PITCH'));
   await tapInGame(investor,frame,frame.getByRole('button',{name:/PLAY FIRST SPELL/}));await tapInGame(investor,frame,frame.getByRole('button',{name:/TAKE THE BALL/}));
   await tapInGame(investor,frame,frame.getByRole('button',{name:/^BOWL/}));await investor.waitForTimeout(1400);await investor.keyboard.press('Space');
   await frame.waitForFunction(()=>/DOT BALL|FOUR|SIX|WICKET|RUNS|Left alone/.test(document.body.innerText));
  }else{
   await tapInGame(investor,frame,frame.getByRole('button',{name:/Build your legacy/i}));await tapInGame(investor,frame,frame.getByRole('button',{name:/3PT/}));await tapInGame(investor,frame,frame.getByRole('button',{name:/Start Contest/i}));
   await frame.waitForFunction(()=>/TIME\n(?:5[0-9]|4[0-9])\nSCORE/.test(document.body.innerText));
   const p=await pointInGame(investor,frame,frame.locator('canvas'));await investor.mouse.click(p.x,p.y);await investor.keyboard.down('Space');await investor.waitForTimeout(550);await investor.keyboard.up('Space');
   // Native rack marker proves a shot resolved, regardless of make or miss.
   await frame.locator('span[class*="bg-bad"],span[class*="bg-good"],span[class*="bg-gold"]').first().waitFor();
  }
  await investor.screenshot({path:'test-results/actual-games/'+route+'-in-presentation.png',fullPage:true});
  console.log('PASS real '+label+' engine and native gameplay inside the investor landscape frame');
 }
 af=await app(investor);const stamp=await af.evaluate(()=>performance.timeOrigin);
 for(const width of [390,768,1024,1440]){await investor.setViewportSize({width,height:1000});await investor.waitForTimeout(100);assert.ok(await investor.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(await af.evaluate(()=>({width:innerWidth,height:innerHeight,stamp:performance.timeOrigin})),{width:852,height:393,stamp});const ratio=await investor.locator('.live-games-device .device-screen').evaluate(e=>e.clientWidth/e.clientHeight);assert.ok(Math.abs(ratio-852/393)<.02);}
 await investor.setViewportSize({width:390,height:844});await investor.screenshot({path:'test-results/actual-games/mobile.png',fullPage:true});
 const manifest=JSON.parse(await fs.readFile('public/data/games-web-build.json','utf8'));
 for(const file of manifest.sourceFiles)assert.equal(crypto.createHash('sha256').update(await fs.readFile('../statoz-games-web/'+file.path)).digest('hex'),file.sha256,'Current product source: '+file.path);
 for(const game of manifest.selectedGames){const response=await context.request.get('http://127.0.0.1:4413/statoz-next-games-web/game-library/'+game.entry);assert.equal(response.status(),200);assert.equal(crypto.createHash('sha256').update(await response.body()).digest('hex'),game.sha256,game.title+' accepted artifact unchanged');}
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 console.log('PASS responsive frame continuity, current source and four unchanged accepted game artifacts; no page/resource errors');
}catch(error){for(const context of browser.contexts())for(const [i,p] of context.pages().entries()){console.log('Failure page',p.url());for(const f of p.frames())console.log(f.url(),(await f.locator('body').innerText().catch(()=>'')).slice(0,800));await p.screenshot({path:'test-results/actual-games/failure-'+i+'.png',fullPage:true,timeout:5000}).catch(()=>{});}throw error;}finally{await browser.close()}
