const CACHE="redro-food-stock-v19";
const FILES=["./","./index.html","./styles.css","./app.js","./ui.js","./manifest.webmanifest","./assets/icon.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith("redro-food-stock-")&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})());});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET"||new URL(event.request.url).origin!==location.origin)return;
 const url=new URL(event.request.url);
 const isAppFile=url.pathname.endsWith("/")||/\.(html|js|css|webmanifest)$/.test(url.pathname);
 if(isAppFile){
  event.respondWith((async()=>{try{const response=await fetch(event.request,{cache:"no-store"});if(response.ok){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone());}return response;}catch(error){return await caches.match(event.request)||await caches.match("./index.html");}})());
  return;
 }
 event.respondWith((async()=>{const cached=await caches.match(event.request);if(cached)return cached;try{return await fetch(event.request);}catch(error){return await caches.match("./index.html");}})());
});
