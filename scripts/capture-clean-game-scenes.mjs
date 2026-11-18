import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
await fs.mkdir('.cache/clean-scenes',{recursive:true});const records=JSON.parse(await fs.readFile('public/data/clean-game-scenes.json','utf8').catch(()=> '[]'));
try{for(const game of (process.argv[2]?[process.argv[2]]:['yorker','portfolio-formula'])){
 const context=await browser.newContext({viewport:{width:852,height:393},recordVideo:{dir:'.cache/clean-scenes',size:{width:852,height:393}}});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4413/statoz-next-games-web/play/'+game+'/');const handle=await page.locator('iframe').elementHandle();const frame=await handle.contentFrame();await frame.locator('canvas').waitFor({timeout:45000});
 if(game==='yorker'){await frame.getByRole('button',{name:/PLAY FIRST SPELL/}).press('Enter');if(await frame.getByRole('button',{name:/TAKE THE BALL/}).count())await frame.getByRole('button',{name:/TAKE THE BALL/}).press('Enter');}
 else{await frame.getByRole('button',{name:/Quick Match/}).first().press('Enter');const start=frame.getByRole('button',{name:/Start race|Go racing|Race now/i}).first();await start.waitFor();await start.press('Enter');}
 await frame.addStyleTag({content:'body *{visibility:hidden!important}canvas{visibility:visible!important}'});
 await page.waitForTimeout(1500);
 if(game==='yorker'){await frame.evaluate(()=>{Array.from(document.querySelectorAll('button')).find(b=>/^BOWL/.test(b.textContent.trim()))?.click()});await page.waitForTimeout(1500);await frame.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true})));}
 else{await page.keyboard.down('ArrowUp');}
 await page.waitForTimeout(8000);await page.keyboard.up('ArrowUp');const video=page.video();await context.close();const input=await video.path(),output='public/assets/walkthrough/'+game+'-clean.webm';
 const encoder=path.join(process.env.LOCALAPPDATA,'ms-playwright','ffmpeg-1013','ffmpeg-win64.exe');const encoded=spawnSync(encoder,['-y','-sseof','-6','-i',input,'-t','6','-an','-c:v','libvpx-vp9','-b:v','800k',output],{encoding:'utf8',windowsHide:true});if(encoded.status!==0)throw new Error(encoded.stderr?.slice(-1200)||'Scene encoding failed');
 const bytes=await fs.readFile(output);records.push({game,file:output.slice(7),source:'Accepted packaged game runtime in presentation-owned origin',method:'Read-only browser capture; original DOM HUD hidden during capture, game artifact unchanged',viewport:{width:852,height:393},durationSeconds:6,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});console.log('Captured clean '+game+' product scene.');
}await fs.writeFile('public/data/clean-game-scenes.json',JSON.stringify(records,null,2));}finally{await browser.close()}
