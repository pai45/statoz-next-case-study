import fixtures from '../../../public/data/walkthrough-fixtures.json' with {type:'json'};
export {fixtures};
// Demo exports deliberately retain strings and answer keys as well as numeric values.
const legacyDemoRows=[
 ['Match','Fixture',`${fixtures.fixture.home} vs ${fixtures.fixture.away}`],['Match','Fixture ID',fixtures.fixture.id],['Match','Venue',fixtures.fixture.venue],['Match','Final score','2–3'],
 ...fixtures.snapshot.topStats.map(row=>['Match statistics',row.label,`${row.home.display} / ${row.away.display}`]),
 ...fixtures.prediction.flatMap((q,i)=>[['Prediction',`Question ${i+1}`,q.prompt],['Prediction',`Base XP ${i+1}`,q.reward],['Prediction',`Correct answer ${i+1}`,i===0?'2–3':q.options[q.correct]]]),
 ...fixtures.arena.flatMap((q,i)=>[['Knowledge Arena',`Question ${i+1}`,q.p],['Knowledge Arena',`Choices ${i+1}`,q.o.join(' | ')],['Knowledge Arena',`Correct answer ${i+1}`,q.o[q.a]]]),
 ...Object.entries(fixtures.rules).map(([label,value])=>['Rules',label,Array.isArray(value)?value.join(' / '):value]),
 ...Object.entries(fixtures.formula).map(([label,value])=>['Formula',label,value]),...Object.entries(fixtures.yorker).map(([label,value])=>['Yorker',label,value]),
 ['Match','Prematch clock label','22:30'],['Match','Source snapshot attendance',fixtures.snapshot.matchDetails.attendance],['Match','Sample winner probabilities','Fulham 28% / Draw 24% / Chelsea 48%'],
 ['TOPS','Illustrative leaderboard','Touchline Thinker 275 XP / Blue Forecast 225 XP / West London Fan 200 XP'],['Prediction','Available boosts','1× / 1.5× / 2×'],
 ['Knowledge Arena','Sample Oz balance',250],['Knowledge Arena','XP before run',120],['Knowledge Arena','Level span XP',250],['Knowledge Arena','Catalogue sets per mode',50],['Knowledge Arena','Catalogue modes','Easy / Medium / Hard / Global'],['Knowledge Arena','Guided playable set','Football / Easy / Set 1'],
 ['Formula','Circuit choices','Night Circuit / Harbor Run / Switchback Ring'],['Formula','Livery choices','Scarlet / Midnight / Ivory'],['Formula','Sample field size',8],['Formula','Sample classification','Nightfall Racing / Silverline / You / Grid North'],['Formula','Starting HUD speed km/h',185],['Formula','HUD speed change per throttle tap',25],
 ['Yorker','Delivery choices','Seam up / Outswinger / Inswinger / Slower ball'],['Yorker','Sample delivery speed km/h',141],['Yorker','First Spell ball limit',12],['Yorker','Default pitch target',50],['Yorker','Spell objective','Take a wicket in two overs'],['Yorker','Scripted delivery outcome','Bowled; first ball; 1 wicket; 0 runs']
].map(([category,label,value],i)=>({id:`demo-${i+1}`,category,label,value,status:'Illustrative demo data',source:'Local product UI and controlled presentation scenario'}));
export const demoRows=legacyDemoRows.filter(row=>['Formula','Yorker'].includes(row.category));
export function demoCSV(){const esc=value=>'"'+String(value??'').replaceAll('"','""')+'"';const keys=['id','category','label','value','status','source'];return '\uFEFF'+[keys.join(','),...demoRows.map(row=>keys.map(key=>esc(row[key])).join(','))].join('\r\n');}
