let jsonData;

let bossFilter = [];
let randomizeNum = 1;


//toggle filters on and off
function toggleButton(button) {
  if (button == 'All') {
    if (!bossFilter.includes('Weekly')) {
      bossFilter.push('Weekly');
    }
    toggleButton('World');
  }
  
  let regions;
  jsonData.Keys.forEach(item => {
    if (item.name == button) {
      regions = item.key;
    }
  });

  for (let i = 0; i < regions.length; i++){
    if (bossFilter.includes(regions[i])) {
      if (button != 'World') {
        bossFilter.splice(bossFilter.indexOf(regions[i]), 1);
      }
    }
    else {
      bossFilter.push(regions[i]);
    }
  }
  document.getElementById('rFilter').innerHTML = "Current Filter: " + bossFilter.join(", ");
}


function filterButtons() {
  const div = document.getElementById("bossFilter");
  
  //console.log('jsonData: ', jsonData);
  jsonData.Keys.forEach(item => {
    const button = document.createElement('button');
    button.textContent = item.name;

    button.addEventListener("click", () => {
      //console.log(item.name);
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
    //console.log("current filter: ", bossFilter);
    //console.log("current key: ", item.key);
    //console.log(bossFilter.includes(item.key));
    if(bossFilter.includes(item.key)) {
      bossData = bossData.concat(item.bosses);
    }
  });
  //console.log(bossData);

  //to avoid overflow
  if (randomizeNum > bossData.length) {
    randomizeNum = bossData.length;
  }
  
  while (randomized.length < randomizeNum) {
    let chosenIndex = Math.floor(Math.random() * bossData.length);
    randomized.push(bossData[chosenIndex]);
    bossData.splice(chosenIndex, 1);
    //console.log("index: ", chosenIndex);
    //console.log("randomized: ", randomized);
    //console.log("bossData: ", bossData);
  }

  document.getElementById("rBoss").innerHTML = "Selected Bosses: " + randomized.join(", ");
}


const rButton = document.getElementById("rButton");
rButton.addEventListener("click", () => {
  randomizeBoss();
});

initializePage();
