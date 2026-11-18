import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const browser=await chromium.launch({channel:'chrome',headless:true}),records=[];
const base='http://127.0.0.1:4412/statoz-next-sports-web';
await fs.mkdir('public/assets/current-sports',{recursive:true});
try{const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 async function capture(name,route,setup){await page.goto(base+route);await page.locator('main').first().waitFor();await page.evaluate(()=>document.fonts.ready);if(setup)await setup();await page.waitForTimeout(700);await page.screenshot({path:'public/assets/current-sports/'+name+'.png'});const bytes=await fs.readFile('public/assets/current-sports/'+name+'.png');records.push({file:'assets/current-sports/'+name+'.png',route,source:'Actual compiled current StatOz Sports Web app',viewport:{width:390,height:844},deviceScaleFactor:2,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
 await capture('home','/');await capture('stats','/matches/401879318/#stats');await capture('tops','/matches/401879318/',async()=>{await page.getByRole('tab',{name:'TOPS',exact:true}).click()});await capture('lineups','/matches/401879318/#stats',async()=>{await page.getByRole('tab',{name:'LINEUPS',exact:true}).click()});
 await capture('predict-question','/matches/epl_liv_mci/predict/main/',async()=>{await page.waitForTimeout(2400)});await capture('picks','/picks/');await capture('settled','/matches/fifa_fra_eng_result/');
 await capture('quiz-home','/quiz/football/');await capture('quiz-arena','/play/quiz/football/');await capture('quiz-question','/play/quiz/football/',async()=>{await page.getByRole('button',{name:/^Easy,/i}).click();await page.getByRole('button',{name:'Play set 1',exact:true}).click()});
 await page.getByRole('button',{name:'11',exact:true}).click();await page.getByRole('button',{name:'Lock in answer',exact:true}).click();await page.getByText('Correct. Well played.',{exact:true}).waitFor();await page.screenshot({path:'public/assets/current-sports/quiz-feedback.png'});records.push({file:'assets/current-sports/quiz-feedback.png',route:'/play/quiz/football/',state:'First answer locked and revealed through real controls',source:'Actual compiled current StatOz Sports Web app',viewport:{width:390,height:844},deviceScaleFactor:2,sha256:crypto.createHash('sha256').update(await fs.readFile('public/assets/current-sports/quiz-feedback.png')).digest('hex')});
 await fs.writeFile('public/data/current-sports-captures.json',JSON.stringify(records,null,2));console.log('Captured '+records.length+' actual Sports Web screens.');
}finally{await browser.close()}
