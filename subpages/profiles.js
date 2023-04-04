let jsonData;
let output = document.getElementById('content').innerHTML;
let choices = document.getElementById('choices').innerHTML;
//output page type: main, add, edit

//couple of other elements
let actions = document.createElement('div');
let name = document.createElement('div');
let traveler = document.createElement('div');
let charaList_have = document.createElement('div');
let charaList_dont = document.createElement('div');
let charaList_ban = document.createElement('div');

//create .csv file
//used for both making a new profile and saving a new profile
//sharing profiles with other people -> share csv file
function createCSVFile(fileName) {
  
}

//read .csv file as profile into local memory
function readIntoProfile(fileName) {
  
}

//edit profile information
function editProfile(fileName){
  
}


function content(name) {
    if (name == 'main') {
        //load up page
        jsonData.pyro.forEach(item => {

        });
    }
    else {
        //add version
        if (name == 'edit') {
            //load in the data of profile
        }
    }
}


async function initalizePage() {
    const response = await fetch("./dataChara.json");
    jsonData = await response.json();
    
    const pageLoadUps = ['main', 'add', 'edit']
    for (let x = 0; x < pageLoadUps.length; x++) {
        const button = document.createElement('button');
        button.textContent = pageLoadUps[x];
        button.addEventListener("click", () => {
            content(pageLoadUps[x]);
        });
        choices.appendChild(button);
    }

    content('main');
};

initializePage();
