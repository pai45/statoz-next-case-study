// Presentation transport only. The Games application and its rendered UI are unchanged.
(()=>{
 const parentOrigin='http://127.0.0.1:4411',prefix='/statoz-next-games-web';
 let mutedUntil=0,lastRoute='',scrollTimer;
 const route=()=>location.pathname.replace(new RegExp('^'+prefix),'')+location.search+location.hash||'/';
 lastRoute=route();
 const send=(kind,payload)=>parent.postMessage({type:'statoz-games-frame',kind,...payload},parentOrigin);
 const clean=text=>String(text||'').replace(/\s+/g,' ').trim();
 function locator(el){
  if(!(el instanceof Element))return null;
  const parts=[];let node=el;
  while(node&&node!==document.documentElement){let part=node.tagName.toLowerCase();const siblings=node.parentElement?Array.from(node.parentElement.children).filter(s=>s.tagName===node.tagName):[];if(siblings.length>1)part+=':nth-of-type('+(siblings.indexOf(node)+1)+')';parts.unshift(part);node=node.parentElement;}
  return {path:'html'+(parts.length?'>'+parts.join('>'):''),tag:el.tagName,label:el.getAttribute('aria-label'),text:clean(el.textContent).slice(0,180)};
 }
 function find(spec){
  const exact=document.querySelector(spec.path);
  if(exact&&exact.tagName===spec.tag&&(!spec.label||exact.getAttribute('aria-label')===spec.label))return exact;
  return Array.from(document.querySelectorAll(spec.tag.toLowerCase())).find(el=>spec.label?el.getAttribute('aria-label')===spec.label:clean(el.textContent).slice(0,180)===spec.text);
 }
 document.addEventListener('click',event=>{if(!event.isTrusted)return;const el=event.target instanceof Element?event.target.closest('button,a,input,select,[role="tab"],[role="button"]'):null;if(!el||el instanceof HTMLInputElement||el instanceof HTMLSelectElement)return;send('action',{action:{type:'click',element:locator(el)}});},true);
 document.addEventListener('input',event=>{if(!event.isTrusted)return;const el=event.target;if(!(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement||el instanceof HTMLSelectElement))return;if(el instanceof HTMLInputElement&&el.type==='password')return;send('action',{action:{type:'input',element:locator(el),value:el.value,checked:el instanceof HTMLInputElement?el.checked:undefined}});},true);
 document.addEventListener('scroll',event=>{if(Date.now()<mutedUntil)return;const el=event.target===document?document.scrollingElement:event.target;if(!(el instanceof Element))return;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>send('action',{action:{type:'scroll',element:locator(el),top:el.scrollTop,left:el.scrollLeft}}),80);},true);
 addEventListener('message',event=>{
  if(event.source!==parent||event.origin!==parentOrigin||event.data?.type!=='statoz-games-command')return;
  const action=event.data.action;mutedUntil=Date.now()+350;
  if(action.type==='route'){if(route()!==action.route)setTimeout(()=>{if(route()!==action.route)location.assign(prefix+action.route)},350);return;}
  if(action.type==='reset'){location.assign(prefix+'/');return;}
  const el=action.element&&find(action.element);if(!el)return;
  if(action.type==='click'&&el instanceof HTMLElement)el.click();
  if(action.type==='scroll')el.scrollTo({top:action.top,left:action.left,behavior:'instant'});
  if(action.type==='input'&&(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement||el instanceof HTMLSelectElement)){
   const proto=el instanceof HTMLInputElement?HTMLInputElement.prototype:el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLSelectElement.prototype;
   Object.getOwnPropertyDescriptor(proto,'value')?.set?.call(el,action.value);
   if(el instanceof HTMLInputElement&&['checkbox','radio'].includes(el.type))Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'checked')?.set?.call(el,action.checked);
   el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
  }
 });
 setInterval(()=>{const current=route();if(current!==lastRoute){lastRoute=current;send('route',{route:current})}},120);
 addEventListener('DOMContentLoaded',()=>send('ready',{route:route()}));
})();
