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