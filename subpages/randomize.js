//obtain data from dataBoss.json file
//this is all the data for world and weekly bosses
function yank(objectName) {
  
}

//sampling from list (adapted from stack overflow)
function sample(this){
  return this[Math.floor(Math.random() * this.length)];
}



//randomizer functions
//randomize bosses
function randomizeBoss(filter, num=1){
  var bossList = []; //list of bosses parsed from json
  var randomized = []; //list to be returned
  while (randomized.length < num) {
    var choice = bossList.sample;
    bossList.splice(0, 1, choice);
    randomized.push(choice);
  return randomized;
  }
}

//randomize characters
function randomizeCharacters(profiles, main){
  if (profiles.length == 3) {
    
  }
}