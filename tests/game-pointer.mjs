// Map actual native pointer input through every scaled iframe, including the opaque game sandbox.
export async function pointInGame(page,frame,locator){
 await locator.scrollIntoViewIfNeeded();let point=await locator.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}}),current=frame;
 while(current.parentFrame()){const handle=await current.frameElement(),box=await handle.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}),size=await current.evaluate(()=>({width:innerWidth,height:innerHeight}));point={x:box.x+point.x*box.width/size.width,y:box.y+point.y*box.height/size.height};current=current.parentFrame();}
 return point;
}
export async function tapInGame(page,frame,locator){const point=await pointInGame(page,frame,locator);await page.mouse.click(point.x,point.y);}
