// Read-only source extraction. Run from the case study; never modifies a product repository.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'), workspace=path.dirname(root);
const output=path.join(root,'public/assets/walkthrough');
await fs.mkdir(output,{recursive:true});
await fs.mkdir(path.join(root,'src/features/walkthrough'),{recursive:true});
const provenance=[];
async function copy(source,target){const bytes=await fs.readFile(path.join(workspace,source));await fs.mkdir(path.dirname(path.join(root,target)),{recursive:true});await fs.writeFile(path.join(root,target),bytes);provenance.push({source,target,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
for(const id of ['yorker','portfolio-formula'])await copy(`statoz-games/public/assets/games/home/gameplay/${id}.mp4`,`public/assets/walkthrough/${id}.mp4`);
for(const name of ['football-wide.svg'])await copy('statoz-sports-web/public/assets/backgrounds/hub/'+name,'public/assets/walkthrough/'+name);
await copy('statoz-sports-web/public/assets/games/discovery/football-quiz-subject.svg','public/assets/walkthrough/football-quiz-subject.svg');
await copy('statoz-sports-web/src/features/games/quiz/components/arena.module.css','src/features/walkthrough/arena.module.css');
await copy('statoz-games/src/features/games/yorker/barlow-condensed.woff2','public/assets/walkthrough/barlow-condensed.woff2');
await copy('statoz-games/public/games/yorker/OFL-barlow-condensed.txt','public/assets/walkthrough/OFL-barlow-condensed.txt');
await copy('statoz-games/public/games/yorker/PLAYER-LICENSE.txt','public/assets/walkthrough/yorker-PLAYER-LICENSE.txt');
await copy('statoz-games/src/features/games/portfolio-formula/source/src/components/race/formula-menu.css','src/features/walkthrough/formula-source.css');
const bank=JSON.parse(await fs.readFile(path.join(workspace,'statoz-sports-web/public/assets/quiz/football_easy.json'),'utf8'));
const snapshot=JSON.parse(await fs.readFile(path.join(workspace,'statoz-sports-web/src/mocks/snapshots/card-game/football-revamp.json'),'utf8'));
const data={version:1,status:'Illustrative demo data',fixture:{id:'401879318',home:'Fulham',away:'Chelsea',homeScore:2,awayScore:3,venue:'Craven Cottage',competition:'Premier League'},arena:bank.bands['1'].slice(0,10),snapshot,prediction:[{id:'score',prompt:'Predict the full-time score',reward:100,correct:[2,3]},{id:'winner',prompt:'Who will win the match?',options:['Fulham','Draw','Chelsea'],reward:75,correct:2},{id:'goals',prompt:'How many goals will be scored?',options:['0–1','2–3','4 or more'],reward:50,correct:2},{id:'both',prompt:'Will both teams score?',options:['Yes','No'],reward:50,correct:0}],formula:{circuit:'Night Circuit',position:3,laps:1,time:'01:24.680'},yorker:{spell:'First Spell',venue:'Elmfield County Ground',wickets:1,runs:0,balls:1,stars:3},rules:{arenaQuestions:10,arenaXpPerCorrect:1,arenaStarThresholds:[1,7,10],arenaStarRewards:[5,5,10],signalLockMs:700,predictionLockMs:4500}};
await fs.writeFile(path.join(root,'public/data/walkthrough-fixtures.json'),JSON.stringify(data,null,2));
await fs.writeFile(path.join(root,'public/data/walkthrough-provenance.json'),JSON.stringify({generatedFrom:'Local product sources; source files remain unchanged.',files:provenance},null,2));
console.log('Prepared local UI references, source quiz questions, fixture snapshot and gameplay media.');
