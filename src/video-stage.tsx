import { sitePath } from './hosting';
import {useEffect,useRef,useState} from 'react';
import {type Chapter} from './content';
import {type usePresentation} from './session';
export function VideoStage({chapter,presentation}:{chapter:Chapter;presentation:ReturnType<typeof usePresentation>}){
 const video=useRef<HTMLVideoElement>(null),[blocked,setBlocked]=useState(false),last=useRef(0);
 const {state,update,send}=presentation;const range=chapter.video||[0,86.966667];
 const report=()=>{const element=video.current;if(element&&!element.seeking)send({kind:'video-progress',time:element.currentTime,paused:element.paused,seek:state.video.seek})};
 useEffect(()=>{const element=video.current;if(element&&element.readyState>=1)element.currentTime=Math.max(range[0],Math.min(state.video.time,range[1]));},[state.video.seek,chapter.id]);
 useEffect(()=>{const element=video.current;if(!element)return;element.muted=state.video.muted;if(state.video.playing)void element.play().then(()=>setBlocked(false)).catch(()=>setBlocked(true));else element.pause()},[state.video.playing,state.video.muted,state.video.seek]);
 return <div className="video-stage"><video ref={video} src={sitePath("/assets/investor-demo.mp4")} controls playsInline onLoadedMetadata={()=>{if(video.current)video.current.currentTime=state.video.time||range[0]}} onPlay={report} onPause={report} onSeeked={report} onTimeUpdate={()=>{const element=video.current!;if(element.currentTime>=range[1])element.pause();if(performance.now()-last.current>250){last.current=performance.now();report()}}}/>{blocked&&<button className="video-unlock button primary" onClick={()=>{void video.current?.play().then(()=>setBlocked(false))}}>Click to enable playback ▷</button>}<div className="frame-caption"><span>INVESTOR DEMO V7 / CHAPTER EXCERPT</span><span>{range[0].toFixed(1)}–{range[1].toFixed(1)}s · <button className="text-link" onClick={()=>update({video:{...state.video,time:range[0],seek:state.video.seek+1,playing:true}})}>Replay chapter ↺</button></span></div></div>;
}
