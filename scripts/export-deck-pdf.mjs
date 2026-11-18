import {chromium} from 'playwright';
import {transform} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),work=path.join(root,'tmp/pdfs/current-deck');
await fs.mkdir(work,{recursive:true});
const code=await transform(await fs.readFile(path.join(root,'src/content.ts'),'utf8'),{loader:'ts',format:'esm'});
const {chapters,defaultOrder}=await import('data:text/javascript;base64,'+Buffer.from(code.code).toString('base64'));
const browser=await chromium.launch({channel:'chrome',headless:true}),slides=[],errors=[],failed=[];
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:2,reducedMotion:'reduce',serviceWorkers:'block'});
 context.on('page',p=>{p.on('pageerror',error=>errors.push(error.message));p.on('response',response=>{if(response.status()>=400)failed.push(response.status()+' '+response.url())});});
 await context.route('**/*',route=>{const url=route.request().url();return url.startsWith('http')&&!/^http:\/\/127\.0\.0\.1:441[123]\//.test(url)?route.abort():route.continue()});
 for(const [index,id] of defaultOrder.entries()){
  const chapter=chapters.find(c=>c.id===id),page=await context.newPage(),session='pdf-'+Date.now()+'-'+id;
  await page.addInitScript(({session,id,order,step})=>{
   localStorage.setItem('statoz.case.session.'+session,JSON.stringify({chapter:id,phase:'intro',step,target:0,screen:0,order,hidden:[],blackout:false}));
  },{session,id,order:defaultOrder,step:Math.max(0,(chapter.steps||1)-1)});
  await page.goto('http://127.0.0.1:4411/present?session='+session);
  await page.locator('.stage-slide').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'.stage-fullscreen,.audience-toggle,.audience-controls-toggle,.audience-toolbar{display:none!important}*,*::before,*::after{caret-color:transparent!important;animation-play-state:paused!important}'});
  await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(img=>img.complete&&img.naturalWidth>0),{},{timeout:20000});
  for(const product of await page.locator('.sports-product-frame,.games-product-frame,.admin-product-frame').elementHandles()){
   const frame=await product.contentFrame();await frame.waitForLoadState('domcontentloaded');await frame.evaluate(()=>document.fonts.ready);await frame.locator('main').first().waitFor({timeout:30000});
   await frame.waitForFunction(()=>[...document.querySelectorAll('img')].filter(img=>{const r=img.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&r.left<innerWidth&&r.right>0}).every(img=>img.complete&&img.naturalWidth>0),{},{timeout:30000});
  }
  for(const video of await page.locator('video').elementHandles()){
   await video.evaluate(async el=>{await new Promise((resolve,reject)=>{if(el.readyState>=2)return resolve();el.addEventListener('loadeddata',resolve,{once:true});el.addEventListener('error',reject,{once:true});el.preload='auto';el.load()});el.currentTime=Math.min(1,el.duration/2);await new Promise(resolve=>el.addEventListener('seeked',resolve,{once:true}));el.pause();});
  }
  await page.waitForTimeout(500);
  const stamp=await page.locator('.stage-page').innerText();if(stamp!==String(index+1).padStart(2,'0')+' / '+String(defaultOrder.length).padStart(2,'0'))throw Error('Unexpected slide numbering '+id+': '+stamp);
  if(await page.locator('.founder-fill').count())throw Error('Private founder placeholders on '+id);
  const image=path.join(work,String(index+1).padStart(2,'0')+'-'+id+'.png');await page.locator('.stage-canvas').screenshot({path:image,animations:'disabled'});
  const text=await page.locator('.stage-slide').innerText();
  const links=await page.locator('.stage-slide a[href^="mailto:"]').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return {href:el.getAttribute('href'),x:r.x,y:r.y,width:r.width,height:r.height}}));
  slides.push({id,title:chapter.label,heading:chapter.title.replaceAll('\n',' '),image,text,links,sha256:crypto.createHash('sha256').update(await fs.readFile(image)).digest('hex')});
  console.log('Captured '+(index+1)+'/'+defaultOrder.length+' '+chapter.label);await page.close();
 }
 if(errors.length||failed.length)throw Error(JSON.stringify({errors,failed}));
 await fs.writeFile(path.join(work,'manifest.json'),JSON.stringify({title:'StatOz - Investor Deck',date:'18 November 2026',method:'Current investor stage, all reveal builds shown; static high-resolution renders, including appendix; no private notes',width:1920,height:1080,deviceScaleFactor:2,slides},null,2));
}finally{await browser.close()}
