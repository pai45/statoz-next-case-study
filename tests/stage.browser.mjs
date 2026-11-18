/** Investor stage: every chapter fits one screen, builds advance before chapters, call cards sync, reduced motion is final. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4411';
await fs.mkdir('test-results/stage',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const failures=[],errors=[],external=[];
async function context(options={}){const ctx=await browser.newContext({serviceWorkers:'block',...options});ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));await ctx.route('**/*',route=>{const u=route.request().url();if(u.startsWith('http')&&!/^http:\/\/127\.0\.0\.1:441[123]\//.test(u)){external.push(u);return route.abort()}return route.continue()});return ctx}
async function pair(ctx){const session='stage-'+Date.now()+Math.random().toString(16).slice(2,6);const investor=await ctx.newPage(),desk=await ctx.newPage();investor.setDefaultTimeout(20000);desk.setDefaultTimeout(20000);await investor.goto(base+'/present?session='+session);await desk.goto(base+'/presenter?session='+session);await desk.getByText('Audience window connected',{exact:true}).waitFor();return {investor,desk}}
async function choose(desk,label){await desk.locator('.run-select').filter({hasText:label}).first().click();await desk.locator('.run-row.selected').filter({hasText:label}).waitFor()}
async function run(name,fn){try{await fn();console.log('PASS',name)}catch(e){failures.push(name);console.log('FAIL',name,e.message)}}

for(const [width,height] of [[1280,720],[1440,900],[1920,1080]]){
 await run(`every chapter fits ${width} × ${height} without scrolling`,async()=>{
  const ctx=await context({viewport:{width,height},reducedMotion:'reduce'}),{investor,desk}=await pair(ctx);
  const labels=(await desk.locator('.run-select b').allInnerTexts());
  for(const label of labels){
   await choose(desk,label);await investor.locator('.stage-slide').waitFor();
   const builds=desk.locator('.desk-builds button');const count=await builds.count();if(count)await builds.nth(count-1).click();
   await investor.waitForTimeout(250);
   const box=await investor.evaluate(()=>{const c=document.querySelector('.stage-canvas').getBoundingClientRect();return {scroll:document.scrollingElement.scrollHeight-innerHeight,overflowX:document.scrollingElement.scrollWidth-innerWidth,left:c.left,top:c.top,right:c.right,bottom:c.bottom}});
   assert.ok(box.scroll<=0&&box.overflowX<=0,`${label} scrolls at ${width}×${height}`);
   assert.ok(box.left>=-1&&box.top>=-1&&box.right<=width+1&&box.bottom<=height+1,`${label} canvas leaves the window`);
   const device=await investor.evaluate(()=>{const d=document.querySelector('.stage-slide .device-frame');if(!d)return null;const r=d.getBoundingClientRect(),c=document.querySelector('.stage-canvas').getBoundingClientRect();return r.left>=c.left-2&&r.top>=c.top-2&&r.right<=c.right+2&&r.bottom<=c.bottom+2});
   assert.notEqual(device,false,`${label} device frame is cut off`);
  }
  await investor.screenshot({path:`test-results/stage/last-${width}.png`});await ctx.close();
 });
}

await run('builds advance before the chapter changes; previous chapter returns fully built',async()=>{
 const ctx=await context({viewport:{width:1440,height:900}}),{investor,desk}=await pair(ctx);
 await choose(desk,'The opportunity');await investor.locator('.s-opportunity').waitFor();
 const shown=()=>investor.locator('.s-opportunity .build.in').count();
 assert.equal(await shown(),1);
 await desk.locator('.desk-reveal').click();await investor.waitForFunction(()=>document.querySelectorAll('.s-opportunity .build.in').length===2);
 await desk.locator('.desk-reveal').click();await investor.waitForFunction(()=>document.querySelectorAll('.s-opportunity .build.in').length===3);
 assert.match(await desk.locator('.desk-reveal').innerText(),/Next: StatOz Sports/);
 await desk.locator('.desk-reveal').click();await investor.locator('.s-product').waitFor();
 await desk.locator('body').click({position:{x:5,y:5}});await desk.keyboard.press('ArrowLeft');
 await investor.waitForFunction(()=>document.querySelectorAll('.s-opportunity .build.in').length===3);
 await ctx.close();
});

