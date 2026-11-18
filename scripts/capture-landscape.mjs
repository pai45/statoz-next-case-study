import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const output='public/assets/mockups';await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'block'});
await context.route('**/*',r=>r.request().url().startsWith('http')&&!r.request().url().startsWith('http://127.0.0.1:4413/')?r.abort():r.continue());
const selected=process.argv[2];
const records=selected?JSON.parse(await fs.readFile('public/data/landscape-captures.json','utf8')).filter(record=>record.game!==selected):[];
try{
for(const [id,name] of [['cricketer','Cricketer'],['penalty-cup','Penalty Cup'],['vibe-basketball','Vibe Basketball'],['longbow','Longbow'],['portfolio-formula','Formula']]){
 if(selected&&selected!==id)continue;
 if(id==='vibe-basketball'){
  // Prefer the existing source-verified gameplay frame over the legacy lobby's mobile layout.
  const ffmpeg=process.env.FFMPEG_PATH||'C:/Users/priya/AppData/Local/Programs/Python/Python311/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
  execFileSync(ffmpeg,['-v','error','-ss','1.6','-i','public/assets/vibe-clip.mp4','-frames:v','1','-y',output+'/vibe-basketball.png'],{windowsHide:true});
  const bytes=await fs.readFile(output+'/vibe-basketball.png');records.push({file:'assets/mockups/vibe-basketball.png',game:id,label:name,source:'Source-verified investor demo gameplay; public/assets/vibe-clip.mp4, registered in asset-provenance.json',route:'/statoz-next-games-web/play/vibe-basketball/',state:'1v1 Street gameplay · frame at 1.6 seconds',viewport:{width:852,height:392,deviceScaleFactor:1},pixels:{width:852,height:392},orientation:'landscape',frameTimeSeconds:1.6,capturedAt:new Date().toISOString(),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),errors:[]});console.log('Extracted source-verified Vibe Basketball gameplay.');continue;
 }
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const route='/statoz-next-games-web/play/'+id+'/';await page.goto('http://127.0.0.1:4413'+route);
 // The actual app has a landscape wrapper and an artifact iframe. Wait for a real menu.
 const start=Date.now();let frame;
 while(Date.now()-start<30000){frame=page.frames().find(f=>f.url()==='about:srcdoc');if(frame&&(await frame.locator('body').innerText()).length>150)break;await page.waitForTimeout(250)}
 if(!frame)throw Error('Game artifact did not open: '+id);
 await frame.locator('body').evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400);
 if(id==='cricketer'){await frame.getByRole('button',{name:/PLAY FIRST LIGHT/}).click();await frame.getByRole('button',{name:/bat left/i}).waitFor();await page.waitForTimeout(300);}
 const bytes=await page.screenshot({path:output+'/'+id+'.png',animations:'disabled'});
 records.push({file:'assets/mockups/'+id+'.png',game:id,label:name,source:'statoz-games-web packaged static export + statoz-games accepted game library',route,state:id==='cricketer'?'First Light · active innings · initial delivery':id==='vibe-basketball'?'1v1 Street · playable court':'Game menu',viewport:{width:852,height:393,deviceScaleFactor:2},pixels:{width:1704,height:786},orientation:'landscape',capturedAt:new Date().toISOString(),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),errors});
 console.log('Captured '+name,errors);await page.close();
}
await fs.writeFile('public/data/landscape-captures.json',JSON.stringify(records,null,2));
}finally{await browser.close()}
