import {useEffect,useRef,useState,type ReactNode} from 'react';
export function DeviceFrame({children,orientation='landscape',device='phone',className='',label}:{children:ReactNode;orientation?:'landscape'|'portrait';device?:'phone'|'tablet';className?:string;label?:string}){
 return <div className={`device-frame device-${orientation}${device==='tablet'?' device-tablet':''} ${className}`} role={label?'group':undefined} aria-label={label}>
  <span className="device-side-key key-volume" aria-hidden="true"/><span className="device-side-key key-power" aria-hidden="true"/>
  <div className="device-glass"><span className="device-island" aria-hidden="true"><i/></span><div className="device-screen">{children}</div><span className="device-gesture" aria-hidden="true"/></div>
 </div>;
}
/** Keep the actual embedded viewport landscape; resizing its surround does not rotate gameplay. */
export function ScaledViewport({children,width=852,height=393}:{children:ReactNode;width?:number;height?:number}){
 const host=useRef<HTMLDivElement>(null),[scale,setScale]=useState(1);
 useEffect(()=>{const element=host.current;if(!element)return;const observer=new ResizeObserver(([entry])=>setScale(entry.contentRect.width/width));observer.observe(element);return()=>observer.disconnect()},[width]);
 return <div ref={host} className="scaled-viewport" style={{aspectRatio:`${width}/${height}`}}><div className="scaled-viewport-content" style={{width,height,transform:`scale(${scale})`}}>{children}</div></div>;
}
