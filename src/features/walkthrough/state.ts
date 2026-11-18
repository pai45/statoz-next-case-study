import fixtures from '../../../public/data/walkthrough-fixtures.json';
export type ScenarioId='match'|'prediction'|'arena'|'games'|'formula'|'yorker';
export type Beat={id:string;started:number;duration:number;elapsed:number;paused:boolean};
export type ScenarioState={screen:string;tab:string;subtab:string;index:number;answers:(number|null)[];score:[number,number];boosts:number[];phase:string;beat:Beat|null;scroll:number;game:'formula'|'yorker';circuit:string;car:string;delivery:string;target:number;release:number;speed:number;completed:boolean;mode:string;review:boolean;sampleFilled:boolean};
export type WalkthroughState={version:1;scenarios:Record<ScenarioId,ScenarioState>};
export type DemoAction={scenario:ScenarioId;type:string;value?:string|number;index?:number;beatId?:string;reduced?:boolean;at:number;id:string};
export const scenarioNames:Record<ScenarioId,string>={match:'Explore the match',prediction:'Play a prediction quiz',arena:'Football Knowledge Arena',games:'Games library',formula:'Formula · Quick Match',yorker:'Yorker · First Spell'};
export function seedScenario(id:ScenarioId):ScenarioState{return {screen:id==='match'?'home':id==='prediction'?'match':id==='arena'?'hub':id==='games'?'library':'menu',tab:id==='match'?'stats':'predict',subtab:'OVERVIEW',index:0,answers:Array(id==='arena'?10:4).fill(null),score:[0,0],boosts:[1,1,1,1],phase:'idle',beat:null,scroll:0,game:id==='yorker'?'yorker':'formula',circuit:'Night Circuit',car:'Scarlet',delivery:'Seam up',target:50,release:70,speed:0,completed:false,mode:'Easy',review:false,sampleFilled:false};}
export function initialWalkthrough():WalkthroughState{return {version:1,scenarios:Object.fromEntries((Object.keys(scenarioNames) as ScenarioId[]).map(id=>[id,seedScenario(id)])) as Record<ScenarioId,ScenarioState>};}
export function hydrateWalkthrough(value?:Partial<WalkthroughState>):WalkthroughState{const seed=initialWalkthrough();if(value?.version!==1)return seed;for(const id of Object.keys(seed.scenarios) as ScenarioId[])if(value.scenarios?.[id])seed.scenarios[id]={...seed.scenarios[id],...value.scenarios[id]};return seed;}
export const beatElapsed=(beat:Beat|null,now=Date.now())=>beat?Math.min(beat.duration,beat.elapsed+(beat.paused?0:Math.max(0,now-beat.started))):0;
export function arenaCorrect(s:ScenarioState){return s.answers.reduce<number>((sum,answer,i)=>sum+(answer===fixtures.arena[i]?.a?1:0),0);}
export function arenaStars(s:ScenarioState){const n=arenaCorrect(s);return n===10?3:n>=7?2:n>0?1:0;}
export function predictionResults(s:ScenarioState){return fixtures.prediction.map((q,i)=>({prompt:q.prompt,picked:i===0?s.score.join(' – '):q.options?.[s.answers[i]??-1]??'—',actual:i===0?'2 – 3':q.options?.[Number(q.correct)]??'',correct:i===0?s.score[0]===2&&s.score[1]===3:s.answers[i]===q.correct,xp:q.reward*s.boosts[i]}));}
export function reduceWalkthrough(state:WalkthroughState,action:DemoAction):WalkthroughState{
 const id=action.scenario,old=state.scenarios[id];if(!old)return state;
 let s={...old,answers:[...old.answers],score:[...old.score] as [number,number],boosts:[...old.boosts]};
 const value=action.value;const start=(phase:string,duration:number)=>{s.phase=phase;s.beat={id:action.id,started:action.at,duration,elapsed:0,paused:false};};
 switch(action.type){
  case 'reset':s=seedScenario(id);break;
  case 'navigate':if(typeof value!=='string')return state;s.screen=value;s.scroll=0;break;
  case 'tab':if(typeof value!=='string'||!['predict','picks','tops','stats'].includes(value))return state;s.tab=value;s.scroll=0;break;
  case 'subtab':s.subtab=String(value);s.scroll=0;break;
  case 'scroll':s.scroll=Number(value)||0;break;
  case 'openQuiz':s.screen='question';s.index=0;s.scroll=0;if(id==='match'){s.answers=[1,2,2,0];s.score=[2,3];s.completed=true;s.screen='result';s.phase='result';}else if(s.completed)s.screen='result';else if(s.phase==='locked')s.screen='review';else start('intro',2240);break;
  case 'answer':if(s.phase!=='idle'||s.screen!=='question')return state;if(!Number.isInteger(value)||Number(value)<0||Number(value)>=(id==='arena'?4:fixtures.prediction[s.index]?.options?.length??0))return state;s.answers[s.index]=Number(value);break;
  case 'score':if(s.phase!=='idle'||s.index!==0||s.screen!=='question')return state;{const i=action.index===1?1:0;s.score[i]=Math.max(0,Math.min(9,s.score[i]+Number(value)));s.answers[0]=1;}break;
  case 'boost':if(id!=='prediction'||s.phase!=='idle')return state;s.boosts[s.index]=Number(value)===1.5?1.5:Number(value)===2?2:1;break;
  case 'next':
   if(id==='arena'){if(s.phase!=='verdict')return state;if(s.index===9){s.completed=true;s.screen='result';start('celebrate',1600);}else{s.index++;s.phase='idle';s.beat=null;s.scroll=0;}}
   else{if(s.phase!=='idle'||s.answers[s.index]===null)return state;if(s.index===3){s.screen='review';s.scroll=0;}else{s.index++;start('intro',2240);s.scroll=0;}}break;
  case 'previousQuestion':if(id==='arena'||s.phase!=='idle')return state;s.index=Math.max(0,s.index-1);s.screen='question';s.scroll=0;break;
  case 'lock':
   if(id==='arena'){if(s.phase!=='idle'||s.answers[s.index]===null)return state;start('signal',700);}
   else{if(s.screen!=='review'||s.phase!=='idle'||s.answers.some(a=>a===null))return state;start('locking',4500);}break;
  case 'reveal':if(id!=='prediction'||s.phase!=='locked')return state;s.screen='review';start('settlement',5030);break;
  case 'replayReveal':if(!s.completed)return state;start(id==='arena'?'celebrate':id==='prediction'?'settlement':'gameCelebrate',id==='arena'?1600:id==='prediction'?5030:1400);break;
  case 'completeSample':if(id!=='arena'||s.completed)return state;s.answers=s.answers.map((answer,i)=>answer??fixtures.arena[i].a);s.sampleFilled=true;s.index=9;s.completed=true;s.screen='result';start('celebrate',1600);break;
  case 'mode':s.mode=String(value);s.screen='ladder';s.scroll=0;break;
  case 'startArena':if(s.mode!=='Easy')return state;s.screen='question';s.index=0;s.answers=Array(10).fill(null);s.phase='idle';s.beat=null;s.completed=false;s.sampleFilled=false;s.scroll=0;break;
  case 'review':s.review=!s.review;break;
  case 'openGame':if(value!=='formula'&&value!=='yorker')return state;s={...seedScenario(value),game:value};break;
  case 'circuit':if(['Night Circuit','Harbor Run','Switchback Ring'].includes(String(value)))s.circuit=String(value);break;
  case 'car':if(['Scarlet','Midnight','Ivory'].includes(String(value)))s.car=String(value);break;
  case 'delivery':if(['Seam up','Outswinger','Inswinger','Slower ball'].includes(String(value)))s.delivery=String(value);break;
  case 'target':s.target=Math.max(0,Math.min(100,Number(value)));break;
  case 'startRace':s.screen='play';s.completed=false;start('countdown',3000);break;
  case 'drive':if(s.phase!=='racing'&&s.phase!=='raceHold')return state;s.speed=Math.max(0,Math.min(310,s.speed+Number(value)));break;
  case 'bowl':if(s.screen!=='play'||s.phase!=='idle')return state;start('runup',2500);break;
  case 'release':if(s.phase!=='runup')return state;s.release=Math.round(beatElapsed(s.beat,action.at)/2500*100);start('delivery',3000);break;
  case 'finishGame':if(s.screen!=='play')return state;s.completed=true;s.screen='result';start('gameCelebrate',1400);break;
  case 'pause':if(!s.beat)return state;{const elapsed=beatElapsed(s.beat,action.at);s.beat={...s.beat,elapsed,started:action.at,paused:!s.beat.paused};}break;
  case 'tick':if(!s.beat||s.beat.id!==action.beatId||s.beat.paused||(!action.reduced&&beatElapsed(s.beat,action.at)<s.beat.duration))return state;
   if(s.phase==='intro')s.phase='idle';else if(s.phase==='locking')s.phase='locked';else if(s.phase==='signal')s.phase='verdict';else if(s.phase==='settlement'){s.phase='result';s.screen='result';s.completed=true;}else if(s.phase==='countdown'){s.speed=185;start('racing',8000);return {...state,scenarios:{...state.scenarios,[id]:s}};}else if(s.phase==='racing')s.phase='raceHold';else if(s.phase==='runup'){s.release=70;start('delivery',3000);return {...state,scenarios:{...state.scenarios,[id]:s}};}else if(s.phase==='delivery')s.phase='outcome';else s.phase='result';s.beat=null;break;
  default:return state;
 }
 return {...state,scenarios:{...state.scenarios,[id]:s}};
}
