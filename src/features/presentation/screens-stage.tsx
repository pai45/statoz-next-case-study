import {useState} from 'react';
import {imagePath,type Chapter} from '../../content';
import {type usePresentation} from '../../session';
import {LaptopFrame} from '../../design-system/components/layout/laptop-frame';
import {ProductDevice,isLandscapeCapture} from './product-visuals';
export function ScreensStage({chapter,presentation}:{chapter:Chapter;presentation:ReturnType<typeof usePresentation>}){
 const {state,update}=presentation;const [zoom,setZoom]=useState(false);const id=chapter.screens[state.screen]||chapter.screens[0],label=chapter.screenLabels[state.screen]||chapter.label;
 const laptop=id.startsWith('admin-source-'),landscape=isLandscapeCapture(id)||laptop,video=id.endsWith('-clip');
 return <div className={'screens-stage '+(landscape?'landscape-gallery':'')}>
  <div className="screens-main"><button className="icon-button prev-screen" aria-label="Previous screen" disabled={state.screen===0} onClick={()=>{setZoom(false);update({screen:state.screen-1})}}>←</button>
   <div className={'screen-display '+(zoom?'zoomed':'')}>
    {video?<video key={id} src={imagePath(id)} controls playsInline muted/>:laptop?<LaptopFrame label={label+' laptop capture'}><img src={imagePath(id)} alt={label}/></LaptopFrame>:landscape?<ProductDevice id={id} label={label}/>:<img src={imagePath(id)} alt={label}/>}
   </div>
   <button className="icon-button next-screen" aria-label="Next screen" disabled={state.screen>=chapter.screens.length-1} onClick={()=>{setZoom(false);update({screen:state.screen+1})}}>→</button>
  </div>
  <div className="screen-description"><span>{String(state.screen+1).padStart(2,'0')} / {String(chapter.screens.length).padStart(2,'0')}</span><b>{label}</b>{!video&&<button className="text-link" onClick={()=>setZoom(z=>!z)} aria-pressed={zoom}>{zoom?'Fit to screen':'Inspect screen ↗'}</button>}</div>
  <div className="screen-thumbnails" aria-label="Chapter captures">{chapter.screens.map((screen,i)=><button key={screen} className={'thumbnail '+(state.screen===i?'selected':'')} aria-pressed={state.screen===i} onClick={()=>{setZoom(false);update({screen:i})}}>{screen.endsWith('-clip')?<video src={imagePath(screen)} muted preload="metadata"/>:<img src={imagePath(screen)} alt="" loading="lazy"/>}<span>{chapter.screenLabels[i]}</span></button>)}</div>
 </div>;
}
