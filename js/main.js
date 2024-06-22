
function registerSw(){
  if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js');
  }

  navigator.serviceWorker.addEventListener("message", receiveMessage)
}


function checkPages(){
if(document.body.classList.contains("index.html")){
  grabInputHome()
  console.log("index.html page")

} else if(document.body.classList.contains("results.html")){
  console.log("results.html page")
  fetchDataResults()

}else if(document.body.classList.contains("results.html")){
  console.log("results.html page")

}else if(document.body.classList.contains("details.html")){
  console.log("details.html page")
  getOneId()
}else if(document.body.classList.contains("cached.html")){
  console.log("cached.html page")
}else if(document.body.classList.contains("favourite.html")){
  console.log("favourite.html page")
}
}

// HOME PAGE CODE
function grabInputHome(){
const form = document.querySelector("form");
const input = document.getElementById("search__input");
const sort = document.getElementById("sort");


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

console.log(location.href)
const url = new URL(location.href)

for(let x of url.searchParams.values()){
query.push(x)
}

let keyword = query[0]
let sort = query[1]

const BaseUrl = `https://mad9124-midterm-qjd3.onrender.com/api/movies?keyword=${keyword}&sort=${sort}`


fetch(BaseUrl).then((res)=>{
  if(!res.ok){
    throw new Error("Something is wrong")
  }
  return res.json();
}).then(({data})=> {appendData(data) 
  console.log(data)})
}


function appendData(data){
  const output = document.querySelector('.output')
  let df = new DocumentFragment
  data.forEach(item => {
    let card = document.createElement("div");
    card.setAttribute("data-ref", item.id)
    card.className = "movieCards"
    let img = document.createElement("img")
    img.src = item.imageUrl
  
  
    let h3 = document.createElement("h3");
    h3.textContent = item.title

    card.append(img)
    card.append(h3)
    df.append(card)
  });
output.append(df)

output.addEventListener("click", grabMovieCard)
}

function grabMovieCard(ev){
ev.preventDefault()
let cardClicked;
if(ev.target.closest(".movieCards")){
   console.log("clicked on card")
   cardClicked = ev.target.closest(".movieCards").getAttribute("data-ref")
  //  console.log(cardClicked)
}
if(cardClicked){

  postIdMessage(cardClicked)
  console.log(cardClicked)
  location.href = `./details.html?id=${cardClicked}`
  
}
}

//DETAILS PAGE

function getOneId(){

  let url = new URL(location.href)
  console.log(url)
let params = [];
  for(let a of url.searchParams.values()){
params.push(a)
  }

  console.log(params)
  fetchGetOne(params)
}

function fetchGetOne(cardId){
  const getOneUrl = `https://mad9124-midterm-qjd3.onrender.com/api/movies/${cardId}`;
  fetch(getOneUrl).then((res)=>{
    if(!res.ok) throw new Error("Something went wrong in getOne")
      return res.json()
  }) .then((data)=> console.log(data))
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

 let p1 = document.createElement("p")
 p1.textContent = details.vote_average
 console.log(p1)

 let h2 = document.createElement("h2");
 h2.textContent = details.title;

 let p = document.createElement("p")
 p.textContent = details.overview;


div.append(img)
div.append(p1)
div.append(h2)
div.append(p)

df.append(div)
output.append(df)
}

function receiveMessage(ev){
  console.log(ev.data.details)
  if(type = "details"){
    appendDetails(ev.data.details)
  }
}

document.addEventListener("DOMContentLoaded", init=>{
  checkPages();
  registerSw()
  })