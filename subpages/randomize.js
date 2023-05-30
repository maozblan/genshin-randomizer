// character randomization
let playerData;

// pVisuals div includes 4 characters, layout as follows:
//      <div id="p1" class="player">
//        <p id="p1Name" class="playerText"></p>
//        <p id="p1CharaName" class="playerText"></p>
//        <img id="p1CharaPic" class="playerPic">
//      </div>
// where the player numbers iterate from 1 to 4 (inclusive)
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
let randomizeNum = 1;

// bVisuals is essentially an image slider

// set up image slider buttons ONLY if randomized boss count > 1
function setupSliderButtons() {

}


//toggle filters on and off
function toggleButton(button) {
  if (button == 'All') {
    if (!bossFilter.includes('Weekly')) {
      bossFilter.push('Weekly');
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
  
  //console.log('bossData: ', bossData);
  bossData.Keys.forEach(item => {
    const button = document.createElement('button');
    button.textContent = item.name;

    button.addEventListener("click", () => {
      //console.log(item.name);
      toggleButton(item.name);
    });
  

    div.appendChild(button);
  });
}



function randomizeBoss() {
  let bossData = [];
  let randomized = [];
  
  bossData.Bosses.forEach(item => {
    if(bossFilter.includes(item.key)) {
      bossData = bossData.concat(item.bosses);
    }
  });

  //to avoid overflow
  if (randomizeNum > bossData.length) {
    randomizeNum = bossData.length;
  }
  
  while (randomized.length < randomizeNum) {
    let chosenIndex = Math.floor(Math.random() * bossData.length);
    randomized.push(bossData[chosenIndex]);
    bossData.splice(chosenIndex, 1);
  }

  document.getElementById("rBoss").textContent = "Selected Bosses: " + randomized.join(", ");
  
  let pictureFrame = document.getElementById("bVisuals");

  if (pictureFrame.firstChild) {
    pictureFrame.removeChild(pictureFrame.firstChild);
  }

  for (i = 0; i < randomized.length; i++){
    let picture = document.createElement('img');
    let imgName = randomized[i].replace(/ /g,"_");
    picture.src = String("../images/bosses/" + imgName + ".webp");
    //console.log('image: ' + picture.src);
    pictureFrame.appendChild(picture);
  }  
}


const rButton = document.getElementById("rButton");
rButton.addEventListener("click", () => {
  randomizeBoss();
});




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
