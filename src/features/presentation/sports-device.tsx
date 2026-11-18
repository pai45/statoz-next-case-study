import {useEffect,useRef,useState} from 'react';
import {DeviceFrame,ScaledViewport} from '../../design-system/components/layout/device-frame';
import type {usePresentation} from '../../session';
import {productBase} from '../../hosting';
const base=productBase('sports'),origin=new URL(base).origin;
export function SportsDevice({presentation,route='/',routeKey='sports:0',className=''}:{presentation:ReturnType<typeof usePresentation>;route?:string;routeKey?:string;className?:string}){
 const tablet=presentation.isAudience;
 const frame=useRef<HTMLIFrameElement>(null),current=useRef(presentation);current.current=presentation;
 const [src]=useState(()=>base+(presentation.state.productRoutes?.[routeKey]||route));
 useEffect(()=>{
  function receive(event:MessageEvent){if(event.source!==frame.current?.contentWindow||event.origin!==origin||event.data?.type!=='statoz-sports-frame')return;
   if(event.data.kind==='action')current.current.send({kind:'sports-action',key:routeKey,action:event.data.action});
   if(event.data.kind==='route'){current.current.rememberProductRoute(routeKey,event.data.route);}
  }
  function apply(event:Event){const message=(event as CustomEvent).detail;if(message.key!==routeKey)return;frame.current?.contentWindow?.postMessage({type:'statoz-sports-command',action:message.action},origin);}
  function reset(){frame.current?.contentWindow?.postMessage({type:'statoz-case-reset'},origin);}
  addEventListener('message',receive);addEventListener('statoz-sports-action',apply);addEventListener('statoz-case-reset',reset);return()=>{removeEventListener('message',receive);removeEventListener('statoz-sports-action',apply);removeEventListener('statoz-case-reset',reset)};
 },[routeKey]);
 return <div className={'live-sports-device '+(tablet?'sports-tablet-device ':'')+className}><DeviceFrame device={tablet?'tablet':'phone'} orientation={tablet?'landscape':'portrait'} label={'StatOz Sports Web interactive '+(tablet?'tablet':'mobile')+' app'}><ScaledViewport width={tablet?1024:390} height={tablet?768:844}><iframe ref={frame} className="sports-product-frame" src={src} title={'StatOz Sports Web '+(tablet?'tablet':'mobile')+' app'} allow="autoplay; fullscreen" allowFullScreen/></ScaledViewport></DeviceFrame></div>;
}
