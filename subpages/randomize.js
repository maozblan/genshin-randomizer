const bossKeys = ['Weekly', 'Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine'];

//writing up the html
let html = document.getElementById("bossFilter");
html.innerHTML = "";
for (let i = 0; i < bossKeys.length; i++) {
  html.innerHTML += `<button class="filter" id=${bossKeys[i]}>${bossKeys[i]}</button>`;
}

/*
async function fetchFile() {
  let response = await fetch("./dataBoss.json", { mode: "no-cors" });
  var jsonFile = await response.json();
}

fetchFile();
console.log(jsonFile);
console.log(typeof jsonFile);
console.log("values: "+jsonFile['Weekly'].values);
*/

//we need to wait for fetch() to finish
async function randomizeBoss(filter, num=1) {
  let bossList = [];
  let bossData;

  //parses .json, applies filter, output = bossList
  await fetch("./dataBoss.json", { mode: "no-cors" })
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < filter.length; i++) {
        let key = filter[i];
        bossData = Object.values(data[key])
        bossList = bossList.concat(String(bossData).split(","));
      }
    });
  
  //console.log("boss list: "+bossList);
  let randomized = [];

  //to avoid overflow
  if (num > bossList.length) {
    num = bossList.length
  }
  
  while (randomized.length < num) {
    let chosenIndex = Math.floor(Math.random() * bossList.length);
    //console.log("chosen index: "+chosenIndex);
    //console.log("length: "+bossList.length);
    randomized.push(bossList[chosenIndex]);
    bossList.splice(chosenIndex, 1);
  }

  document.getElementById("rBoss").innerHTML = "Selected Bosses: " + randomized.join(", ");
}

//randomize characters
function randomizeCharacters(profiles, main) {
  if (profiles.length == 3) {
    
  }
}