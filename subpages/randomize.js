// character randomization
let playerData;


/*
pVisuals div includes 4 characters, layout as follows:
      <div id="p1" class="player">
        <p id="p1Name" class="playerText"></p>
        <p id="p1CharaName" class="playerText"></p>
        <img id="p1CharaPic" class="playerPic">
      </div>
where the player numbers iterate from 1 to 4 (inclusive)
*/

function setupPlayerDivs() {
  let allPlayerDiv = document.getElementById('pVisuals');
  for (let i = 1; i <= 4; i++) {
    let playerDiv = document.createElement('div');
      playerDiv.id = 'p' + String(i);
      playerDiv.className = 'player';

    let playerName = document.createElement('p');
      playerName.id = 'p' + String(i) + 'Name';
      playerName.className = 'playerText';
    let charaName = document.createElement('p');
      charaName.id = 'p' + String(i) + 'CharaName';
      charaName.className = 'playerText';
    let charaPic = document.createElement('img');
      charaPic.id = 'p' + String(i) + 'CharaPic';
      charaPic.className = 'playerPic';
    
    playerDiv.appendChild(playerName);
    playerDiv.appendChild(charaName);
    playerDiv.appendChild(charaPic);

    allPlayerDiv.appendChild(playerDiv);
  }
}





// boss randomization 
let bossData;

let bossFilter = [];
let randomizeNum = 5;
let randomizedBosses = [];

/*
bVisuals = image slider
  <div id="bVisuals">
    <div id="prevButton" class="bVSlider">prev button</div>
    <div id="nextButton" class="bVSlider">next button</div>
    <p id="bossName" class="bName"></p>
    <img id="bossPic" class="bPic"></img>
  </div>
*/
let bVisuals = document.getElementById('bVisuals');
let prevButton = document.createElement('div');
let nextButton = document.createElement('div');
prevButton.className = nextButton.className = 'bVSlider';
prevButton.textContent = '<';
nextButton.textContent = '>';
let currBossPic_name = document.createElement('p');
let currBossPic_pic = document.createElement('img');
let currBossPic_index = 0;

function setupBossSlider() {
  console.log("setting up boss slider");
  //bVisuals.appendChild(prevButton, nextButton, currBossPic_name, currBossPic_pic);
  bVisuals.appendChild(prevButton);
  bVisuals.appendChild(nextButton);
  bVisuals.appendChild(currBossPic_pic);
  nextButton.addEventListener("click", () => {
    if (currBossPic_index < randomizedBosses.length - 1) {
      currBossPic_index++;
      updateBossVisuals();
    }
  });
  prevButton.addEventListener("click", () => {
    if (currBossPic_index > 0) {
      currBossPic_index--;
      updateBossVisuals();
    }
  });
}

function updateBossVisuals() {
    if (bossFilter.length > 0) {
      let imgName = randomizedBosses[currBossPic_index].replace(/ /g,"_");
      currBossPic_pic.src = String("../images/bosses/" + imgName + ".webp");
      console.log("updating boss visuals: ", imgName);
      console.log("list: ", randomizedBosses, ", index: ", currBossPic_index);
    }
}


//toggle filters on and off
function toggleButton(button) {
  if (button == 'All') {
    if (!bossFilter.includes('Weekly')) {
      bossFilter.push('Weekly');
      document.getElementById('Weekly').classList.add('buttonON');
    }
    toggleButton('World');
  }
  
  let regions;
  bossData.Keys.forEach(item => {
    if (item.name == button) {
      regions = item.key;
    }
  });

  for (let i = 0; i < regions.length; i++){
    if (bossFilter.includes(regions[i])) {
      if (button != 'World') {
        bossFilter.splice(bossFilter.indexOf(regions[i]), 1);
        document.getElementById(regions[i]).classList.add('buttonOFF');
        document.getElementById(regions[i]).classList.remove('buttonON');
      }
    }
    else {
      bossFilter.push(regions[i]);
      document.getElementById(regions[i]).classList.add('buttonON');
      document.getElementById(regions[i]).classList.remove('buttonOFF');
    }
  }
}


function filterButtons() {
  const div = document.getElementById("bossFilter");
  
  bossData.Keys.forEach(item => {
    if (item.name != "World") {
      const button = document.createElement('div');
      button.textContent = button.id = item.name;
      button.className = 'button buttonOFF';

      button.addEventListener("click", () => {
        toggleButton(item.name);
      });

      div.appendChild(button);
    }
  });

  const rButton = document.getElementById("rButton");
  rButton.className = 'button buttonOFF';
  rButton.addEventListener("click", () => {
    randomizeBoss();
    updateBossVisuals();
    if (bVisuals.childElementCount === 0) {
      setupBossSlider();
    }
  });
}



function randomizeBoss() {
  let bossList = [];
  randomizedBosses = [];  // clear old data
  currBossPic_index = 0;  // reset picture slider to start
  
  console.log(bossData);
  bossData.Bosses.forEach(item => {
    if(bossFilter.includes(item.key)) {
      bossList = bossList.concat(item.bosses);
    }
  });

  //to avoid overflow
  if (randomizeNum > bossList.length) {
    randomizeNum = bossList.length;
  }
  
  while (randomizedBosses.length < randomizeNum) {
    let chosenIndex = Math.floor(Math.random() * bossList.length);
    randomizedBosses.push(bossList[chosenIndex]);
    bossList.splice(chosenIndex, 1);
  }
  console.log('randomized list: ', randomizedBosses);
}





// on start

//need to wait for fetch to finish
async function initializePage() {
  // set up player data
  // player data should be stored in json format
  if (!localStorage.getItem("profiles")) {
    console.log("no player data found");
  } else {
    playerData = JSON.parse(localStorage.getItem("profiles"));
    console.log("fetched player data: ", playerData);
  }

  // set up bossData
  const response = await fetch("./dataBoss.json");
  bossData = await response.json();
  console.log("fetched json data: ", bossData);

  //page setup
  setupPlayerDivs();
  filterButtons();
}

initializePage();
