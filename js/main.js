function registerSw(){
    if('serviceWorker' in navigator){
        navigator.serviceWorker.register('./sw.js');
    }
}
let date = document.getElementById('date')
newdate()
function newdate(){
  const todayDate = Date.now();

  date.textContent = Date.now()
}