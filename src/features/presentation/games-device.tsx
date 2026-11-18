import {useEffect,useRef,useState} from 'react';
import {DeviceFrame,ScaledViewport} from '../../design-system/components/layout/device-frame';
import type {usePresentation} from '../../session';
import {productBase} from '../../hosting';
const base=productBase('games'),origin=new URL(base).origin;
export function GamesDevice({presentation,route='/',routeKey='games:0',className=''}:{presentation:ReturnType<typeof usePresentation>;route?:string;routeKey?:string;className?:string}){
 const frame=useRef<HTMLIFrameElement>(null),current=useRef(presentation);current.current=presentation;
 const [src]=useState(()=>base+(presentation.state.productRoutes?.[routeKey]||route));
 useEffect(()=>{
  const receive=(event:MessageEvent)=>{if(event.source!==frame.current?.contentWindow||event.origin!==origin||event.data?.type!=='statoz-games-frame')return;if(event.data.kind==='route')current.current.rememberProductRoute(routeKey,event.data.route);if(event.data.kind==='action')current.current.send({kind:'games-action',key:routeKey,action:event.data.action});};
  const apply=(event:Event)=>{const message=(event as CustomEvent).detail;if(message.key===routeKey)frame.current?.contentWindow?.postMessage({type:'statoz-games-command',action:message.action},origin);};
  const reset=()=>frame.current?.contentWindow?.postMessage({type:'statoz-case-reset'},origin);
  addEventListener('message',receive);addEventListener('statoz-games-action',apply);addEventListener('statoz-case-reset',reset);return()=>{removeEventListener('message',receive);removeEventListener('statoz-games-action',apply);removeEventListener('statoz-case-reset',reset)};
 },[routeKey]);
 return <div className={'live-games-device '+className}><DeviceFrame orientation="landscape" label="StatOz Games Web playable landscape app"><ScaledViewport width={852} height={393}><iframe ref={frame} className="games-product-frame" src={src} title="StatOz Games Web playable mobile app" allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope" allowFullScreen/></ScaledViewport></DeviceFrame></div>;
}
