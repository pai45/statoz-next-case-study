import {useEffect,useRef,useState} from 'react';
import {ScaledViewport} from '../../design-system/components/layout/device-frame';
import {LaptopFrame} from '../../design-system/components/layout/laptop-frame';
import type {usePresentation} from '../../session';
import type {Chapter} from '../../content';
import {FilterChips} from '../../design-system/components/navigation/filter-chips';
import {sitePath} from '../../hosting';
type Presentation=ReturnType<typeof usePresentation>;
export function AdminDevice({presentation,route='/admin?page=dashboard',routeKey='admin:0',className=''}:{presentation:Presentation;route?:string;routeKey?:string;className?:string}){
 const frame=useRef<HTMLIFrameElement>(null),current=useRef(presentation);current.current=presentation;
 const [src]=useState(()=>{const url=new URL(sitePath(presentation.state.productRoutes?.[routeKey]||route),location.origin);url.searchParams.set('workspace',presentation.session);url.searchParams.set('embedded','1');return url.pathname+url.search});
 useEffect(()=>{const receive=(e:MessageEvent)=>{if(e.source!==frame.current?.contentWindow||e.origin!==location.origin||e.data?.type!=='statoz-admin-route')return;current.current.rememberProductRoute(routeKey,e.data.route)};const reset=()=>frame.current?.contentWindow?.postMessage({type:'statoz-admin-reset'},location.origin);addEventListener('message',receive);addEventListener('statoz-case-reset',reset);return()=>{removeEventListener('message',receive);removeEventListener('statoz-case-reset',reset)}},[routeKey]);
 return <div className={'admin-device '+className}><LaptopFrame label="StatOz Admin interactive laptop"><ScaledViewport width={1280} height={800}><iframe ref={frame} src={src} className="admin-product-frame" title="StatOz Admin local interactive workspace"/></ScaledViewport></LaptopFrame></div>;
}
export function AdminLaunchControls({chapter,presentation}:{chapter:Chapter;presentation:Presentation}){return <section className="game-launch-controls" aria-label="Admin presentation controls"><div className="eyebrow">ADMIN STARTING PAGE</div><FilterChips label="Open an Admin page" value={presentation.state.target} items={(chapter.targets||[]).map((target,id)=>({id,label:target.label}))} onChange={target=>presentation.update({target})}/><p>Click inside the laptop to explore. Pages, filters, form drafts and saved edits are shared between the presenter and investor windows. Reset demo progress restores the local fixtures.</p></section>}
