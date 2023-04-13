let jsonData;
const output = document.getElementById('content');
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
    //grab localStorage profile data, then set up div 'content'
    let data = JSON.parse(window.localStorage.getItem('genshinRandomizer'));

    let profileList = document.createElement('div');
    output.appendChild(profileList);

    if (name == 'main') {
        //load up page

        // if jsonObj 'data' has key 'profiles'
        if (!data[profiles]) {
            let tempPara = document.createElement('p');
            tempPara.textContent = "Head to 'Add' to create a new profile or upload an existing one!";
            profileList.appendChild(tempPara);
        }
        else {
            data.profiles.forEach(item => {
                let button = document.createElement('button');
                let pfp = document.createElement('img');
                let name = document.createElement('span');
                
                pfp.src = item.pfp;
                name.textContent = item.name;

                button.appendChild(pfp);
                button.appendChild(name);

                button.addEventListener("click", () => {
                    //clicking pulls up the profile in edit mode
                });

                profileList.appendChild(button);
            });
        }

    }
    else if (name == 'testing') {
        console.log('creating content, code: testing');

        jsonData.chara.forEach(item => {
            let button = document.createElement('span');
            let pfp = document.createElement('img');
            let chara = document.createElement('p');
            pfp.src = item.pfp;
            chara = item.display;

            button.appendChild(pfp);
            //chara.appendChild(chara);

            button.addEventListener("click", () => {
                alert(chara + ' has been selected\n item pfp: ' + item.pfp);
            });

            profileList.appendChild(button);
        });
    }
}


async function initializePage() {
    console.log('initializing profiles page');

    const response = await fetch("./dataChara.json");
    jsonData = await response.json();

    //using localStorage to store character profiles
    //setting up base item
    //window.localStorage.setItem('genshinRandomizer', '');

    content('testing');
};

initializePage();
