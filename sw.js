/* DADASHMODE v3 service worker: installs the whole app (code, fonts, voice pack) for offline filming */
const VERSION='dm3-v3.0.0';
const CORE=['./','index.html','manifest.webmanifest','css/app.css','js/util.js','js/icons.js','js/data.js','js/audio.js','js/game.js','js/ai.js','js/stage.js','js/show.js','js/ui.js',
  'fonts/Lalezar-Regular.ttf','fonts/Vazirmatn-Variable.ttf','fonts/Estedad-Variable.ttf','fonts/NotoKufiArabic-Variable.ttf','fonts/Marhey-Variable.ttf',
  'icons/icon-192.png','icons/icon-512.png','episodes/ep1-time-bank.json','voices/index.json'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(VERSION);await c.addAll(CORE);
  try{const r=await fetch('voices/index.json',{cache:'no-cache'});const j=await r.json();const files=Object.values(j.items||{}).map(it=>'voices/'+it.file);for(const f of files){try{await c.add(f)}catch(err){}}}catch(err){}
  self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==VERSION&&!k.startsWith('dm3-cdn'))await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  /* never cache AI API calls */
  if(/generativelanguage\.googleapis|api\.openai\.com/.test(u.host))return;
  /* CDN assets of the emergency on-device voice engine: cache-first so it works offline after first download */
  if(/jsdelivr|cdnjs|huggingface|unpkg/.test(u.host)){e.respondWith((async()=>{const c=await caches.open('dm3-cdn');const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r})());return}
  if(u.origin!==location.origin)return;
  /* app files: cache-first, update in background */
  e.respondWith((async()=>{const c=await caches.open(VERSION);const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r.ok&&r.type==='basic')c.put(e.request,r.clone());return r}).catch(()=>null);
    return hit||(await net)||c.match('index.html')})())});
