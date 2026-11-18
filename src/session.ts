import { routePath, sitePath } from './hosting';
import {useEffect,useRef,useState} from 'react';
import {chapters,defaultOrder,normalizeOrder,type Phase} from './content';
import {hydrateWalkthrough,initialWalkthrough,reduceWalkthrough,type WalkthroughState,type DemoAction} from './features/walkthrough/state';
export type SessionState={chapter:string;phase:Phase;screen:number;target:number;nonce:number;blackout:boolean;order:string[];hidden:string[];started:number;revision:number;video:{playing:boolean;time:number;muted:boolean;seek:number};walkthrough:WalkthroughState;productRoutes?:Record<string,string>;step:number};
export const preferencesKey='statoz.case.preferences.v1';
/** Both homepage launch controls share one session, without linking the homepage's own browsing state. */
export function getLaunchSession():string{
 const key='statoz.case.launch-session.v1';
 try{const saved=sessionStorage.getItem(key);if(saved)return saved;const id=crypto.randomUUID();sessionStorage.setItem(key,id);return id}catch{return crypto.randomUUID()}
}
export function readStored<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
export function initialState(session:string):SessionState{const saved=readStored<Partial<SessionState>>('statoz.case.session.'+session,{});const prefs=readStored<{order:string[];hidden:string[]}>(preferencesKey,{order:defaultOrder,hidden:[]});const merged={chapter:'home',phase:'intro' as Phase,screen:0,target:0,nonce:0,blackout:false,order:prefs.order,hidden:prefs.hidden,started:0,revision:0,video:{playing:false,time:0,muted:true,seek:0},step:0,...saved,walkthrough:hydrateWalkthrough(saved.walkthrough)};return {...merged,chapter:chapters.some(c=>c.id===merged.chapter&&(!c.websiteOnly||!['/present','/presenter'].includes(routePath())))?merged.chapter:['data','qa'].includes(merged.chapter)?'close':merged.chapter==='make-your-call'?'opportunity':'home',order:normalizeOrder(merged.order||defaultOrder),hidden:(merged.hidden||[]).filter(id=>chapters.some(c=>c.id===id))};}
export function usePresentation(isAudience:boolean){
 const [session]=useState(()=>new URLSearchParams(location.search).get('session')||(routePath()==='/presenter'?crypto.randomUUID():'explore'));
 const [state,setState]=useState(()=>initialState(session));const current=useRef(state);current.current=state;
 const [lastAudience,setLastAudience]=useState(0),[progress,setProgress]=useState({time:0,paused:true}),[now,setNow]=useState(Date.now());
 const channel=useRef<BroadcastChannel|null>(null);
 const send=(message:unknown)=>channel.current?.postMessage(message);
 function commit(next:SessionState){if(next.video.seek!==current.current.video.seek)setProgress({time:next.video.time,paused:!next.video.playing});current.current=next;setState(next);try{localStorage.setItem('statoz.case.session.'+session,JSON.stringify(next));localStorage.setItem(preferencesKey,JSON.stringify({order:next.order,hidden:next.hidden}));}catch{}send({kind:'state',state:next});}
 // Serialize mutations across same-origin tabs and mockup frames. Always reduce the latest snapshot.
 const transact=(change:(latest:SessionState)=>SessionState)=>{
  const run=()=>{const saved=initialState(session),latest=saved.revision>current.current.revision?saved:current.current;const next=change(latest);if(next===latest)return;commit({...next,revision:Math.max(Date.now(),latest.revision+1)});};
  if(navigator.locks)void navigator.locks.request('statoz.case.session.'+session,run);else run();
 };
 const update=(patch:Partial<SessionState>)=>transact(latest=>{let walkthrough=latest.walkthrough;if((patch.phase&&patch.phase!=='demo')||(patch.target!==undefined&&patch.target!==latest.target)||patch.blackout===true){for(const id of Object.keys(walkthrough.scenarios) as (keyof WalkthroughState['scenarios'])[]){const beat=walkthrough.scenarios[id].beat;if(beat&&!beat.paused)walkthrough=reduceWalkthrough(walkthrough,{scenario:id,type:'pause',id:crypto.randomUUID(),at:Date.now()});}}return {...latest,...patch,walkthrough};});
 const dispatchDemo=(action:Omit<DemoAction,'id'|'at'>)=>transact(latest=>{const walkthrough=reduceWalkthrough(latest.walkthrough||initialWalkthrough(),{...action,at:Date.now(),id:crypto.randomUUID()});return walkthrough===latest.walkthrough?latest:{...latest,walkthrough};});
 const rememberProductRoute=(key:string,route:string)=>{if(!route.startsWith('/')||route.length>2000)return;transact(latest=>latest.productRoutes?.[key]===route?latest:{...latest,productRoutes:{...latest.productRoutes,[key]:route}})};
 useEffect(()=>{if(routePath()==='/presenter'&&!location.search)history.replaceState(null,'',sitePath('/presenter?session='+session));if(!('BroadcastChannel'in window))return;
  const bc=new BroadcastChannel('statoz.case.'+session);channel.current=bc;
   bc.onmessage=e=>{const message=e.data;if(message.kind==='state'&&message.state.revision>current.current.revision){const next=message.state as SessionState;if(!chapters.some(c=>c.id===next.chapter))return;next.walkthrough=hydrateWalkthrough(next.walkthrough);current.current=next;setState(next);}
   if(message.kind==='request'&&!isAudience)bc.postMessage({kind:'state',state:current.current});
   if(message.kind==='heartbeat'&&!isAudience)setLastAudience(Date.now());
   if(message.kind==='reset-demo'&&isAudience)window.dispatchEvent(new Event('statoz-case-reset'));
   if(message.kind==='sports-action')window.dispatchEvent(new CustomEvent('statoz-sports-action',{detail:message}));
   if(message.kind==='games-action')window.dispatchEvent(new CustomEvent('statoz-games-action',{detail:message}));
   if(message.kind==='video-progress'&&message.seek===current.current.video.seek)setProgress({time:message.time,paused:message.paused});};
  bc.postMessage({kind:'request'});const interval=setInterval(()=>{setNow(Date.now());if(isAudience)bc.postMessage({kind:'heartbeat'})},1000);
  return()=>{clearInterval(interval);bc.close();channel.current=null};
 },[session,isAudience]);
 const select=(id:string,step=0)=>{const chapter=chapters.find(c=>c.id===id);if(!chapter||(chapter.websiteOnly&&(isAudience||routePath()==='/presenter')))return;update({chapter:id,phase:'intro',screen:0,target:0,step,blackout:false,video:{playing:false,time:chapter.video?.[0]||0,muted:current.current.video.muted,seek:current.current.video.seek+1}})};
 const visible=state.order.filter(id=>!state.hidden.includes(id)&&chapters.some(c=>c.id===id));
 /** Advance reveal steps on the introduction before moving chapters; going back lands on the previous chapter fully built. */
 const next=(direction:number)=>{const latest=current.current,chapter=chapters.find(c=>c.id===latest.chapter),steps=latest.phase==='intro'?chapter?.steps||1:1,step=Math.min(latest.step||0,steps-1);if(direction>0&&step<steps-1)return update({step:step+1});if(direction<0&&step>0)return update({step:step-1});const i=visible.indexOf(latest.chapter),id=visible[Math.max(0,Math.min(visible.length-1,i+direction))]||'home';if(id===latest.chapter)return;select(id,direction<0?Math.max(0,(chapters.find(c=>c.id===id)?.steps||1)-1):0)};
 return {state,update,select,next,visible,session,send,progress,now,dispatchDemo,rememberProductRoute,isAudience,connected:now-lastAudience<3500};
}
