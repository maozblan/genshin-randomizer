let jsonData;

let bossFilter = [];
let randomizeNum = 1;


//toggle filters on and off
function toggleButton(button) {
  if (bossFilter.includes(button)) {
    bossFilter.splice(bossFilter.indexOf(button), 1);
  }
  else {
    bossFilter.push(button);
  }
  document.getElementById('rFilter').innerHTML = "Current Filter: " + bossFilter.join(", ");
}


function filterButtons() {
  const div = document.getElementById("bossFilter");
  
  console.log('jsonData: ', jsonData);
  jsonData.Keys.forEach(item => {
    const button = document.createElement('button');
    button.textContent = item.name;

    button.addEventListener("click", () => {
      console.log(item.name);
      toggleButton(item.name);
    });
  

    div.appendChild(button);
  });
}


//need to wait for fetch to finish
async function initializePage() {
  const response = await fetch("./dataBoss.json");

  //jsonData is a global variable
  jsonData = await response.json();
  console.log("fetched json data: ", jsonData);

  //page setup
  filterButtons();
}


function randomizeBoss() {
  let bossData = [];
  let randomized = [];
  
  jsonData.Bosses.forEach(item => {
    if(bossFilter.includes(item.key)) {
      bossData.concat(item.bosses);
    }
  });
  
  console.log(bossData);

  //to avoid overflow
  if (randomizeNum > bossData.length) {
    randomizeNum = bossData.length;
  }
  
  while (randomized.length < randomizeNum) {
    let chosenIndex = Math.floor(Math.random() * bossData.length);
    randomized.push(bossData[chosenIndex]);
    bossData.splice(chosenIndex, 1);
  }

  document.getElementById("rBoss").innerHTML = "Selected Bosses: " + randomized.join(", ");
}


const rButton = document.getElementById("rButton");
rButton.addEventListener("click", () => {
  randomizeBoss();
});

initializePage();
