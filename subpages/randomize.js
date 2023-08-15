// character randomization
let playerData = {};
let characterData;

let pVisuals = document.getElementById('pVisuals');
let bVisuals = document.getElementById('bVisuals');
let message_p = document.getElementById('message_p');
let message_b = document.getElementById('message_b');

let playerList = {'p1': '', 'p2': '', 'p3': '', 'p4': ''};
let characterList = {'p1': [], 'p2': [], 'p3': [], 'p4': []};
let bannedCharacterList = {'p1': [], 'p2': [], 'p3': [], 'p4': []};
let p1 = document.getElementById('p1');
let p2 = document.getElementById('p2');
let p3 = document.getElementById('p3');
let p4 = document.getElementById('p4');

let players = [p1, p2, p3, p4];

function toggleBans() {
  const message = document.getElementById('banMessage');
  if (message.className == 'BAN') {
    message.className = 'noBAN';
    message.textContent = 'Bans Currently Lifted';
    Object.keys(characterList).forEach(item => {
      characterList[item] = [...characterList[item], ...bannedCharacterList[item]];
    });
   } else {
    message.className = 'BAN';
    message.textContent = 'Bans Currently Enforced';
    Object.keys(characterList).forEach(item => {
      characterList[item] = characterList[item].filter(character => !bannedCharacterList[item].includes(character));
    });
  }
}

/*
pVisuals div includes 4 characters, layout as follows:
      <div id="p1" class="player">
        <p id="p1Name" class="playerText"></p>
        <p id="p1CharaName" class="playerText"></p>
        <img id="p1CharaPic" class="playerPic">
      </div>
where the player numbers iterate from 1 to 4 (inclusive)
*/

function setupRandomizeButtons () {
  const rButton_b = document.getElementById("rButton_b");
  rButton_b.addEventListener("click", () => {
    randomizeBoss();
    updateBossVisuals();
  });

  const rButton_p = document.getElementById("rButton_p");
  rButton_p.addEventListener("click", () => {
    randomizeCharacters(getSelectedPlayers(), getSelectedCharacters());
  });
}

function setupPlayerDivs() {
  console.log(pVisuals);
  for (let i = 0; i < 4; i++) {
    let playerDiv = document.createElement('div');
      playerDiv.id = 'p' + String(i) + 'RDiv';
      playerDiv.className = 'player';

    let playerName = document.createElement('p');
      playerName.id = 'p' + String(i) + 'Name';
      playerName.className = 'playerName verticalText';
    let charaPic = document.createElement('img');
      charaPic.id = 'p' + String(i) + 'CharaPic';
      charaPic.className = 'playerPic';
    let element = document.createElement('img');
      element.id = 'p' + String(i) + 'Ele';
      element.className = 'charaElement';
    let tag = document.createElement('div');
      tag.className = 'playerTag';

    tag.appendChild(element);
    tag.appendChild(playerName);

    playerDiv.appendChild(charaPic);
    playerDiv.appendChild(tag);
    console.log(playerDiv);

    pVisuals.appendChild(playerDiv);
    playerDiv.style.display = 'none';
  }
}

function setupDropdown() {
  /* someday i'll make it so the next divs appear as you choose profiles...
  document.getElementById('p2Div').style.display = 'none';
  document.getElementById('p3Div').style.display = 'none';
  document.getElementById('p4Div').style.display = 'none';
  */

  Object.keys(playerData).forEach(p => {

    players.forEach(item => {
      let option = document.createElement('option');
      option.id = option.value = p;
      option.textContent = playerData[p].name;
      item.appendChild(option);
      item.addEventListener("change", () => {
        playerList[item.id] = item.value;

        bannedCharacterList[item.id] = JSON.parse(localStorage.getItem(item.value)).bans;
        characterList[item.id] = JSON.parse(localStorage.getItem(item.value)).characters;
      });
    });
  });
}

function getSelectedPlayers() {
  return Object.values(playerList).filter(value => value != '');
}

function getSelectedCharacters() {
  return Object.values(characterList).filter(value => !value.length == 0);
}

