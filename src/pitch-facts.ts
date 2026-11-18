/**
 * Founder-supplied pitch facts.
 *
 * Fill these in, then run `npm run build`. Empty values never appear on the investor screen;
 * the presenter desk preview shows them as "FOUNDER TO FILL" so you can see what is missing.
 * Add a source to every figure. Nothing in this file is derived from the November 2026 report.
 */
export type Fact={value:string;source?:string};
export const pitchFacts={
 /** Market sizing. Example value: "₹X,XXX Cr" with source "Report name, year". */
 market:{
  tam:{label:'Total addressable market',value:'',source:''} as Fact&{label:string},
  sam:{label:'Serviceable market',value:'',source:''} as Fact&{label:string},
  som:{label:'Three-year target share',value:'',source:''} as Fact&{label:string},
 },
 /** The habits StatOz combines. These are founder positioning statements, not competitor feature claims. */
 positioning:[
  {habit:'Follow',where:'Score & stats apps',statoz:'Fixtures, standings, match detail'},
  {habit:'Predict',where:'Prediction & pick games',statoz:'Free-to-play predictions with virtual coins'},
  {habit:'Play',where:'Casual sports games',statoz:'Knowledge Arena and playable sports games'},
 ],
 /** Free-to-play statements. Only confirmed:true statements are shown to investors. The first two repeat the deck's existing product copy; confirm the cash statements with counsel before setting them true. */
 compliance:[
  {text:'Free to download and free to play',confirmed:true},
  {text:'Virtual coins power predictions, picks and futures',confirmed:true},
  {text:'Coins cannot be withdrawn or exchanged for cash',confirmed:false},
  {text:'No cash prizes for prediction or game results',confirmed:false},
 ],
 /** Twelve-month milestones from funding. Targets are shown only when filled. */
 milestones:[
  {quarter:'Q1',title:'Release',plan:'Ship the expanded experience.',target:''},
  {quarter:'Q2',title:'Learn',plan:'Measure activation and retention.',target:''},
  {quarter:'Q3',title:'Monetise',plan:'Test optional paid features.',target:''},
  {quarter:'Q4',title:'Grow',plan:'Scale proven channels; track acquisition cost.',target:''},
 ],
 /** One line of credibility per founder, and an optional photo path under public/assets. */
 founders:[
  {initials:'PD',name:'Priyangshu Das',role:'Product design',credential:'',photo:'',linkedin:'https://www.linkedin.com/in/priyangshu--das/'},
  {initials:'KD',name:'Kshitiz Dayal',role:'Technology',credential:'',photo:'',linkedin:'https://www.linkedin.com/in/kshitizdayal/'},
 ],
 contact:'founders@statoz.in',
 /** Likely investor questions. Answers from existing evidence are filled; the rest are founder-to-fill. */
 questions:[
  {q:'Is this retention?',a:'No. 52% October activation means signups who played at least one core game. Retention cohorts are a Q2 milestone.'},
  {q:'Is coin activity revenue?',a:'No. 4,99,891 virtual coins were placed. Coins are not presented as revenue anywhere in this case study.'},
  {q:'Why do some totals differ?',a:'The source report has documented aggregate/detail differences (18,620 vs 18,224 core plays; 4,587 vs 4,340 players). Both values are preserved and flagged on the data sheet.'},
  {q:'What does it cost to acquire a fan?',a:''},
  {q:'Who do you compete with?',a:''},
  {q:'Why two apps instead of one?',a:''},
 ],
};
export const isFilled=(value?:string)=>Boolean(value&&value.trim());
