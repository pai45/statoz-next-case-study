import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const tokens=await fs.readFile(path.join(root,'public/assets/statoz-tokens.css'),'utf8');
const token=n=>{const v=tokens.match(new RegExp('--ds-color-'+n+':\\s*([^;]+);'))?.[1];if(!v)throw Error(n);return v};
const c={bg:token('background-primary'),panel:token('background-secondary'),raised:token('background-elevated'),line:token('border-default'),text:token('text-default'),muted:token('text-muted'),cyan:token('accent-cyan'),violet:token('accent-violet'),orange:token('accent-orange'),lime:token('accent-lime')};
const out=path.join(root,'public/assets/investor-artifacts');await fs.mkdir(out,{recursive:true});
const label=(x,y,t,color=c.muted,size=12,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" font-weight="700" letter-spacing="2" text-anchor="${anchor}">${t}</text>`;
const plate=(x,y,w,h,color=c.cyan,fill=c.panel)=>`<path d="M${x+12} ${y}H${x+w-12}l12 12v${h-24}l-12 12H${x+12}l-12-12V${y+12}Z" fill="${fill}" stroke="${color}" stroke-width="1.5"/>`;
const icon=(k,x,y,color,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="miter">${k==='follow'?'<path d="M-25-18h50v36h-50zM0-18v36"/><circle r="9"/><path d="M-25-9h8V9h-8m50-18h-8V9h8"/>':k==='predict'?'<path d="M-22-23h44V7L0 26-22 7Z"/><path d="m-10 0 7 7L12-9"/>':k==='coin'?'<path d="M-23-11 0-24l23 13v24L0 26-23 13Z"/><path d="m0-12 11 6v12L0 13-11 6V-6Z"/>':k==='shield'?'<path d="M0-27 25-17v21Q23 19 0 30-23 19-25 4v-21Z"/><path d="m-11 0 8 9L14-11"/>':'<path d="M-19-14h38l12 30-7 5-12-12h-24l-12 12-7-5Z"/><path d="M-17-7V5m-6-6h12"/><circle cx="15" cy="-3" r="2"/><circle cx="22" cy="3" r="2"/>'}</g>`;
const svg=(title,body,a=c.cyan,w=560,h=320)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">Original StatOz editorial artwork. Not a product screenshot or measured data.</desc><defs><linearGradient id="surface" x2="1" y2="1"><stop stop-color="${c.raised}"/><stop offset="1" stop-color="${c.bg}"/></linearGradient><radialGradient id="halo"><stop stop-color="${a}" stop-opacity=".16"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="${a}" stroke-opacity=".09"/></pattern><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="100%" height="100%" fill="url(#halo)"/><rect x="12" y="12" width="${w-24}" height="${h-24}" fill="url(#grid)"/><path d="M12 44V12h48m${w-120} 0h48v32M12 ${h-44}v32h48m${w-120} 0h48v-32" fill="none" stroke="${a}" stroke-opacity=".5"/>${body}</svg>`;
const art={};
art.follow=svg('Follow the action: illuminated stadium and match timeline',`
<g fill="none" stroke="${c.cyan}" stroke-opacity=".18"><path d="m30 240 250-100 250 100-250 65ZM65 254l215-85 215 85M110 273l170-67 170 67M280 140v165"/></g>
<path d="M85 122 280 52l195 70v54L280 253 85 176Z" fill="${c.bg}" stroke="${c.line}" stroke-width="2"/>
<path d="m85 122 195 77 195-77v18l-195 77-195-77Z" fill="${c.raised}" stroke="${c.cyan}" stroke-opacity=".5"/>
<path d="m108 121 172-61 172 61-172 66Z" fill="url(#surface)" stroke="${c.cyan}" stroke-width="2"/>
<path d="m135 123 145-50 145 50-145 55Z" fill="${c.bg}" stroke="${c.cyan}" stroke-opacity=".35"/>
<path d="m154 133 126-45 126 45-126 48Z" fill="${c.cyan}" fill-opacity=".1" stroke="${c.cyan}" stroke-width="2"/>
<g fill="none" stroke="${c.cyan}" stroke-width="1.5"><path d="m217 111 126 46m-106 9-63-24 35-12 63 24Zm63-78 63 23-35 13-63-23Z"/><ellipse cx="280" cy="134" rx="29" ry="10"/><path d="M102 130V60m-17 0h34m-30-6h26M458 130V60m-17 0h34m-30-6h26"/></g>
<g fill="${c.cyan}" opacity=".1"><path d="m89 60 54 85-75-12ZM445 60l-32 85 75-12Z"/></g>
${plate(204,23,152,34)}${label(280,45,'MATCHDAY',c.cyan,12,'middle')}
<path d="M114 275h332" stroke="${c.line}" stroke-width="2"/>
${[126,225,330,434].map((x,i)=>`<path d="m${x} 269 6 6-6 6-6-6Z" fill="${i===3?c.cyan:c.raised}" stroke="${c.cyan}"/>`).join('')}
${label(126,300,'FIXTURE',c.muted,9,'middle')}${label(280,300,'MATCH INTEL',c.muted,9,'middle')}${label(434,300,'FINAL',c.cyan,9,'middle')}`);
art.predict=svg('Make your call: three outcomes and a locked prediction',`
<g fill="none" stroke="${c.violet}" stroke-opacity=".28" stroke-dasharray="5 7"><path d="M76 78h408M118 72v105l162 50 162-50V72M280 78v149"/></g>
${[98,230,362].map((x,i)=>`${plate(x,35,100,64,i===0?c.violet:c.line,i===0?c.raised:c.panel)}${label(x+50,73,['HOME','DRAW','AWAY'][i],i===0?c.violet:c.muted,13,'middle')}`).join('')}
<path d="M148 99v38l132 40" fill="none" stroke="${c.violet}" stroke-width="3"/>
<path d="m184 140 96-32 96 32v94l-96 38-96-38Z" fill="${c.bg}" stroke="${c.violet}" stroke-opacity=".4"/>
<path d="m194 130 86-30 86 30v94l-86 34-86-34Z" fill="url(#surface)" stroke="${c.violet}" stroke-width="2"/>
${icon('predict',280,166,c.violet,1.05)}${label(280,226,'CALL LOCKED',c.text,12,'middle')}
${plate(367,205,154,44,c.violet)}${label(444,232,'VIRTUAL COINS',c.violet,10,'middle')}
${label(35,289,'01 / CHOOSE',c.muted,10)}${label(218,289,'02 / LOCK',c.violet,10)}${label(408,289,'03 / RESULT',c.muted,10)}`,c.violet);
art.play=svg('Beyond matchday: sports games and an arcade controller',`
<g fill="none" stroke="${c.orange}" stroke-opacity=".2"><path d="m45 223 235-85 235 85-235 82ZM95 242l185-67 185 67M155 265l125-45 125 45M280 138v167"/></g>
${plate(28,44,113,93,c.orange)}${label(85,158,'BASKETBALL',c.muted,9,'middle')}
<g fill="none" stroke="${c.orange}" stroke-width="2"><circle cx="85" cy="88" r="28"/><path d="M57 88h56M85 60v56M65 68q39 6 39 40M65 108q6-39 39-40"/></g>
${plate(419,44,113,93,c.orange)}${label(475,158,'ARCHERY',c.muted,9,'middle')}
<g fill="none" stroke="${c.orange}" stroke-width="2"><circle cx="475" cy="89" r="29"/><circle cx="475" cy="89" r="18"/><circle cx="475" cy="89" r="6"/><path d="m475 89 38-38m-10 1 11-2-2 11"/></g>
<path d="M147 151h40l35-31h116l35 31h40l25 83-14 22-40-9-41-39H217l-41 39-40 9-14-22Z" fill="${c.bg}" stroke="${c.orange}" stroke-opacity=".3"/>
<path d="M147 140h40l35-31h116l35 31h40l25 83-14 22-40-9-41-39H217l-41 39-40 9-14-22Z" fill="url(#surface)" stroke="${c.orange}" stroke-width="2.5"/>
<path d="M182 149v38m-19-19h38" stroke="${c.orange}" stroke-width="7"/>
<g fill="${c.orange}"><circle cx="370" cy="155" r="7"/><circle cx="389" cy="173" r="7"/></g><g fill="none" stroke="${c.orange}" stroke-width="2"><circle cx="351" cy="173" r="6"/><circle cx="370" cy="191" r="6"/></g>
<path d="M247 139h66m-54 11h42" stroke="${c.muted}" stroke-width="2"/>${label(280,180,'STATOZ',c.text,13,'middle')}${label(280,288,'ONE MORE GAME',c.orange,12,'middle')}`,c.orange);
art.network=svg('One fan home connecting follow, predict and play',`
<g fill="none" stroke="${c.line}"><circle cx="360" cy="320" r="220" stroke-dasharray="4 10"/><circle cx="360" cy="320" r="160"/><path d="M360 50v540M70 320h580" opacity=".4"/></g>
${[{x:360,y:105,a:c.cyan,k:'follow',name:'FOLLOW',sub:'Scores + statistics'},{x:145,y:455,a:c.violet,k:'predict',name:'PREDICT',sub:'Predictions + picks'},{x:575,y:455,a:c.orange,k:'play',name:'PLAY',sub:'Knowledge + games'}].map(n=>`<path d="M360 320 ${n.x} ${n.y}" fill="none" stroke="${n.a}" stroke-width="2"/><path d="M360 320 ${n.x} ${n.y}" fill="none" stroke="${n.a}" stroke-width="7" opacity=".3" filter="url(#glow)"/>${plate(n.x-114,n.y-60,228,134,n.a)}${icon(n.k,n.x,n.y-15,n.a,.8)}${label(n.x,n.y+34,n.name,n.a,17,'middle')}${label(n.x,n.y+63,n.sub,c.muted,10,'middle')}`).join('')}
<path d="m360 230 83 46v90l-83 46-83-46v-90Z" fill="${c.bg}" stroke="${c.cyan}" stroke-width="2"/><path d="m360 242 72 40v76l-72 41-72-41v-76Z" fill="url(#surface)" stroke="${c.violet}" stroke-opacity=".6"/>
${label(360,321,'StatOz',c.text,28,'middle')}${label(360,347,'THE FAN HOME',c.cyan,10,'middle')}${label(360,606,'FOLLOW. PREDICT. PLAY.',c.muted,13,'middle')}`,c.cyan,720,640);
art['fan-pass']=svg('Free to play: virtual coins and sports knowledge',`
<path d="m185 57 100-28 112 37v165l-106 60-106-48Z" fill="${c.bg}" stroke="${c.lime}" stroke-opacity=".3"/>
<path d="m178 44 100-28 112 37v165l-106 60-106-48Z" fill="url(#surface)" stroke="${c.lime}" stroke-width="2"/>
${icon('shield',284,117,c.lime,1.8)}${label(284,216,'FREE TO PLAY',c.text,17,'middle')}
${plate(37,90,103,103,c.cyan)}${icon('coin',89,140,c.cyan,1.1)}${label(89,218,'VIRTUAL COINS',c.cyan,9,'middle')}
${plate(430,90,103,103,c.orange)}${icon('play',482,140,c.orange,1.1)}${label(482,218,'SPORTS PLAY',c.orange,9,'middle')}
<path d="M140 141h38m212 0h40" stroke="${c.lime}" stroke-width="2"/>`,c.lime);
for(const [name,data] of Object.entries(art))await fs.writeFile(path.join(out,name+'.svg'),data);
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({source:'Original editable SVG illustrations generated from public/assets/statoz-tokens.css',purpose:'Investor deck editorial artwork; not product captures or data visualizations',artifacts:Object.keys(art).map(n=>n+'.svg')},null,2));
console.log('Built '+Object.keys(art).length+' StatOz investor SVG artifacts.');
