import {useEffect,useRef,useState} from 'react';
import {chapters,runOfShow,type Chapter} from '../../content';
import type {usePresentation} from '../../session';
import {readStored} from '../../session';
import {StageCanvas,StageSlide} from '../presentation/stage';
import './desk.css';
type Presentation=ReturnType<typeof usePresentation>;
const rehearsalKey='statoz.case.rehearsal.v1';
export const clock=(seconds:number)=>`${Math.floor(Math.max(0,seconds)/60)}:${String(Math.floor(Math.max(0,seconds)%60)).padStart(2,'0')}`;

/** Records seconds spent per chapter while the presentation timer runs; the previous run is shown as a rehearsal reference. */
export function useRehearsal(presentation:Presentation){
 const {state,now}=presentation,entered=useRef({id:state.chapter,at:Date.now()});
 const [lastRun,setLastRun]=useState<Record<string,number>>(()=>readStored(rehearsalKey,{}));
 const [current,setCurrent]=useState<Record<string,number>>({});
 useEffect(()=>{const previous=entered.current;if(previous.id===state.chapter)return;if(state.started){const spent=(Date.now()-previous.at)/1000;setCurrent(run=>{const next={...run,[previous.id]:(run[previous.id]||0)+spent};try{localStorage.setItem(rehearsalKey,JSON.stringify(next))}catch{}return next})}entered.current={id:state.chapter,at:Date.now()}},[state.chapter,state.started]);
 useEffect(()=>{if(!state.started){setLastRun(readStored(rehearsalKey,{}));setCurrent({})}},[state.started]);
 return {lastRun,chapterElapsed:(now-entered.current.at)/1000+(current[state.chapter]||0)};
}

export function RunPresets({presentation}:{presentation:Presentation}){
 const {state,update}=presentation;
 const active=(Object.keys(runOfShow) as (keyof typeof runOfShow)[]).find(key=>{const p=runOfShow[key];return p.order.join()===state.order.join()&&[...p.hidden].sort().join()===[...state.hidden].sort().join()});
 return <div className="desk-presets" role="group" aria-label="Run of show preset"><span>RUN OF SHOW</span>{(Object.keys(runOfShow) as (keyof typeof runOfShow)[]).map(key=><button key={key} className={active===key?'selected':''} aria-pressed={active===key} onClick={()=>update({order:[...runOfShow[key].order],hidden:[...runOfShow[key].hidden]})}>{runOfShow[key].label}</button>)}</div>;
}

export function PaceBar({presentation,chapterElapsed}:{presentation:Presentation;chapterElapsed:number}){
 const {state,visible,now}=presentation,chapter=chapters.find(c=>c.id===state.chapter)!;
 const budget=visible.reduce((sum,id)=>sum+(chapters.find(c=>c.id===id)?.minutes||0),0)*60,elapsed=state.started?(now-state.started)/1000:0;
 const index=visible.indexOf(state.chapter),planned=visible.slice(0,Math.max(0,index)).reduce((sum,id)=>sum+(chapters.find(c=>c.id===id)?.minutes||0),0)*60;
 const chapterBudget=(chapter.minutes||0)*60,drift=elapsed-planned-Math.min(chapterElapsed,chapterBudget);
 const tone=!state.started?'idle':drift>60?'late':drift>20?'tight':'good';
 return <div className={'desk-pace '+tone} role="status" aria-label="Presentation pace"><div><span>TOTAL</span><b>{clock(elapsed)}</b><small>of {clock(budget)} planned</small></div><div className="desk-pace-track"><span style={{width:Math.min(100,elapsed/Math.max(1,budget)*100)+'%'}}/><i style={{left:Math.min(100,(planned+chapterBudget)/Math.max(1,budget)*100)+'%'}}/></div><div><span>THIS CHAPTER</span><b className={chapterBudget&&chapterElapsed>chapterBudget?'over':''}>{clock(state.started?chapterElapsed:0)}</b><small>{chapterBudget?'budget '+clock(chapterBudget):'no budget'}</small></div><div className="desk-pace-label">{tone==='idle'?'Timer starts with the audience window':tone==='good'?'On pace':tone==='tight'?'Running a little long':'Behind plan: trim the next demo'}</div></div>;
}

/** Private reveal controls for slide builds and navigation. */
export function StageControls({presentation,chapter}:{presentation:Presentation;chapter:Chapter}){
 const {state,next,update}=presentation,steps=chapter.steps||1,step=Math.min(state.step||0,steps-1);
 const nextId=presentation.visible[presentation.visible.indexOf(chapter.id)+1],nextLabel=state.phase==='intro'&&step<steps-1?`Reveal build ${step+2} of ${steps}`:nextId?'Next: '+chapters.find(c=>c.id===nextId)?.label:'End of run';
 return <section className="desk-stage-controls" aria-label="Stage reveal controls">
  <button className="desk-reveal" onClick={()=>next(1)} disabled={!nextId&&step>=steps-1}><small>→ / SPACE</small>{nextLabel}</button>
  {steps>1&&state.phase==='intro'&&<div className="desk-builds" aria-label={`Build ${step+1} of ${steps}`}>{Array.from({length:steps},(_,i)=><button key={i} className={i<=step?'on':''} aria-label={'Show build '+(i+1)} onClick={()=>update({step:i})}/>)}<span>Build {step+1} / {steps}</span></div>}
 </section>;
}

export function QAJump({presentation}:{presentation:Presentation}){
 const appendix=chapters.filter(c=>c.appendix);
 return <label className="desk-qa-jump">Appendix jump<select value="" onChange={e=>{const [id,screen]=e.target.value.split(':');if(id){presentation.select(id);if(screen)presentation.update({screen:Number(screen)})}}}><option value="">Choose…</option>{appendix.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>;
}

export function StagePreview({presentation,chapter,step,label}:{presentation:Presentation;chapter:Chapter;step?:number;label:string}){
 return <figure className="desk-preview"><figcaption>{label}</figcaption><div className="desk-preview-frame"><StageCanvas><StageSlide presentation={presentation} chapter={chapter} preview step={step} phase={step===undefined?undefined:'intro'}/></StageCanvas></div></figure>;
}

export function ShortcutOverlay(){
 const [open,setOpen]=useState(false);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName))return;if(e.key==='?')setOpen(v=>!v);if(e.key==='Escape')setOpen(false)};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[]);
 return <><button className="desk-shortcuts-button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>Shortcuts ?</button>{open&&<div className="desk-shortcuts" role="dialog" aria-label="Keyboard shortcuts"><h3>Keyboard shortcuts</h3><dl><dt>→ or Space</dt><dd>Next build, then next chapter</dd><dt>←</dt><dd>Previous build or chapter</dd><dt>B</dt><dd>Blackout investor screen</dd><dt>Esc</dt><dd>Restore screen / close this panel</dd><dt>?</dt><dd>Show or hide shortcuts</dd></dl><p>Shortcuts work in the presenter desk and the investor window when focus is outside a form field or product frame.</p><button className="button secondary" onClick={()=>setOpen(false)}>Close</button></div>}</>;
}
