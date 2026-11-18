import type {Chapter} from '../../content';
import './fragmentation.css';

/** Chamfered phone outline, matching the investor artwork's HUD geometry. */
const phone=(x:number,y:number,w=240,h=300,c=18)=>`M${x+c} ${y}H${x+w-c}L${x+w} ${y+c}V${y+h-c}L${x+w-c} ${y+h}H${x+c}L${x} ${y+h-c}V${y+c}Z`;
const chip=(x:number,y:number,w:number,h:number,c=8)=>`M${x+c} ${y}H${x+w}V${y+h-c}L${x+w-c} ${y+h}H${x}V${y+c}Z`;

/** A broken link between the fan and an app: two dashed halves and a snapped-chain mark. */
function Broken({from,to,color}:{from:[number,number];to:[number,number];color:string}){
 const [x1,y1]=from,[x2,y2]=to,mx=(x1+x2)/2,my=(y1+y2)/2,dx=(x2-x1)*.09,dy=(y2-y1)*.09;
 return <g className="frag-link" stroke={color}><path d={`M${x1} ${y1}L${mx-dx} ${my-dy}M${mx+dx} ${my+dy}L${x2} ${y2}`}/><g transform={`translate(${mx} ${my}) rotate(${Math.atan2(y2-y1,x2-x1)*180/Math.PI})`} className="frag-snap"><path d="M-30 -9h12a9 9 0 0 1 0 18h-12a9 9 0 0 1 0-18" transform="translate(-6 0) rotate(-12)"/><path d="M30 -9h-12a9 9 0 0 0 0 18h12a9 9 0 0 0 0-18" transform="translate(6 0) rotate(12)"/><path d="M-4 -20l-4-8M4 20l4 8M0 -22v-9M0 22v9" strokeWidth="2.5"/></g></g>;
}

