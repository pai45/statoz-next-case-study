import {useId} from 'react';
export function AdminChart({values,labels,title}:{values:number[];labels:string[];title:string}){
 const id=useId(),max=Math.max(...values,1)*1.2,points=values.map((v,i)=>[34+i*932/Math.max(1,values.length-1),174-v/max*132]),line=points.map(([x,y],i)=>(i?'L':'M')+x+','+y).join(' '),tick=Math.max(1,Math.ceil(values.length/10));
 return <svg className="adm-chart-svg" viewBox="0 0 1000 214" role="img" aria-label={title}>
  <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--adm-accent)" stopOpacity=".26"/><stop offset="1" stopColor="var(--adm-accent)" stopOpacity="0"/></linearGradient></defs>
  {[46,106,174].map(y=><path key={y} d={'M20 '+y+'H980'} className="adm-chart-grid"/>)}
  <path d={line+'L966,185H34Z'} fill={'url(#'+id+')'}/><path d={line} fill="none" stroke="var(--adm-accent)" strokeWidth="2.5"/>
  {points.map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="3.5" fill="var(--adm-accent)"/>{(values.length<=21||i%tick===0||i===values.length-1)&&<><text x={x} y={y-12} textAnchor="middle" className="adm-chart-value">{values[i]}</text><text x={x} y="208" textAnchor="middle" className="adm-chart-date">{labels[i]}</text></>}<circle className="adm-chart-hit" tabIndex={0} cx={x} cy={y} r="13"><title>{labels[i]+': '+values[i]}</title></circle></g>)}
 </svg>;
}
