import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../out'), base = '/statoz-next-case-study', port = Number(process.env.CASE_STUDY_TEST_PORT || 4420);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif', '.svg':'image/svg+xml', '.mp4':'video/mp4', '.webm':'video/webm', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.woff2':'font/woff2', '.ttf':'font/ttf', '.glb':'model/gltf-binary', '.wasm':'application/wasm', '.pdf':'application/pdf', '.csv':'text/csv', '.ico':'image/x-icon' };
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === base) { response.writeHead(301, { Location: base + '/' + url.search }); return response.end(); }
    if (!url.pathname.startsWith(base + '/')) throw new Error('Outside site');
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname.slice(base.length)));
    if (!file.startsWith(root + path.sep) && file !== root) throw new Error('Outside export');
    if ((await fs.stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) { response.writeHead(301, { Location: url.pathname + '/' + url.search }); return response.end(); }
      file = path.join(file, 'index.html');
    }
    const bytes = await fs.readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Pages preview: http://127.0.0.1:${port}${base}/`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
