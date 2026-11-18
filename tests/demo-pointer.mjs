/**
 * Chromium's iframe locator hit-test does not compose the phone's CSS scaling.
 * Send a real mouse click at the rendered viewport coordinates and verify the
 * resulting product state; do not dispatch synthetic DOM clicks or force actions.
 */
export async function clickInDemo(page,locator){
 await locator.waitFor({state:'visible'});
 // A result panel can be visually fading while the next menu control is already in the DOM.
 for(let attempt=0;attempt<40;attempt++){
  const clear=await locator.evaluate(element=>{const r=element.getBoundingClientRect();const hit=element.ownerDocument.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return element===hit||element.contains(hit)});
  if(clear)break;if(attempt===39)throw Error('The game control remained covered by an in-game overlay.');await page.waitForTimeout(100);
 }
 const outer=await page.locator('.product-frame').boundingBox();
 const button=await locator.evaluate(element=>{const box=element.getBoundingClientRect();return{x:box.x,y:box.y,width:box.width,height:box.height,viewportWidth:innerWidth,viewportHeight:innerHeight}});
 await page.mouse.click(outer.x+(button.x+button.width/2)*outer.width/button.viewportWidth,outer.y+(button.y+button.height/2)*outer.height/button.viewportHeight);
}
