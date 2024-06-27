
function registerSw(){
  if('serviceWorker' in navigator){
      navigator.serviceWorker.register('../sw.js');
  }

  // navigator.serviceWorker.addEventListener("message", receiveMessage)
}

let dataArray = [];


function checkPages(){
if(document.body.classList.contains("index.html")){
  grabInputHome()
  console.log("index.html page")
  

} else if(document.body.classList.contains("results-html")){
  console.log("results.html page")
  fetchDataResults()

}else if(document.body.classList.contains("error-html")){
  console.log("404 page")


}else if(document.body.classList.contains("details-html")){
  console.log("details.html page")
  getOneId()


}else if(document.body.classList.contains("cached.html")){
  console.log("cached.html page")
  retrieveFromCache()


}else if(document.body.classList.contains("favourite-html")){
  console.log("favourite.html page")
  retrieveFromFavourite()

}
}

// HOME PAGE CODE
function grabInputHome(){
const form = document.querySelector("form");
const input = document.getElementById("search__input");
const sort = document.getElementById("sort");
const favBtn = document.getElementById("fav__button");

favBtn.addEventListener("click", (ev)=>{
  ev.preventDefault();
  location.href = `./favourite-screen.html`
})

form.addEventListener("submit", (ev)=>{
  ev.preventDefault();

  const params = new URLSearchParams();
    params.append("keyword", input.value.trim());
    params.append("sort", sort.value);
  location.href = `./results.html?${params}`
})
}

//RESULTS PAGE CODE

function fetchDataResults(){
  let query = []
const url = new URL(location.href)

for(let querys of url.searchParams.values()){
query.push(querys)
}

let keyword = query[0]
let sort = query[1]

const BaseUrl = `https://mad9124-midterm-qjd3.onrender.com/api/movies?keyword=${keyword}&sort=${sort}`


fetch(BaseUrl).then((res)=>{
  if(!res.ok){
    throw new Error("Something is wrong")
  }
  return res.json();
}).then(({data})=> {
  if (data.length === 0) {
    console.log("data", data)
    location.replace(location.origin+"./404.html")

} else {
    // Otherwise, proceed to append the data
    appendData(data);
    console.log("data", data)
}
})
}


function appendData(data){
  const output = document.querySelector('.output')
  let df = new DocumentFragment
  data.forEach(item => {
    let card = document.createElement("div");
    card.setAttribute("data-ref", item.id)
    card.className = "movieCards"
    let span1 = document.createElement("span")
    let span2 = document.createElement("span")
    let span3 = document.createElement("span")
    let span4 = document.createElement("span")
    let img = document.createElement("img")
    img.src = item.imageUrl
  
  
    let h4 = document.createElement("h4");
    h4.textContent = item.title
     //Span elements to add the glowing hower on cards
    card.append(span1)
    card.append(span2)
    card.append(span3)
    card.append(span4)
    card.append(img)
    card.append(h4)
    df.append(card)
  });
output.append(df)

output.addEventListener("click", grabMovieCard)
}

function grabMovieCard(ev){
ev.preventDefault()
let cardClicked;
if(ev.target.closest(".movieCards")){
   cardClicked = ev.target.closest(".movieCards").getAttribute("data-ref")
}
if(cardClicked){
  postIdMessage(cardClicked)
  location.href = `./details.html?id=${cardClicked}`
}
}

//DETAILS PAGE
function getOneId(){

  let url = new URL(location.href)
let params = [];
  for(let a of url.searchParams.values()){
params.push(a)
  }
  fetchGetOne(params)
  
}

function fetchGetOne(cardId){
  const getOneUrl = `https://mad9124-midterm-qjd3.onrender.com/api/movies/${cardId}`;
  fetch(getOneUrl).then((res)=>{
    if(!res.ok) throw new Error("Something went wrong in getOne")
      return res.json()
  }) .then((data)=> {
    appendDetails(data)
    saveToFav(data)
  })
}

function postIdMessage(cardId){
  if(navigator.serviceWorker.controller){
    console.log("messsage sent with id")
    navigator.serviceWorker.controller.postMessage({type: "cardId",  cardID: cardId})
  } else {
    console.log("not able to send the message")
  }
}

function appendDetails(details){
  details = details.data
  console.log(details);
 const output = document.querySelector(".output-details")
 const df = new DocumentFragment();

 let div = document.createElement("div");
 div.className = "details-card"

 let img = document.createElement("img");
 img.src= details.imageUrl;

 let p1 = document.createElement("div")
 p1.className = "ratings"
 p1.textContent = `${details.vote_average} /10*`
 console.log(p1)

 let h2 = document.createElement("h2");
 h2.textContent = details.title;

 let p = document.createElement("p")
 p.className = "details"
 p.textContent = details.overview;


output.append(img)
div.append(h2)
div.append(p1)
div.append(p)

df.append(div)
output.append(df)
}

async function saveToFav({data}){
  // console.log(movieData)
  document.getElementById("saveToFav").addEventListener("click", async()=>{
    const cache =await caches.open("favourites-pwa")
      console.log(cache)

      const response = new Response(JSON.stringify(data), {
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": "application/json",

        }
      })
      await cache.put(data.id, response.clone())
      const resJson = await response.json()
      console.log(resJson);
  })
}

//  FAVOURITE'S PAGE

async function retrieveFromFavourite(){
  const cache = await caches.open("favourites-pwa")
  const cacheKey = await cache.keys()
 let myData = await  Promise.all(cacheKey.map(async (req)=>{
    const retrieve = await cache.match(req);
    const retrieveJSON = await retrieve.json()
    return retrieveJSON
  }))
  appendMovieCards(myData)
}

function appendMovieCards(cardData){
  console.log(cardData);
  const output = document.querySelector('.output-cards')
  let df = new DocumentFragment
  cardData.forEach(item => {
    let card = document.createElement("div");
    card.setAttribute("data-ref", item.id)
    card.className = "movieCards"
    let img = document.createElement("img")
    img.src = item.imageUrl
    img.width = 150
  
  
    let h4 = document.createElement("h4");
    h4.textContent = item.title

    card.append(img)
    card.append(h4)
    df.append(card)
  });
output.append(df)

output.addEventListener("click", grabMovieCard)
}

//CACHE PAGE
 
async function retrieveFromCache(){
  const cache = await caches.open("movie-pwa-project-1")
  const cacheKey = await cache.keys()
 let cacheData = await  Promise.all(cacheKey.map(async (req)=>{
    const retrieve = await cache.match(req);
    const {data} = await retrieve.json()
    return data
  }))
  appendMovieCards(cacheData)
}


document.addEventListener("DOMContentLoaded", init=>{
  checkPages();
  registerSw()

  
  })