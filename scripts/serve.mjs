import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2','.ttf':'font/ttf','.glb':'model/gltf-binary','.wasm':'application/wasm','.pdf':'application/pdf','.csv':'text/csv; charset=utf-8'};
const servers=[];
// These origins are exclusively presentation-owned. No production account is used.
const boot=product=>`<script>(()=>{const kind=${JSON.stringify(product)},prefix='statoz.next.'+kind, email='investor-demo@statoz.example';function seed(){localStorage.setItem(prefix+'.auth.v2',JSON.stringify({version:2,authenticated:true,email}));localStorage.setItem(prefix+'.accounts.v1',JSON.stringify({version:1,accounts:{[email]:{onboardingComplete:true}}}));localStorage.setItem(prefix+'.account-data-owner.v1',email)};seed();addEventListener('message',e=>{if(e.source!==parent||e.origin!=='http://127.0.0.1:4411'||e.data?.type!=='statoz-case-reset')return;localStorage.clear();sessionStorage.clear();Promise.all([('caches'in window?caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))):Promise.resolve()),('serviceWorker'in navigator?navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))):Promise.resolve())]).finally(()=>{seed();location.reload()})});parent.postMessage({type:'statoz-case-ready'},'http://127.0.0.1:4411')})()</script>`;
function start(port,directory,prefix='',product=''){
 const server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://127.0.0.1:'+port);let pathname=decodeURIComponent(url.pathname);
  if(pathname==='/health'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({ok:true,product:product||'case-study'}));}
  if(prefix&&pathname.startsWith(prefix))pathname=pathname.slice(prefix.length)||'/';
  if(pathname==='/'){pathname='/index.html';}
  let file=path.resolve(directory,'.'+pathname);const relative=path.relative(directory,file);
  if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);return res.end('Forbidden');}
  let stat=await fs.stat(file).catch(()=>null);
  if(stat?.isDirectory()){file=path.join(file,'index.html');stat=await fs.stat(file).catch(()=>null);}
  if(!stat&&path.extname(pathname)===''){file=path.join(directory,product?'404/index.html':'index.html');stat=await fs.stat(file).catch(()=>null);}
  if(!stat){res.writeHead(404);return res.end('Asset not found: '+pathname);}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-cache');res.setHeader('Access-Control-Allow-Origin','*');
  if(path.extname(file)==='.html'&&product&&!pathname.startsWith('/game-library/')){const html=await fs.readFile(file,'utf8');return res.end(html.replace('<head>','<head>'+boot(product)));}
  const bytes=await fs.readFile(file);const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),bytes.length-1):bytes.length-1;if(start>end){res.writeHead(416);return res.end();}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});return res.end(bytes.subarray(start,end+1));}
  res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Length',bytes.length);res.end(bytes);
 }catch(e){res.writeHead(500);res.end('Unable to serve this file.');console.error(e.message);}});
 servers.push(server);return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve)});
}
try{await start(4411,path.join(root,'dist'));await start(4412,path.join(root,'demos/sports'),'/statoz-next-sports-web','sports-web');await start(4413,path.join(root,'demos/games'),'/statoz-next-games-web','games-web');console.log('StatOz Case Study → http://127.0.0.1:4411\nPresenter → http://127.0.0.1:4411/presenter\nPackaged Sports :4412 · Games :4413\nCtrl+C stops these three presentation servers.');}catch(e){console.error('Cannot start presentation: '+e.message+'. Close the conflicting server or choose another time to launch.');for(const server of servers)server.close();process.exitCode=1;}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{for(const server of servers)server.close();process.exit(0)});