function randomizeCharacters(pList, cList) {
  console.log(characterList);
  console.log(pList, cList);
  // pList contains profile IDs, use playerData[ID].name to get the profile name
  // cList contains character names, can be used normally

  if (pList.length > 0) {
    pVisuals.style.display = '';
    message_p.textContent = '';

    let selected = [];
    let players;
    if (pList.length == 4) {
      players = [getName(pList[0]),getName(pList[1]), getName(pList[2]), getName(pList[3])];
      for (let i = 0; i < pList.length; i++) {
        selected = [...selected, ...selectCharacters(cList[i].filter(item => !selected.includes(item)), 1)];
      }
    } else if (pList.length == 3) {
      players = [getName(pList[0]),getName(pList[0]), getName(pList[1]), getName(pList[2])];
      selected = [...selectCharacters(cList[0], 2)];
      for (let i = 1; i < pList.length; i++) {
        selected = [...selected, ...selectCharacters(cList[i].filter(item => !selected.includes(item)), 1)];
      }
    } else if (pList.length == 2) {
      players = [getName(pList[0]),getName(pList[0]), getName(pList[1]), getName(pList[1])];
      for (let i = 0; i < pList.length; i++) {
        selected = [...selected, ...selectCharacters(cList[i].filter(item => !selected.includes(item)), 2)];
      }
    } else {
      players = [getName(pList[0]),getName(pList[0]), getName(pList[0]), getName(pList[0])];
      selected = selectCharacters(cList[0], 4);
    }
    
    updateCharacterVisuals(selected, players);
  
  } else {
    message_p.textContent = 'please select at least one player profile';
    if (Object.keys(playerData).length == 0) {  //TODO check
      message_p.textContent = 'please use CHARACTER PROFILES on the home page or PROFILES in the side bar to create profile(s) before randomization'
    }
    pVisuals.style.display = 'none';
  }
}

function getName(playerID) {
  return playerData[playerID].name;
}

function getImg(characterName) {
  return '../images/character/' + characterName + '.webp';
}

function getElementImg(characterName) {
  let element;
  if (characterName == 'aether' || characterName == 'lumine') {
    let random = Math.floor(Math.random() * characterData[characterName].element.length);
    element = characterData[characterName].element[random];
  } else {
    element = characterData[characterName].element;
  }
  return '../images/elements/' + element + '.svg';
}

function selectCharacters(cList, cNum) {
  let list = [...cList];  // copy to avoid editing original
  let chosen = [];

  if (list.length < 1) {
    list = ['aether'];
  }

  // if characters owned < characters needed 
  while (list.length < cNum) {
    list = [...list, ...list];
  }

  while (chosen.length < cNum) {
    let chosenIndex = Math.floor(Math.random() * list.length);
    chosen.push(list[chosenIndex]);
    list.splice(chosenIndex, 1);
  }
  return chosen;
}

function updateCharacterVisuals(c, p) {
  // list of character names (c) and player names (p), use normally

  for (let i = 0; i < 4; i++) {
    document.getElementById('p' + String(i) + 'RDiv').style.display = '';

    let img = document.getElementById('p' + String(i) + 'CharaPic');
    img.src = getImg(c[i]);

    let player = document.getElementById('p' + String(i) + 'Name');
    player.textContent = p[i];

    let element = document.getElementById('p' + String(i) + 'Ele');
    element.src = getElementImg(c[i]);
  }
}







// boss randomization 
let bossData;

let bossFilter = [];
let randomizeNum = 1;
let randomizedBosses = [];

let prevButton = document.getElementById('prevButton');
let nextButton = document.getElementById('nextButton');
let currBossPic_name = document.getElementById('bossName');
let currBossPic_pic = document.getElementById('bossPic');
let currBossPic_index = 0;

function setupBossSlider() {
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
  if (bossFilter.length > 0 && randomizedBosses.length > 0) {
    console.log(randomizedBosses, randomizedBosses[currBossPic_index]);
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


function setupFilterButtons() {
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
}
 


function randomizeBoss() {
  let bossList = [];
  randomizedBosses = [];  // clear old data
  currBossPic_index = 0;  // reset picture slider to start
  
  if (bossFilter.length > 0) {
    bVisuals.style.display = '';

    message_b.textContent = '';
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
  } else { 
    message_b.textContent = 'please select area(s) to include in randomization';
    bVisuals.style.display = 'none';
  }
}





// on start // broken into bosses side and characters side

//need to wait for fetch to finish
async function initializeBosses() {
  // set up bossData
  const response = await fetch("./dataBoss.json");
  bossData = await response.json();
  console.log("fetched json data: ", bossData);

  //page setup that rely on bossData
  setupFilterButtons();
}

async function initializeCharacters() {
  const response = await fetch("./dataChara.json");
  characterData = await response.json();

}

function pageSetup() {
  // bosses
  bVisuals.style.display = 'none';

  let bossCount = document.getElementById('bossCount')
  bossCount.addEventListener("change", () => {
    randomizeNum = parseInt(bossCount.value);
    console.log(randomizeNum, typeof(randomizeNum));
  });

  setupBossSlider();
  setupRandomizeButtons();


  // characters
  let playerList = localStorage.getItem("profileList");
  if (playerList == null && playerList.length != 0) {
    console.log("no player data found");
    message_p.textContent = 'you currently have no player profiles! go to PROFILES in the side bar to make someyou currently have no player profiles! go to PROFILES in the side bar to make some.'
  } else {
    playerList = JSON.parse(playerList);
    playerList.forEach(item => {
      playerData[item] = JSON.parse(localStorage.getItem(item));
    });

    console.log("fetched player data: ", playerData);
  }

  setupPlayerDivs();
  setupDropdown();
}


initializeBosses();
initializeCharacters();
pageSetup();
