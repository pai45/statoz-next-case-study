import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
await fs.mkdir('test-results/home-views',{recursive:true});
try{
 for(const first of ['Presenter view','Investor view']){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});const home=await context.newPage();await home.goto('http://127.0.0.1:4411/');
  const controls=home.getByLabel('Presentation views');await controls.getByRole('link',{name:'Presenter view'}).waitFor();
  const presenterHref=await controls.getByRole('link',{name:'Presenter view'}).getAttribute('href'),investorHref=await controls.getByRole('link',{name:'Investor view'}).getAttribute('href');
  const session=new URL(presenterHref,home.url()).searchParams.get('session');assert.ok(session);assert.equal(session,new URL(investorHref,home.url()).searchParams.get('session'));
  const second=first==='Presenter view'?'Investor view':'Presenter view';const opened={};
  for(const name of [first,second]){const popup=home.waitForEvent('popup');await controls.getByRole('link',{name,exact:true}).click();opened[name]=await popup;await opened[name].waitForLoadState();}
  const presenter=opened['Presenter view'],investor=opened['Investor view'];await presenter.getByText('Audience window connected',{exact:true}).waitFor();
  await presenter.locator('.run-select').filter({hasText:'StatOz Sports'}).click();await investor.locator('h1').filter({hasText:'Every match.'}).waitFor();
  assert.match(await home.locator('h1').innerText(),/A daily home/);assert.equal(await investor.locator('.view-launch-controls').count(),0);
  await presenter.getByRole('textbox',{name:/SPEAKER NOTES/}).fill('PRIVATE VIEW TEST');assert.ok(!(await investor.locator('body').innerText()).includes('PRIVATE VIEW TEST'));
  await home.reload();await home.getByLabel('Presentation views').waitFor();assert.equal(await home.getByLabel('Presentation views').getByRole('link',{name:'Presenter view'}).getAttribute('href'),presenterHref);
  if(first==='Presenter view'){
   await home.screenshot({path:'test-results/home-views/desktop.png',fullPage:true});
   await home.setViewportSize({width:390,height:844});assert.ok(await home.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await home.screenshot({path:'test-results/home-views/mobile.png',fullPage:true});
  }
  console.log('PASS '+first+' first: two linked tabs, synchronized chapter, private notes, homepage preserved and stable links.');await context.close();
 }
}finally{await browser.close()}
