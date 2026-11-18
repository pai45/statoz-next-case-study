import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import ts from 'typescript';
import crypto from 'node:crypto';
const fixtures=JSON.parse(await fs.readFile('public/data/walkthrough-fixtures.json','utf8'));
const source=(await fs.readFile('src/features/walkthrough/state.ts','utf8')).replace(/^import fixtures[^\n]+/,'const fixtures='+JSON.stringify(fixtures)+';');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
const {initialWalkthrough}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
const browser=await chromium.launch({channel:'chrome',headless:true}),records=[];
try{const page=await browser.newPage({viewport:{width:390,height:780},deviceScaleFactor:2});
 async function capture(name,scenario,patch){const session='capture-'+name,walkthrough=initialWalkthrough();Object.assign(walkthrough.scenarios[scenario],patch);await page.goto('http://127.0.0.1:4411/health');await page.evaluate(({session,walkthrough})=>localStorage.setItem('statoz.case.session.'+session,JSON.stringify({walkthrough,revision:Date.now()})),{session,walkthrough});await page.goto(`http://127.0.0.1:4411/walkthrough?session=${session}&scenario=${scenario}`);await page.locator('.walk-runtime').waitFor();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`public/assets/walkthrough/${name}.png`});const bytes=await fs.readFile(`public/assets/walkthrough/${name}.png`);records.push({file:`assets/walkthrough/${name}.png`,scenario,screen:patch.screen,viewport:{width:390,height:780},deviceScaleFactor:2,source:'Case-study UI components adapted from current StatOz product sources',sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
 await capture('matchday','match',{screen:'home'});await capture('stats','match',{screen:'match',tab:'stats'});await capture('tops','match',{screen:'match',tab:'tops'});await capture('lineups','match',{screen:'match',tab:'stats',subtab:'LINEUPS'});await capture('picks','match',{screen:'match',tab:'picks'});
 const answers=[1,2,2,0],score=[2,3];await capture('predict-question','prediction',{screen:'question'});await capture('predict-selection','prediction',{screen:'review',answers,score});await capture('predict-locked','prediction',{screen:'review',answers,score,phase:'locking',beat:{id:'capture',started:Date.now(),duration:4500,elapsed:2200,paused:true}});await capture('predict-result','prediction',{screen:'result',answers,score,completed:true,phase:'result'});
 await capture('quiz-home','arena',{screen:'lobby'});await capture('quiz-question','arena',{screen:'question'});const quizAnswers=fixtures.arena.map(q=>q.a);quizAnswers[0]=(quizAnswers[0]+1)%4;await capture('quiz-feedback','arena',{screen:'question',answers:quizAnswers,phase:'verdict'});await capture('quiz-result','arena',{screen:'result',answers:quizAnswers,completed:true,phase:'result'});
 await fs.writeFile('public/data/guided-screen-captures.json',JSON.stringify(records,null,2));console.log(`Captured ${records.length} current guided UI screens.`);
}finally{await browser.close()}
