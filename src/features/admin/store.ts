import {useEffect,useState} from 'react';
import {activation,adminPages,initialMatches,initialQuizzes,initialPredictions,demoUsers,initialAssets,type AdminPage} from './data';
export type AdminState=ReturnType<typeof seedAdmin>;
export function seedAdmin(page:AdminPage='dashboard'){return {version:2,page,range:'7',day:activation[0].date,search:'',tournament:'NBA',sport:'All sports',status:'All statuses',dialog:'',draft:{} as Record<string,string>,error:'',notice:'',matches:initialMatches,quizzes:initialQuizzes,predictions:initialPredictions,users:demoUsers,assets:initialAssets,audit:[] as {id:string;action:string;at:string}[]};}
export function useAdminStore(){
 const params=new URLSearchParams(location.search),workspace=params.get('workspace')||'local',key='statoz.case.admin.v2.'+workspace;
 const requested=params.get('page')||'dashboard',page=(adminPages.some(p=>p.id===requested)?requested:'dashboard') as AdminPage;
 const read=():AdminState=>{try{const saved=JSON.parse(localStorage.getItem(key)||'null');return saved?.version===2?saved:seedAdmin(page)}catch{return seedAdmin(page)}};
 const [state,setState]=useState(read);
 const change=(mutate:(latest:AdminState)=>AdminState)=>{const next=mutate(read());try{localStorage.setItem(key,JSON.stringify(next))}catch{}setState(next);window.dispatchEvent(new Event('statoz-admin-changed'));};
 const patch=(values:Partial<AdminState>)=>change(s=>({...s,...values}));
 const navigate=(next:AdminPage)=>change(s=>({...s,page:next,search:'',status:'All statuses',dialog:'',error:''}));
 const record=(action:string,mutate:(latest:AdminState)=>AdminState)=>change(s=>({...mutate(s),dialog:'',error:'',notice:action+' · saved in this local demo',audit:[{id:crypto.randomUUID(),action,at:new Date().toISOString()},...s.audit].slice(0,40)}));
 useEffect(()=>{
  change(s=>({...s,page,dialog:'',error:''}));
  const refresh=()=>setState(read()),storage=(e:StorageEvent)=>{if(e.key===key)refresh()};
  const reset=(e:MessageEvent)=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='statoz-admin-reset')return;change(()=>seedAdmin(page))};
  addEventListener('storage',storage);addEventListener('statoz-admin-changed',refresh);addEventListener('message',reset);
  return()=>{removeEventListener('storage',storage);removeEventListener('statoz-admin-changed',refresh);removeEventListener('message',reset)};
 },[key]);
 useEffect(()=>{const route='/admin?page='+state.page;parent.postMessage({type:'statoz-admin-route',route},location.origin);},[state.page]);
 return {state,patch,change,navigate,record,reset:()=>change(()=>seedAdmin())};
}
export type AdminStore=ReturnType<typeof useAdminStore>;
