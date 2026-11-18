import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const out='test-results/investor-artifacts';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route('**/*',route=>{const url=route.request().url();return url.startsWith('http')&&!/^http:\/\/127\.0\.0\.1:441[123]\//.test(url)?route.abort():route.continue()});
 const investor=await context.newPage(),desk=await context.newPage();const session='art-review-'+Date.now();
 await investor.goto('http://127.0.0.1:4411/present?session='+session);await desk.goto('http://127.0.0.1:4411/presenter?session='+session);await desk.getByText('Audience window connected',{exact:true}).waitFor();
 const slides=[['home','The introduction'],['opportunity','The opportunity'],['traction','Traction'],['business','The business model'],['free-to-play','Free to play'],['market','Market & position'],['investment','The next chapter'],['close','Thank you']];
 for(const [id,label] of slides){
  await desk.locator('.run-select').filter({hasText:label}).first().click();
  await investor.locator('.stage-slide').waitFor();await investor.waitForTimeout(200);
  const builds=desk.locator('.desk-builds button');if(await builds.count())await builds.last().click();
  await investor.waitForTimeout(250);await investor.evaluate(()=>document.fonts.ready);
  await investor.screenshot({path:out+'/'+id+'.png'});
  console.log(id,await investor.locator('.stage-body').evaluate(el=>{const b=el.getBoundingClientRect();return [...el.querySelectorAll('h1,h3,p,.s-card,.s-raise')].filter(n=>{const r=n.getBoundingClientRect();return r.bottom>b.bottom+2||r.right>b.right+2}).map(n=>n.className||n.tagName)}));
 }
 await context.close();
}finally{await browser.close()}
