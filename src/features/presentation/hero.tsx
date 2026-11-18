import { sitePath } from '../../hosting';
import {ProductDevice} from './product-visuals';
export function Hero({onExplore,session,isAudience=false}:{onExplore:()=>void;session:string;isAudience?:boolean}){return <>
 <div className="hero-grid hero-revised">
  <div className="hero-copy"><div className="edition-badge"><span className="status-dot"/> STATOZ / INVESTOR EDITION <span>2026</span></div>
   <div className="eyebrow"><span className="short-line"/> FOLLOW. PREDICT. PLAY.</div>
   <h1>A daily home.<br/>For <em>every fan.</em></h1>
   <p>From the first fixture to one more game.<br/>A closer look at the product, the platform<br className="desktop-br"/> and the opportunity behind StatOz.</p>
   {!isAudience&&<>
    <div className="hero-actions view-launch-controls" aria-label="Presentation views">
     <div><a href={sitePath('/presenter?session='+encodeURIComponent(session))} target={'statoz-presenter-'+session} className="button primary">Presenter view <span aria-hidden="true">↗</span></a><small>Your controls and speaker notes</small></div>
     <div><a href={sitePath('/present?session='+encodeURIComponent(session))} target={'statoz-audience-'+session} className="button secondary">Investor view <span aria-hidden="true">↗</span></a><small>The presentation screen to share</small></div>
    </div>
    <button className="text-link home-explore" onClick={onExplore}>Explore the story <span aria-hidden="true">→</span></button>
   </>}
   <div className="hero-caption"><span className="status-dot"/> REAL PRODUCT. A STORY YOU CONTROL.</div>
  </div>
  <div className="hero-art hero-product-stage"><div className="stage-grid" aria-hidden="true"/><div className="stage-orbit" aria-hidden="true"/><span className="art-caption">TWO EXPERIENCES. ONE SPORTS OBSESSION.</span>
   <div className="hero-sports-device"><ProductDevice id="source-home" label="Current StatOz Sports Web mobile screen" className="hero-device"/></div>
   <div className="hero-games-device"><ProductDevice id="game-source-home" label="Current StatOz Games Web home" className="hero-device"/></div>
   <div className="product-label sports-label"><span>01 / STATOZ SPORTS</span><b>Follow the action.</b><small>Follow · Predict · Quiz</small></div>
   <div className="product-label games-label"><span>02 / STATOZ GAMES</span><b>Just one more game.</b><small>Made to play in landscape</small></div>
  </div>
 </div>
 <div className="home-evidence"><div className="evidence-label">A SNAPSHOT<span>02 NOV 2026</span></div><div><strong>10,798</strong><span>Registered users</span></div><div><strong>1,142</strong><span>Mini-game matches</span></div><div><strong>4,99,891</strong><span>Virtual coins placed</span></div><a href={sitePath("/data")} className="evidence-link">The data.<br/>The context.<span aria-hidden="true">↗</span></a></div>
 <div className="home-foot"><span>EXISTING APP + EXPANDED PRODUCT DEMOS</span><span>EXPLORE THE STORY AT YOUR OWN PACE <span className="cyan" aria-hidden="true">↗</span></span></div>
 </>}
