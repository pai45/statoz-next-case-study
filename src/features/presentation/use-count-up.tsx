import {useEffect,useState} from 'react';
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Counts from zero to `target` once `active` becomes true. Reduced motion and previews show the final value immediately. */
export function useCountUp(target:number,active=true,duration=1400,instant=false){
 const [value,setValue]=useState(()=>instant||reducedMotion()?target:0);
 useEffect(()=>{
  if(!active){setValue(instant||reducedMotion()?target:0);return}
  if(instant||reducedMotion()){setValue(target);return}
  let frame=0;const start=performance.now();
  const tick=(now:number)=>{const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,3);setValue(target*eased);if(t<1)frame=requestAnimationFrame(tick)};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[target,active,duration,instant]);
 return value;
}
const indian=new Intl.NumberFormat('en-IN',{maximumFractionDigits:0});
/** Formats a counting value with Indian digit grouping, matching the rest of the case study. */
export function CountUp({value,active=true,instant=false,decimals=0,suffix=''}:{value:number;active?:boolean;instant?:boolean;decimals?:number;suffix?:string}){
 const current=useCountUp(value,active,1400,instant);
 const text=decimals?current.toFixed(decimals):indian.format(Math.round(current));
 return <span className="count-up" aria-label={(decimals?value.toFixed(decimals):indian.format(value))+suffix}><span aria-hidden="true">{text}{suffix}</span></span>;
}
