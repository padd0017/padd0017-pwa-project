const version = 3;
const cacheName = `pwa-app-project-${version}`;
const movieCacheName = `movie-pwa-project-${version}`;

let vinayVariable = null





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
    console.log(ev.data)
if(ev.data.type === "cardId"){
    movieCardId = ev.data.cardID
}
})

self.addEventListener("fetch", (ev)=>{
let url = ev.request.url;
console.log(url)
console.log(ev.request.url.includes(".jpg"))

if(ev.request.url.includes(".jpg")){
ev.respondWith(

    caches.open(cacheName).then(async (cache)=>{

        let response = await fetch(ev.request)
        await cache.put(ev.request, response.clone())
        return response
    })
)
}

else if(url.includes(movieCardId)&&url.includes('render')){
    ev.respondWith(
        caches.open(movieCacheName).then(async(cache)=>{
            let response = await fetch(ev.request, {
                mode: 'cors',
                credentials: 'same-origin'
            });
        cache.put(ev.request,  response.clone()).then((res)=>{
            if(res){
                return res
            } 
            
            return caches.open(movieCacheName).then((movieRes)=>{
                movieRes.match(ev.request).then(async (retrievedRes)=>{
                    console.log(retrievedRes)
                    const json = await retrievedRes.json()
                    postMessage(json)
                })
            })
        })
    
        })
    )
}
})

function postMessage(data){
    clients.matchAll({includeUncontrolled: true }).then(clientList => {
        clientList.forEach(client => {
            client.postMessage({type: "details", details: data});
        });
    })
}

self.addEventListener('online', (ev)=>{
    console.log('Sw is online');
    self.isOnline = true;
})
self.addEventListener('offline', (ev)=>{
    console.log('Sw is offline');
    self.isOnline = false;
})

