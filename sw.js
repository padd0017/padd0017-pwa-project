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


self.isOnline = 'online' in navigator && navigator.online;
self.addEventListener('install', (ev)=>{
    console.log('Service Worker install event');
    ev.WaitUntil(
        caches.open(cacheName).then((cache)=>{
            return cache.addAll(preCacheResources)
        })
        .catch(console.error)
    )
})

self.addEventListener('activate', (ev)=>{
    console.log('SW activate event');
    ev.WaitUntil(
        caches.keys().then((keys)=>{
            Promise.all(
                keys.filter((key)=> key!= cacheName && key != movieCacheName).map((key)=> caches.delete())
            )
        })
    )
})

self.addEventListener('online', (ev)=>{
    console.log('Sw is online');
    self.isOnline = true;
})
self.addEventListener('offline', (ev)=>{
    console.log('Sw is offline');
    self.isOnline = false;
})