import { sitePath } from './hosting';
import {useEffect,useRef,useState} from 'react';
import {demoURL,type Chapter} from './content';
import {type usePresentation} from './session';
import {DeviceFrame,ScaledViewport} from './design-system/components/layout/device-frame';
import {SportsDevice} from './features/presentation/sports-device';
import {GamesDevice} from './features/presentation/games-device';
import {AdminDevice} from './features/presentation/admin-device';
export function DemoStage({chapter,presentation}:{chapter:Chapter;presentation:ReturnType<typeof usePresentation>}){
 const frame=useRef<HTMLIFrameElement>(null),[loaded,setLoaded]=useState(false),[slow,setSlow]=useState(false);
 const {state,update}=presentation;const target=chapter.targets?.[state.target]||chapter.targets?.[0];
 const reset=()=>{if(!target)return;if(target.product==='sports'||target.product==='games')frame.current?.contentWindow?.postMessage({type:'statoz-case-reset'},new URL(demoURL(target)).origin);else update({nonce:state.nonce+1})};
 useEffect(()=>{setLoaded(false);setSlow(false);const timer=setTimeout(()=>setSlow(true),15000);return()=>clearTimeout(timer)},[target,state.nonce]);
 useEffect(()=>{window.addEventListener('statoz-case-reset',reset);return()=>window.removeEventListener('statoz-case-reset',reset)},[target,state.nonce]);
 if(!target)return null;
 if(target.product==='sports')return <SportsDevice key={chapter.id+':'+state.target+':'+state.nonce} presentation={presentation} route={target.route} routeKey={chapter.id+':'+state.target} className="sports-demo-device"/>;
 if(target.product==='games')return <GamesDevice key={chapter.id+':'+state.target+':'+state.nonce} presentation={presentation} route={target.route} routeKey={chapter.id+':'+state.target} className="games-demo-device"/>;
 if(target.product==='admin')return <AdminDevice key={chapter.id+':'+state.target+':'+state.nonce} presentation={presentation} route={target.route} routeKey={chapter.id+':'+state.target} className="admin-demo-device"/>;
 if(target.scenario)return <div className={'guided-stage '+target.format} aria-label={target.label+' guided demo'}><DeviceFrame className="guided-device" orientation={target.format==='landscape'?'landscape':'portrait'} label={target.label+' interactive mockup'}><ScaledViewport width={target.format==='landscape'?852:390} height={target.format==='landscape'?393:780}><iframe className="guided-frame" key={target.scenario+'-'+state.nonce} src={sitePath('/walkthrough?session=')+encodeURIComponent(presentation.session)+'&scenario='+target.scenario} title={target.label+' interactive mockup'}/></ScaledViewport></DeviceFrame></div>;
 const iframe=<iframe key={chapter.id+'-'+state.target+'-'+state.nonce} ref={frame} className={'product-frame '+target.format} src={demoURL(target)} title={target.label+' interactive demo'} allow="autoplay; fullscreen; gamepad" allowFullScreen onLoad={()=>setLoaded(true)}/>;
 return <div className={'demo-stage '+(target.format==='landscape'?'landscape-demo':'')}><div className="frame-toolbar"><div className="frame-dots"><i/><i/><i/></div><span>{'INTERACTIVE ASSET WORKSPACE'}</span><div><button aria-label="Restart demo" title="Restart current demo" onClick={()=>update({nonce:state.nonce+1})}>↻</button><button aria-label="Reset demo progress" title="Reset presentation-owned demo progress" onClick={reset}>Reset progress</button><a href={sitePath(demoURL(target))} target="_blank" rel="noreferrer" aria-label="Open demo in a separate tab">↗</a></div></div><div className={'demo-frame-space '+target.format}>{!loaded&&<div className="frame-loading" role="status">{slow?'The demo is taking longer to load. Restart it or open it in a separate tab.':'Opening the actual product…'}</div>}{target.format==='landscape'?<DeviceFrame label={target.label+' playable landscape phone'}><ScaledViewport>{iframe}</ScaledViewport></DeviceFrame>:iframe}</div><div className="frame-caption"><span>{'REAL GAME ASSETS / PREVIEW ONLY'}</span><span>{target.format==='phone'?'MOBILE VIEW':target.format==='landscape'?'LANDSCAPE MOBILE · 852 × 393':'DESKTOP VIEW'}</span></div></div>;
}