/** Original illustration: one fan, three disconnected apps, and the missing free-to-play prediction home. */
function FragmentationArt({step}:{step:number}){
 const cyan='var(--cyan)',gold='var(--gold)',orange='var(--orange)',violet='var(--violet)';
 return <svg className="frag-art" viewBox="0 0 1180 780" role="img" aria-labelledby="frag-title frag-desc">
  <title id="frag-title">One fan, many apps</title>
  <desc id="frag-desc">A fan in the centre is connected by broken links to three separate apps: live scores and stats, quiz and trivia, and mobile games. A fourth slot for free-to-play live match predictions is empty.</desc>
  <defs>
   <radialGradient id="frag-halo"><stop offset="0" stopColor="var(--cyan)" stopOpacity=".22"/><stop offset="1" stopColor="var(--cyan)" stopOpacity="0"/></radialGradient>
   <radialGradient id="frag-gap"><stop offset="0" stopColor="var(--violet)" stopOpacity=".35"/><stop offset="1" stopColor="var(--violet)" stopOpacity="0"/></radialGradient>
   <linearGradient id="frag-screen" x2="0" y2="1"><stop offset="0" stopColor="var(--panel2)"/><stop offset="1" stopColor="var(--bg)"/></linearGradient>
  </defs>

  {/* The fan */}
  <g className="frag-fan">
   <circle cx="590" cy="390" r="200" fill="url(#frag-halo)"/>
   <g className="frag-orbit" fill="none" strokeWidth="4" strokeLinecap="round"><path d="M590 262a128 128 0 0 1 111 64" stroke={cyan}/><path d="M701 454a128 128 0 0 1-111 64" stroke={orange}/><path d="M479 454a128 128 0 0 1 0-128" stroke={gold}/><path d="m690 318 11 8 2-13M595 526l-11-8 9-9M473 334l6-12 8 11" stroke="var(--muted)" strokeWidth="3"/></g>
   <circle cx="590" cy="390" r="96" fill="var(--panel)" stroke="var(--line)" strokeWidth="2"/>
   <circle cx="590" cy="356" r="30" fill="var(--text)"/>
   <path d="M532 448c4-38 28-56 58-56s54 18 58 56Z" fill="var(--text)"/>
   <path d="M572 400l18 12 18-12" fill="none" stroke="var(--bg)" strokeWidth="5"/>
   <text x="590" y="443" textAnchor="middle" className="frag-jersey">12</text>
   <path d={chip(530,500,120,34)} fill="var(--bg)" stroke="var(--line)"/><text x="590" y="523" textAnchor="middle" className="frag-mono">THE FAN</text>
  </g>

  {/* App 1: live scores & stats */}
  <g className={'frag-app frag-scores'+(step>=0?' in':'')}>
   <Broken from={[505,330]} to={[330,200]} color={cyan}/>
   <path d={phone(70,40)} fill="url(#frag-screen)" stroke={cyan} strokeWidth="2.5"/>
   <circle cx="98" cy="78" r="6" fill="var(--pink)" className="frag-live"/><text x="112" y="84" className="frag-head" fill={cyan}>LIVE SCORES</text>
   <path d={chip(90,104,200,92)} fill="var(--panel)" stroke="var(--line)"/>
   <text x="190" y="164" textAnchor="middle" className="frag-score">2 : 1</text><text x="190" y="186" textAnchor="middle" className="frag-mono small">67′</text>
   <rect x="104" y="128" width="28" height="22" fill={cyan} opacity=".8"/><rect x="248" y="128" width="28" height="22" fill="var(--muted)" opacity=".6"/>
   {[0,1,2].map(i=><g key={i}><rect x="90" y={224+i*34} width="200" height="10" fill="var(--line)"/><rect x="90" y={224+i*34} width={[128,86,150][i]} height="10" fill={cyan}/></g>)}
   <path d="M98 318l30-18 26 10 32-26 30 14 34-22 30 8" fill="none" stroke={cyan} strokeOpacity=".5" strokeWidth="2.5"/>
  </g>

  {/* App 2: quiz & trivia */}
  <g className={'frag-app frag-quiz'+(step>=1?' in':'')}>
   <Broken from={[675,330]} to={[850,200]} color={gold}/>
   <path d={phone(870,40)} fill="url(#frag-screen)" stroke={gold} strokeWidth="2.5"/>
   <text x="892" y="84" className="frag-head" fill={gold}>QUIZ &amp; TRIVIA</text>
   <path d="M900 104h180l10 10v62l-10 10h-120l-26 22v-22h-34l-10-10v-62Z" fill="var(--panel)" stroke={gold} strokeOpacity=".6"/>
   <text x="990" y="168" textAnchor="middle" className="frag-big" fill={gold}>?</text>
   {['A','B','C'].map((letter,i)=><g key={letter}><path d={chip(890,226+i*34,200,26,6)} fill={i===1?'color-mix(in srgb,var(--gold) 22%,var(--panel))':'var(--panel)'} stroke={i===1?gold:'var(--line)'}/><text x="904" y={244+i*34} className="frag-mono small" fill={i===1?gold:'var(--muted)'}>{letter}</text><rect x="926" y={236+i*34} width={[110,90,124][i]} height="6" fill="var(--line)"/>{i===1&&<path d={`M1062 ${238+i*34}l7 7 13-14`} fill="none" stroke={gold} strokeWidth="3"/>}</g>)}
  </g>

  {/* App 3: mobile games, quick and long play */}
  <g className={'frag-app frag-games'+(step>=1?' in':'')}>
   <Broken from={[505,450]} to={[330,600]} color={orange}/>
   <path d={phone(70,440)} fill="url(#frag-screen)" stroke={orange} strokeWidth="2.5"/>
   <text x="92" y="484" className="frag-head" fill={orange}>MOBILE GAMES</text>
   <path d={chip(90,504,94,110)} fill="var(--panel)" stroke="var(--line)"/><path d={chip(196,504,94,110)} fill="var(--panel)" stroke="var(--line)"/>
   <g fill="none" stroke={orange} strokeWidth="3"><circle cx="137" cy="552" r="22"/><path d="M137 552v-12M137 552l9 6M131 526h12"/></g>
   <g fill="none" stroke={orange} strokeWidth="3"><path d="M228 534h32v12a16 16 0 0 1-32 0Z"/><path d="M228 540h-8a8 8 0 0 0 8 10M260 540h8a8 8 0 0 1-8 10M244 562v10M234 574h20"/></g>
   <text x="137" y="600" textAnchor="middle" className="frag-mono small">QUICK</text><text x="243" y="600" textAnchor="middle" className="frag-mono small">LONG PLAY</text>
   <g transform="translate(190 680)"><path d="M-62 -24h124a24 24 0 0 1 22 30l-6 18a14 14 0 0 1-24 4l-14-16h-80l-14 16a14 14 0 0 1-24-4l-6-18a24 24 0 0 1 22-30Z" fill="var(--panel)" stroke={orange} strokeWidth="2.5"/><path d="M-50 -2h22M-39 -13v22" stroke={orange} strokeWidth="4"/><circle cx="34" cy="-6" r="6" fill={orange}/><circle cx="50" cy="6" r="6" fill={orange} opacity=".6"/></g>
  </g>

  {/* The gap: no free-to-play home for live match predictions */}
  <g className={'frag-app frag-gap'+(step>=2?' in':'')}>
   <path className="frag-gap-link" d="M675 450L850 600" stroke={violet}/>
   <circle cx="990" cy="590" r="210" fill="url(#frag-gap)" className="frag-gap-glow"/>
   <path d={phone(870,440)} fill="color-mix(in srgb,var(--violet) 6%,transparent)" stroke={violet} strokeWidth="3" strokeDasharray="14 10" className="frag-gap-frame"/>
   <text x="892" y="484" className="frag-head" fill={violet}>LIVE PREDICTIONS</text>
   <text x="990" y="626" textAnchor="middle" className="frag-question" fill={violet}>?</text>
   <path d={chip(890,676,200,40)} fill={violet}/><text x="990" y="702" textAnchor="middle" className="frag-mono strong">FREE TO PLAY: NONE</text>
  </g>
 </svg>;
}

export function FragmentationSlide({chapter,step}:{chapter:Chapter;step:number}){
 const title=chapter.title.split('\n');
 return <div className="s-frag">
  <div className="s-frag-copy">
   <h1 className="s-title">{title.map((line,i)=><span key={i}>{i>0?<em>{line}</em>:line}<br/></span>)}</h1>
   <ul className="s-frag-legend" aria-label="Where fans go today">
    <li className={'cyan'+(step>=0?' in':'')}><i/>Scores &amp; stats</li>
    <li className={'gold'+(step>=1?' in':'')}><i/>Quiz &amp; trivia</li>
    <li className={'orange'+(step>=1?' in':'')}><i/>Mobile games</li>
    <li className={'violet gap'+(step>=2?' in':'')}><i/>Free live predictions</li>
   </ul>
   <p className={'s-frag-punch'+(step>=2?' in':'')}>{chapter.description}</p>
  </div>
  <FragmentationArt step={step}/>
 </div>;
}
