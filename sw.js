const version = 1;
const cacheName = `pwa-app-project-${version}`;
const movieCacheName = `movie-pwa-project-${version}`;

const preCacheResources = [
    './',
    './index.html',
    './404.html',
    './cache-results.html',
    './details.html',
    './favourite-screen.html',
    './results.html',
    './css/main.css',
    './img/icons',
    './js/main.js',
    './manifest.json'
]



self.addEventListener('install', (ev)=>{
    console.log('Service Worker install event');
    ev.waitUntil(
        caches.open(cacheName).then((cache)=>{
            return cache.addAll(preCacheResources)
        })
        .catch(console.error)
    )

self.skipWaiting()
})

self.addEventListener('activate', (ev)=>{
    console.log('SW activate event');

    clients.claim().then(()=>{           
        console.log("service worker has now started working");
    })

    ev.waitUntil(
        caches.keys().then((keys)=>{
            Promise.all(
                keys.filter((key)=> key!= cacheName && key != movieCacheName).map((key)=> caches.delete(key))
            )
        })
    )
})

let movieCardId = null;
self.addEventListener('message',(ev)=>{
if(ev.data.type === "cardId"){
    movieCardId = ev.data.cardID
}
})

self.addEventListener("fetch", (ev)=>{
const isOnline = navigator.onLine;
let url = ev.request.url;

if(!isOnline && url.includes('results.html')){
  ev.respondWith ( 
     caches.match('/cache-results.html')
    )
}

if(ev.request.url.includes(".jpg")){
ev.respondWith(
    
    caches.open(cacheName).then(async (cache)=>{
        const response = await fetch(ev.request)
        await cache.put(ev.request, response.clone())
        return response
    })
)
}

else if(url.includes(movieCardId)&&url.includes('render')){
    ev.respondWith(
        caches.open(movieCacheName).then(async(cache)=>{
            if(isOnline){
                let response = await fetch(ev.request);
                await cache.put(ev.request, response.clone())
                return response                
            }
             else {
            return  caches.match(ev.request)
            }
        })
    )
}
}
)

self.addEventListener('online', (ev)=>{
    console.log('Sw is online');
    self.isOnline = true;
})
self.addEventListener('offline', (ev)=>{
    console.log('Sw is offline');
    self.isOnline = false;
})

