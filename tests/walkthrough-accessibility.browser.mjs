import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:780}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4412/statoz-next-sports-web/play/quiz/football/');
 for(const name of [/^Easy,/i,'Play set 1'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'11',exact:true}).click();await page.getByRole('button',{name:'Lock in answer',exact:true}).click();await page.getByText('Correct. Well played.',{exact:true}).waitFor({timeout:1500});await page.waitForTimeout(3100);assert.match(await page.getByRole('heading',{name:'Football Quiz',exact:true}).innerText(),/Football Quiz/);assert.equal(await page.getByRole('button',{name:'Next question',exact:true}).count(),1);assert.ok(await page.getByRole('button',{name:/^11/}).evaluate(el=>Number(getComputedStyle(el).opacity)===1));
 await page.getByRole('button',{name:'Next question',exact:true}).focus();await page.keyboard.press('Enter');await page.getByRole('heading',{name:'Which card sends a player off the pitch?'}).waitFor();assert.deepEqual(errors,[]);console.log('PASS reduced-motion immediate verdict, presenter-paced progression, readable resolved options and keyboard advancement');
 
}finally{await browser.close()}
