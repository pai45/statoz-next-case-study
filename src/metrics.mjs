export const report='/data/statoz-by-the-numbers-nov-2026.pdf';
export const reportName='StatOz by the Numbers · Nov 2026';
/** @typedef {{id:string,category:string,label:string,value:number,unit:string,page:number,dimension:string,period:string,note:string,status:string,source:string}} Metric */
/** @type {Metric[]} */
const metrics=[];
function add(category,label,value,unit,page,dimension='',period='As of 2 Nov 2026',note='',status='Reported'){
 metrics.push({id:`metric-${metrics.length+1}`,category,label,value,unit,page,dimension,period:period||'As of 2 Nov 2026',note,status,source:page?reportName:'StatOz investor pitch · saved 8 Nov 2026'});
}
add('Overview','Registered users',10798,'users',1);
add('Overview','Total plays and mini-game matches',19762,'plays / matches',1,'','','Reported total: 18,620 core plays + 1,142 matches. Core-play detail sums to 18,224, a difference of 396.','Needs reconciliation');
add('Overview','Core plays',18620,'plays',1,'','','Reported aggregate. Detailed game rows sum to 18,224; difference 396.','Needs reconciliation');
add('Overview','Mini-game matches',1142,'matches',1);
add('Overview','Coins placed',499891,'virtual coins',1,'Predictions, events and futures');
add('Overview','Users with cards',1721,'users',1);
const core=[['Quiz',10456,'quizzes',4701,2690,1.7],['Prediction',2342,'predictions',10926,683,16.0],['Event',10472,'events',1704,610,2.8],['Future',15,'markets',893,357,2.5]];
for(const [name,published,unit,plays,players,frequency] of core){add('Core games','Content published',published,unit,1,name);add('Core games','Plays',plays,'plays',1,name);add('Core games','Unique players',players,'players',1,name);add('Core games','Plays per player',frequency,'plays / player',1,name);}
const coins=[['Predictions',283082,56.6,26],['Events',142052,28.4,83],['Futures',74757,15.0,84],['Total',499891,100,37]];
for(const [name,amount,share,perPlay] of coins){add('Coins','Coins placed',amount,'virtual coins',2,name,'All-time totals');add('Coins','Share of coins',share,'%',2,name,'All-time totals');add('Coins','Coins per play',perPlay,'coins / play',2,name,'All-time totals','Rounded as displayed in the report. Virtual coins are not revenue.');}
export const miniGames=[['Penalty Shootout',734],['Pitch Duel',231],['Football Chess',81],['Grand Prix Dash',43],['Hoop Duel',28],['Final Over',20],['Tennis Rally',5]];
for(const [name,matches] of miniGames)add('Mini-games','Matches',matches,'matches',2,name,'All-time totals','Historical activity; inclusion does not imply availability in the current demo.');
add('Mini-games','Games with recorded matches',7,'games',2,'','All-time totals');
add('Mini-games','Penalty Shootout share',64,'%',2,'Penalty Shootout','All-time totals','Rounded source percentage.');
export const cohorts=[['Apr',510,30],['May',659,30],['Jun',1875,50],['Jul',2163,48],['Aug',1071,28],['Sep',2054,37],['Oct',2309,52]];
for(const [month,signups,activation] of cohorts){add('Growth','Monthly signups',signups,'signups',3,month+' 2026',month+' 2026');add('Growth','Activation by signup month',activation,'%',3,month+' 2026',month+' 2026','Share who played at least one core game; this is not retention.');}
add('Growth','Total signups',10641,'signups',3,'','Apr–Oct 2026');
add('Growth','Active players',4587,'players',4,'','Apr–Oct 2026','Reported aggregate. Core-game player rows total 4,340, below this reported count; definition / scope needs reconciliation. Not DAU or MAU.','Needs reconciliation');
add('Growth','Weighted activation',43.1,'%',4,'','Apr–Oct 2026','4,587 / 10,641; uses the reported active-player aggregate. This is not a retention metric.','Needs reconciliation');
export const platformFrequency=[['1 time',60,2752],['2 times',16,734],['3 times',7,321],['4+ times',17,780],['Total players',100,4587]];
for(const [frequency,share,users] of platformFrequency){add('Play frequency','Platform player share',share,'%',4,frequency,'Apr–Oct 2026','Reported platform-frequency distribution; not interchangeable with the core-game frequency table.');add('Play frequency','Platform users',users,'users',4,frequency,'Apr–Oct 2026','Uses the report’s platform-frequency table.');}
export const coreFrequency=[['Quiz',2095,350,84,161,2690,6],['Prediction',305,160,74,144,683,21],['Event',296,131,62,121,610,20],['Future',170,84,42,61,357,17],['Core games combined',2843,726,310,708,4587,15]];
for(const [name,...values] of coreFrequency){const labels=['1 time','2 times','3 times','4+ times','Players','Share with 4+ plays'];values.forEach((value,i)=>add('Core frequency',labels[i],value,i===5?'%':'players',4,name,'Apr–Oct 2026',name==='Core games combined'?'Reported combined row does not sum from individual game rows: player totals 4,340 vs 4,587; buckets also differ.':i===5?'Rounded source percentage.':'',name==='Core games combined'?'Needs reconciliation':'Reported'));}
add('Investment','Proposed seed equity raise',10000000,'INR',0,'Up to','12-month funding plan','₹1 Cr cap; proposed, not committed capital.','Proposed');
add('Investment','Marketing allocation',68,'%',0,'','At full raise','₹68 L assumes the full ₹1 Cr raise.','Proposed');
add('Investment','Marketing allocation amount',6800000,'INR',0,'','At full raise','','Proposed');
add('Investment','Technology and product allocation',32,'%',0,'','At full raise','₹32 L assumes the full raise.','Proposed');
add('Investment','Technology and product amount',3200000,'INR',0,'','At full raise','','Proposed');
add('Investment','Target runway',12,'months',0,'','At full raise','Target, conditional on the full raise.','Proposed');
add('Historical deck','Cumulative app downloads',16000,'downloads',0,'','Apr–Sep 2026','Founder-reported, unverified. Downloads are not registered users or active users.','Historical');
export {metrics};
export function formatValue(metric){if(metric.unit==='INR')return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(metric.value);return new Intl.NumberFormat('en-IN',{maximumFractionDigits:1}).format(metric.value)+(metric.unit==='%'?'%':'');}
export function csvText(rows=metrics){const keys=['id','category','label','dimension','value','unit','period','source','page','status','note'];const escape=value=>'"'+String(value??'').replaceAll('"','""')+'"';return '\uFEFF'+[keys.join(','),...rows.map(row=>keys.map(key=>escape(row[key])).join(','))].join('\r\n');}
