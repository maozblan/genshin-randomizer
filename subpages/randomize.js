function yank(filter) {
  //console.log(filter);
  
  var bosses = [];
  
  // disable CORS because path does not contain http(s)
  fetch("./dataBoss.json", { mode: "no-cors" })
    .then((response) => response.json())
    .then((data) => console.log(data));
      /*
      //iterating through list
      for (var i = 0; i < filter.length; i++) {
        var key = filter[i];
        console.log("kay: " + key);
        console.log("data: " + data[key]);
        bosses.push(data[key]);
        console.log("bosses: " + bosses);
      }
      return bosses;
    });*/
  console.log("bosses: " + bosses);
  
  console.log("exited fetch");

  return ['azhdaha'];
}


//randomizer functions

function randomizeBoss(filter, num=1) {
  var filteredBosses = yank(filter);
  //searching times in set is better than in list
  var bossList = new Set(filteredBosses);
  var randomized = [];
  
  while (randomized.length < num) {
    var chosenIndex = Math.floor(Math.random() * bossList.size);
    var chosenItem = Array.from(bossList)[chosenIndex];
    if (!randomized.includes(chosenItem)){
      randomized.push(chosenItem); 
    }
  }
  
  document.getElementById("rBoss").innerHTML = "Selected Bosses: " + randomized.join(", ");
}

//randomize characters
function randomizeCharacters(profiles, main) {
  if (profiles.length == 3) {
    
  }
}