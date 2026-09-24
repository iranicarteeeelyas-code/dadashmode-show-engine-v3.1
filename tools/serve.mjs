#!/usr/bin/env node
/* Zero-dependency local server so the app runs with full offline install (service worker) on this computer.
   Usage: node tools/serve.mjs [port]   then open http://localhost:8080  (phones on the same Wi-Fi: http://<computer-ip>:8080) */
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const PORT=+process.argv[2]||8080;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.wav':'audio/wav','.mp3':'audio/mpeg','.md':'text/markdown; charset=utf-8'};
http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,path.normalize(p).replace(/^(\.\.[\/\\])+/,''));
  if(!f.startsWith(ROOT)){res.writeHead(403);return res.end()}fs.readFile(f,(err,data)=>{if(err){res.writeHead(404);return res.end('not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data)})}).listen(PORT,()=>{
  console.log(`DADASHMODE v3 → http://localhost:${PORT}`);for(const n of Object.values(os.networkInterfaces()).flat())if(n&&n.family==='IPv4'&&!n.internal)console.log(`   same Wi-Fi: http://${n.address}:${PORT}`)});
