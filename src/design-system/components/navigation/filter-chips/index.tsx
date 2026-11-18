import {useRef} from 'react';
export function FilterChips<T extends string|number>({label,items,value,onChange,className='',panelId}:{label:string;items:{id:T;label:string;disabled?:boolean}[];value:T;onChange:(id:T)=>void;className?:string;panelId?:string}){
 const root=useRef<HTMLDivElement>(null);
 return <div ref={root} className={`filter-chips ${className}`} role="tablist" aria-label={label}>{items.map(item=><button type="button" role="tab" aria-selected={value===item.id} aria-controls={panelId} tabIndex={value===item.id?0:-1} disabled={item.disabled} key={item.id} className={value===item.id?'selected':''} onClick={()=>onChange(item.id)} onKeyDown={e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const enabled=items.filter(i=>!i.disabled);const current=enabled.findIndex(i=>i.id===item.id);const target=e.key==='Home'?enabled[0]:e.key==='End'?enabled.at(-1):enabled[(current+(e.key==='ArrowRight'?1:-1)+enabled.length)%enabled.length];if(!target)return;onChange(target.id);const element=root.current?.querySelectorAll<HTMLButtonElement>('button')[items.findIndex(i=>i.id===target.id)];element?.focus();element?.scrollIntoView({block:'nearest',inline:'nearest'});
 }}>{item.label}</button>)}</div>;
}
