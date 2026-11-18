import {useEffect} from 'react';
import {productBase} from '../../hosting';
// Preserve old presentation bookmarks while opening the actual product.
export function WalkthroughRuntime(){
 const scenario=new URLSearchParams(location.search).get('scenario')||'match';
 useEffect(()=>{
  const games:Record<string,string>={games:'/',formula:'/play/rally/',yorker:'/play/yorker/'};
  const sports:Record<string,string>={match:'/',prediction:'/matches/epl_liv_mci/',arena:'/play/quiz/football/'};
  location.replace(scenario in games?productBase('games')+games[scenario]:productBase('sports')+(sports[scenario]||'/'));
 },[scenario]);
 return <div className="empty-state">Opening StatOz...</div>;
}
