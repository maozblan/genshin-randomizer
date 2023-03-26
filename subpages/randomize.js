async function yank(filter) {
  console.log("Filter: " + filter);

  let bosses = [];

  // disable CORS because path does not contain http(s)
  //fetch takes awhile, so we need async/await
  await fetch("./dataBoss.json", { mode: "no-cors" })
    .then((response) => response.json())
    .then((data) => {
      //iterating through list
      for (let i = 0; i < filter.length; i++) {
        let key = filter[i];
        //console.log("key: " + key);
        //console.log("data: " + data[key]);
        bosses.push(data[key]);
        //console.log("bosses in: " + bosses);
      }
    });
  //console.log("bosses out: " + bosses);
  return bosses;
}


//randomizer functions
function randomizeBoss(filter, num=1) {
  let bossList = yank(filter);
  console.log("boss list: "+bossList);
  let randomized = [];
  let chosenIndex = 0;
  randomzed.push(bossList[chosenIndex]);
  
/*
  while (randomized.length < num) {
    let chosenIndex = Math.floor(Math.random() * bossList.size);
    let chosenItem = Array.from(bossList)[chosenIndex];
    if (!randomized.includes(chosenItem)) {
      randomized.push(chosenItem); 
    }
  }
  */
  document.getElementById("rBoss").innerHTML = "Selected Bosses: " + randomized.join(", ");
}

//randomize characters
function randomizeCharacters(profiles, main) {
  if (profiles.length == 3) {
    
  }
}