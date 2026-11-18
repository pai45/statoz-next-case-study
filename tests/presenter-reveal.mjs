/** Reveal content through the private presenter desk, keeping chapter screens free of action buttons. */
export async function revealPhase(page,phase){
 const session=new URL(page.url()).searchParams.get('session')||'explore';
 const desk=await page.context().newPage();
 try{
  await desk.goto('http://127.0.0.1:4411/presenter?session='+encodeURIComponent(session));
  await desk.locator('.phase-picker').getByRole('button',{name:phase==='demo'?'Interactive demo':phase==='screens'?'Screens':'Video',exact:true}).click();
  await page.locator(phase==='demo'?'.product-frame, .sports-product-frame, .games-product-frame':phase==='screens'?'.screens-stage':'.video-stage').waitFor();
 }finally{await desk.close()}
}