await run('opening question is removed and Traction retains its sourced figures',async()=>{
 const ctx=await context({viewport:{width:1440,height:900},reducedMotion:'reduce'}),{investor,desk}=await pair(ctx);
 assert.equal(await desk.locator('.run-select').filter({hasText:'Make your call'}).count(),0);
 await choose(desk,'The introduction');await desk.locator('.desk-reveal').click();await investor.locator('.s-frag').waitFor();
 assert.equal(await investor.locator('.stage-page').innerText(),'02 / 15');
 for(let build=0;build<3;build++)await desk.locator('.desk-reveal').click();await investor.locator('.s-opportunity').waitFor();
 assert.equal(await investor.locator('.stage-page').innerText(),'03 / 15');
 await choose(desk,'Traction');await investor.locator('.s-answer').waitFor();
 assert.match(await investor.locator('.s-answer').innerText(),/Downloads\s+25,131/i);
 assert.equal(await investor.locator('.s-verdict').count(),0);
 await desk.getByRole('button',{name:'Show build 3'}).click();
 await investor.waitForFunction(()=>document.querySelector('.s-tiles')?.classList.contains('in'));
 assert.match(await investor.locator('.s-tiles').innerText(),/6m 40s\s+Average session time[\s\S]*300\+\s+Daily active users[\s\S]*26\.9%\s+Returning user rate[\s\S]*13,641\s+Events registered/);
 assert.match(await investor.locator('.s-tiles').innerText(),/10,798[\s\S]*52%[\s\S]*16\.0[\s\S]*17%/);
 await ctx.close();
});

await run('Thank you closes the pitch without prediction controls',async()=>{
 const ctx=await context({viewport:{width:1440,height:900},reducedMotion:'reduce'}),{investor,desk}=await pair(ctx);
 await desk.getByRole('button',{name:'10-min pitch',exact:true}).click();
 await choose(desk,'Thank you');
 await investor.getByRole('heading',{name:'Thank you',exact:true}).waitFor();
 assert.equal(await investor.locator('.stage-body').innerText(),'Thank you');
 assert.equal(await desk.getByRole('button',{name:'Lock prediction',exact:true}).count(),0);
 assert.match(await desk.locator('.desk-reveal').innerText(),/End of run/);
 await ctx.close();
});

await run('investor screen hides founder placeholders; desk preview shows them',async()=>{
 const ctx=await context({viewport:{width:1440,height:900}}),{investor,desk}=await pair(ctx);
 await choose(desk,'Market & position');await desk.locator('.desk-builds button').last().click();await investor.locator('.s-market').waitFor();
 assert.equal(await investor.locator('.founder-fill').count(),0);
 assert.ok(await desk.locator('.desk-preview .founder-fill').count()>0);
 await choose(desk,'Free to play');await investor.locator('.s-free').waitFor();
 assert.doesNotMatch(await investor.locator('.s-free').innerText(),/cash/i);
 await ctx.close();
});

await run('reduced motion shows final values without animation',async()=>{
 const ctx=await context({viewport:{width:1440,height:900},reducedMotion:'reduce'}),{investor,desk}=await pair(ctx);
 await choose(desk,'Traction');await investor.locator('.s-answer').waitFor();
 assert.match(await investor.locator('.s-answer').innerText(),/Downloads\s+25,131/i);
 assert.equal(await investor.locator('.stage-wipe').evaluate(el=>getComputedStyle(el).display),'none');
 await ctx.close();
});

await browser.close();
console.log(JSON.stringify({failures,errors,external}));
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);if(failures.length)process.exitCode=1;
