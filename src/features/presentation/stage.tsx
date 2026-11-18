import { sitePath } from '../../hosting';
import {createContext,useContext,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {imagePath,type Chapter} from '../../content';
import type {usePresentation} from '../../session';
import {cohorts,metrics} from '../../metrics.mjs';
import {downloads,tractionTiles} from '../../traction-evidence';
import {pitchFacts,isFilled} from '../../pitch-facts';
import {CountUp} from './use-count-up';
import {OpportunityIllustration} from './opportunity-illustration';
import {ProductDevice} from './product-visuals';
import {SportsDevice} from './sports-device';
import {GamesDevice} from './games-device';
import {AdminDevice} from './admin-device';
import {LaptopFrame} from '../../design-system/components/layout/laptop-frame';
import {ScreensStage} from './screens-stage';
import {VideoStage} from '../../video-stage';
import {DemoStage} from '../../demo-stage';
import './stage.css';
import './investor-art-direction.css';
import {FragmentationSlide} from './fragmentation-slide';

type Presentation=ReturnType<typeof usePresentation>;
/** preview: presenter-desk thumbnail. Static media, no interaction, founder placeholders visible. */
const StageMode=createContext({preview:false});
const pad=(n:number)=>String(n).padStart(2,'0');
const metric=(test:(m:(typeof metrics)[number])=>boolean)=>metrics.find(test)?.value??0;

/** Sourced figures used on the stage. All values come from src/metrics.mjs (report, 2 Nov 2026). */
export const stageFacts={
 registered:metric(m=>m.label==='Registered users'),
 coins:metric(m=>m.label==='Coins placed'&&m.category==='Overview'),
 matches:metric(m=>m.label==='Mini-game matches'&&m.category==='Overview'),
 predictionPlaysPerPlayer:metric(m=>m.category==='Core games'&&m.label==='Plays per player'&&m.dimension==='Prediction'),
 fourPlusShare:metric(m=>m.category==='Play frequency'&&m.label==='Platform player share'&&m.dimension==='4+ times'),
 october:Number(cohorts.find(([month])=>month==='Oct')?.[1]??0),
 octoberActivation:Number(cohorts.find(([month])=>month==='Oct')?.[2]??0),
 april:Number(cohorts[0]?.[1]??0),
};
/** A fixed 1920 × 1080 canvas scaled to fit its parent, so every chapter fills one screen without scrolling. */
export function StageCanvas({children,className=''}:{children:ReactNode;className?:string}){
 const host=useRef<HTMLDivElement>(null),[scale,setScale]=useState(0);
 useLayoutEffect(()=>{const element=host.current;if(!element)return;const fit=()=>setScale(Math.min(element.clientWidth/1920,element.clientHeight/1080));fit();const observer=new ResizeObserver(fit);observer.observe(element);return()=>observer.disconnect()},[]);
 return <div ref={host} className={'stage-viewport '+className}><div className="stage-canvas" style={{transform:`translate(-50%,-50%) scale(${scale||0.001})`}}>{children}</div></div>;
}

/** Shown only on the presenter preview, never to investors. */
function Missing({label}:{label:string}){const {preview}=useContext(StageMode);return preview?<span className="founder-fill">FOUNDER TO FILL · {label}</span>:null}
function Build({show,children,className=''}:{show:boolean;children:ReactNode;className?:string}){return <div className={'build '+(show?'in ':'')+className} aria-hidden={!show}>{children}</div>}
function Title({chapter,small=false}:{chapter:Chapter;small?:boolean}){return <h1 className={'s-title'+(small?' small':'')}>{chapter.title.split('\n').map((line,i)=><span key={i}>{i>0?<em>{line}</em>:line}<br/></span>)}</h1>}

export function StageSlide({presentation,chapter,preview=false,step:fixedStep,phase:fixedPhase}:{presentation:Presentation;chapter:Chapter;preview?:boolean;step?:number;phase?:string}){
 const {state,visible}=presentation,phase=fixedPhase??state.phase,steps=chapter.steps||1;
 const step=Math.max(0,Math.min(fixedStep??state.step??0,steps-1)),index=visible.indexOf(chapter.id);
 return <StageMode.Provider value={{preview}}><div className={'stage-slide '+chapter.accent+' phase-'+phase+(preview?' is-preview':'')} key={chapter.id+':'+phase}>
  {!preview&&<div className="stage-wipe" aria-hidden="true"/>}
  <header className="stage-top"><img src={sitePath("/assets/logo.png")} alt=""/><b>StatOz</b>{chapter.eyebrow&&<><i aria-hidden="true"/><span>{chapter.eyebrow}</span></>}</header>
  <main className="stage-body">{phase==='intro'?<Intro presentation={presentation} chapter={chapter} step={step}/>:<Media presentation={presentation} chapter={chapter} phase={phase}/>}</main>
  <footer className="stage-bottom"><div className="stage-progress" aria-hidden="true">{visible.map((id,i)=><span key={id} className={i===index?'current':i<index?'done':''}/>)}</div>{steps>1&&phase==='intro'&&<span className="stage-steps" aria-label={`Build ${step+1} of ${steps}`}>{Array.from({length:steps},(_,i)=><i key={i} className={i<=step?'on':''}/>)}</span>}<span className="stage-page">{index<0?'APPENDIX':pad(index+1)+' / '+pad(visible.length)}</span></footer>
 </div></StageMode.Provider>;
}

function Media({presentation,chapter,phase}:{presentation:Presentation;chapter:Chapter;phase:string}){
 const {preview}=useContext(StageMode),{state}=presentation;
 const heading=<div className="s-media-head"><h1 className="s-title small">{chapter.label}</h1></div>;
 if(preview){const id=chapter.screens[phase==='screens'?state.screen:0]||chapter.screens[0];return <div className="s-media">{heading}<div className="s-media-box preview-media">{id&&!id.endsWith('-clip')?<img src={imagePath(id)} alt=""/>:<span>{phase==='video'?'Investor demo video':'Interactive product'}</span>}</div></div>}
 return <div className={'s-media s-media-'+phase}>{heading}<div className="s-media-box">{phase==='screens'&&chapter.screens.length>0&&<ScreensStage chapter={chapter} presentation={presentation}/>}{phase==='video'&&chapter.video&&<VideoStage chapter={chapter} presentation={presentation}/>}{phase==='demo'&&chapter.targets&&<DemoStage chapter={chapter} presentation={presentation}/>}</div></div>;
}

function Intro({presentation,chapter,step}:{presentation:Presentation;chapter:Chapter;step:number}){
 switch(chapter.id){
  case 'home':return <TitleSlide/>;
  case 'fragmentation':return <FragmentationSlide chapter={chapter} step={step}/>;
  case 'opportunity':return <OpportunitySlide chapter={chapter} step={step}/>;
  case 'traction':return <TractionSlide chapter={chapter} step={step}/>;
  case 'business':return <BusinessSlide chapter={chapter} step={step}/>;
  case 'free-to-play':return <FreeToPlaySlide chapter={chapter}/>;
  case 'market':return <MarketSlide chapter={chapter} step={step}/>;
  case 'investment':return <AskSlide chapter={chapter} step={step}/>;
  case 'close':return <div className="s-close"><h1 className="s-title">{chapter.title}</h1></div>;
  default:return <ProductSlide presentation={presentation} chapter={chapter}/>;
 }
}

function TitleSlide(){return <div className="s-home">
 <div className="hero-copy"><div className="s-kicker">FOLLOW. PREDICT. PLAY.</div><h1 className="s-title">A daily home.<br/>For <em>every fan.</em></h1><p className="s-lead">From the first fixture to one more game. The product, the platform and the opportunity behind StatOz.</p></div>
 <div className="s-home-devices"><div className="s-home-phone"><ProductDevice id="source-home" label="StatOz Sports Web mobile screen" className="hero-device"/></div><div className="s-home-landscape"><ProductDevice id="game-source-home" label="StatOz Games Web home" className="hero-device"/></div></div>
</div>}

function OpportunitySlide({chapter,step}:{chapter:Chapter;step:number}){
 const cards=[{habit:'follow' as const,word:'FOLLOW',title:'The matchday habit',text:'Fixtures, standings and the detail behind the score.',color:'cyan'},{habit:'predict' as const,word:'PREDICT',title:'A point of view',text:'Prediction questions, match picks and season futures.',color:'violet'},{habit:'play' as const,word:'PLAY',title:'Between the fixtures',text:'Sports knowledge and playable games, every day.',color:'orange'}];
 return <div className="s-opportunity"><div className="s-head"><Title chapter={chapter}/><p className="s-lead">{chapter.description}</p></div>
  <div className="s-cards three">{cards.map(({habit,word,title,text,color},i)=><Build key={word} show={step>=i} className={'s-card habit-card '+color}><div className="habit-card-top"><small>{word}</small><span className="s-num">{pad(i+1)}</span></div><OpportunityIllustration habit={habit}/><h3>{title}</h3><p>{text}</p></Build>)}</div>
 </div>;
}

function ProductSlide({presentation,chapter}:{presentation:Presentation;chapter:Chapter}){
 const {preview}=useContext(StageMode),{state}=presentation,target=chapter.targets?.[state.target]||chapter.targets?.[0];
 const games=target?.product==='games',admin=target?.product==='admin',sports=target?.product==='sports',key=chapter.id+':'+state.target;
 const device=preview||!target||(!sports&&!games&&!admin)?(chapter.screens[0]?.endsWith('-clip')?<video src={imagePath(chapter.screens[0])} muted preload="metadata"/>:chapter.id==='admin'?<LaptopFrame label="Local Admin dashboard preview"><img src={imagePath(chapter.screens[0])} alt="Local Admin dashboard"/></LaptopFrame>:chapter.screens[0]?<ProductDevice id={chapter.screens[0]} label={chapter.label+' product screen'}/>:null)
  :admin?<AdminDevice key={key} presentation={presentation} route={target.route} routeKey={key} className="stage-admin-device"/>
  :games?<GamesDevice key={key} presentation={presentation} route={target.route} routeKey={key} className="stage-games-device"/>
  :<SportsDevice key={key} presentation={presentation} route={target.route} routeKey={key} className="stage-sports-device"/>;
 return <div className={'s-product'+(games?' games':admin?' admin':'')+(['admin','studio'].includes(chapter.id)?' wide':'')}>
  <div className="s-product-copy"><Title chapter={chapter} small={games||admin}/><p className="s-lead">{chapter.description}</p>{!games&&!admin&&<ol className="s-points">{chapter.points.map((point,i)=><li key={point}><span>{pad(i+1)}</span>{point}</li>)}</ol>}</div>
  <div className="s-product-device">{device}</div>
 </div>;
}

function TractionSlide({chapter,step}:{chapter:Chapter;step:number}){
 const {preview}=useContext(StageMode),max=Math.max(...cohorts.map(([,v])=>Number(v)));
 const tiles = [
  {value:stageFacts.registered,label:'Registered users'},
  {value:stageFacts.octoberActivation,label:'October activation',suffix:'%'},
  {value:stageFacts.predictionPlaysPerPlayer,label:'Prediction plays per player',decimals:1},
  {value:stageFacts.fourPlusShare,label:'Players with 4+ plays',suffix:'%'},
 ];
 return <div className="s-traction"><div className="s-head row"><Title chapter={chapter} small/><p className="s-lead">{chapter.description}</p></div>
  <div className="s-traction-grid">
   <Build show={step>=0} className="s-answer">
    <span className="s-label">{downloads.label}</span>
    <strong><CountUp value={downloads.value} active={step>=0} instant={preview}/></strong>
   </Build>
   <Build show={step>=1} className="s-growth"><div className="s-label row"><span>MONTHLY SIGNUPS</span><span>{(stageFacts.october/stageFacts.april).toFixed(1)}× APRIL → OCTOBER</span></div><div className="s-bars">{cohorts.map(([month,value])=><div key={month} className={month==='Oct'?'latest':''}><b>{Number(value).toLocaleString('en-IN')}</b><span className="s-bar" style={{['--h' as string]:Number(value)/max*100+'%'}}/><small>{month}</small></div>)}</div></Build>
  </div>
  <Build show={step>=2} className="s-tiles">
   {tractionTiles.map(({value,label})=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}
   {tiles.map(({value,label,decimals,suffix})=><div key={label}><strong><CountUp value={value} active={step>=2} decimals={decimals} suffix={suffix} instant={preview}/></strong><span>{label}</span></div>)}
  </Build>
 </div>;
}

/** Feature illustrations for the commercial model, using the active StatOz accent. */
function DeckGlyph({kind}:{kind:string}){
 const paths:Record<string,string>={'Ads':'M8 12h32v24H8zM19 18l13 6-13 6zM14 41h20','Coins & assets':'M24 4 42 14v20L24 44 6 34V14ZM24 13l10 6v11l-10 6-10-6V19Z','Brand collaborations':'M6 12h16v16H6ZM26 20h16v16H26ZM14 28v8h12M22 12h12v8','Affiliate':'M19 29l10-10M15 33l-3 3a8 8 0 0 1-11-11l10-10a8 8 0 0 1 11 0M33 15l3-3a8 8 0 0 1 11 11L37 33a8 8 0 0 1-11 0','Membership':'M24 4 42 13v17L24 44 6 30V13ZM24 12l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1Z'};
 return <svg className="deck-glyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={paths[kind]||paths.Membership}/></svg>;
}

function BusinessSlide({chapter,step}:{chapter:Chapter;step:number}){
 return <div className="s-business"><div className="s-head row"><Title chapter={chapter} small/><p className="s-lead">{chapter.description}</p></div>
  <Build show={step>=0} className="s-live">{[['Ads','In-app and optional rewarded ads.'],['Coins & assets','Optional purchases in the current app.']].map(([title,text])=><article key={title}><DeckGlyph kind={title}/><small className="live">LIVE · FOUNDER-REPORTED</small><h3>{title}</h3><p>{text}</p></article>)}</Build>
  <Build show={step>=1} className="s-planned"><div className="s-label">PLANNED · AFTER REPEAT PLAY IS PROVEN</div><div>{[['Brand collaborations','Sponsored quizzes, challenges and packs.'],['Affiliate','Tickets, merchandise and streaming partners.'],['Membership','Ad-free play, bonus XP and seasonal rewards.']].map(([title,text])=><article key={title}><DeckGlyph kind={title}/><h3>{title}</h3><p>{text}</p></article>)}</div><p className="s-principle"><b>Validate repeat play. Then scale what works.</b> No revenue total is asserted here.</p></Build>
 </div>;
}

function FreeToPlaySlide({chapter}:{chapter:Chapter}){
 const {preview}=useContext(StageMode),items=pitchFacts.compliance.filter(item=>preview||item.confirmed);
 return <div className="s-free"><div className="s-head"><Title chapter={chapter}/><p className="s-lead wide">{chapter.description}</p></div>
  <img className="s-free-art" src={sitePath("/assets/investor-artifacts/fan-pass.svg")} alt="Free-to-play fan pass with virtual coins and sports play."/><ul className="s-checks">{items.map(item=><li key={item.text} className={item.confirmed?'':'unconfirmed'}><span aria-hidden="true">✓</span>{item.text}{!item.confirmed&&<span className="founder-fill">FOUNDER TO CONFIRM WITH COUNSEL</span>}</li>)}</ul>
 </div>;
}

function MarketSlide({chapter,step}:{chapter:Chapter;step:number}){
 const sizes=[pitchFacts.market.tam,pitchFacts.market.sam,pitchFacts.market.som];
 return <div className="s-market"><div className="s-market-copy"><Title chapter={chapter}/><p className="s-lead">{chapter.description}</p>
   <Build show={step>=1} className="s-position">{pitchFacts.positioning.map(row=><div key={row.habit}><b>{row.habit}</b><span>Today: {row.where}</span><span>StatOz: {row.statoz}</span></div>)}</Build>
  </div>
  <img className="s-network-art" src={sitePath("/assets/investor-artifacts/network.svg")} alt="StatOz connects following scores and statistics, making predictions and picks, and playing knowledge and sports games."/>
  <Build show={step>=1} className="s-sizes">{sizes.map(size=>isFilled(size.value)?<div key={size.label}><strong>{size.value}</strong><span>{size.label}</span><small>{size.source}</small></div>:<Missing key={size.label} label={size.label}/>)}</Build>
 </div>;
}

function AskSlide({chapter,step}:{chapter:Chapter;step:number}){
 return <div className="s-ask"><div className="s-head row"><Title chapter={chapter} small/><p className="s-lead">{chapter.description}</p></div>
  <div className="s-ask-grid">
   <div className="s-raise"><Build show={step>=0}><span className="s-label">PROPOSED SEED EQUITY · UP TO</span><strong>₹1 Cr</strong><p>A target runway of 12 months at the full raise.</p></Build>
    <Build show={step>=1} className="s-split"><div className="s-split-bar"><span/><span/></div><div className="s-split-legend"><div><b>68%</b><span>Marketing · ₹68 L</span></div><div><b>32%</b><span>Technology & product · ₹32 L</span></div></div></Build></div>
   <Build show={step>=2} className="s-roadmap">{pitchFacts.milestones.map(m=><div key={m.quarter}><span>{m.quarter}</span><div><h3>{m.title}</h3><p>{m.plan}</p>{isFilled(m.target)?<b className="s-target">Target: {m.target}</b>:<Missing label={m.quarter+' target'}/>}</div></div>)}<small>Proposed quarters from funding.</small></Build>
  </div>
  <div className="s-founders">{pitchFacts.founders.map(f=><div key={f.name}>{isFilled(f.photo)?<img src={f.photo} alt=""/>:<span className="s-initials">{f.initials}</span>}<div><h3>{f.name}</h3><p>{f.role}{isFilled(f.credential)?' · '+f.credential:''}</p>{!isFilled(f.credential)&&<Missing label="one-line credential"/>}</div></div>)}<a className="s-contact" href={sitePath('mailto:'+pitchFacts.contact)}>{pitchFacts.contact}</a></div>
 </div>;
}
