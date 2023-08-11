/* functions that simplify code */

function turnButtonOFF(item) {  // returns true if successfully turns button off
    if (item.classList.contains('buttonON')) {
        item.classList.remove('buttonON');
        item.classList.add('buttonOFF');
        return true;
    }
}

function turnButtonON(item) {  // returns true if successfully turns button on
    if (item.classList.contains('buttonOFF')) {
        item.classList.remove('buttonOFF');
        item.classList.add('buttonON');
        return true;
    }
}

function toggleButton(item) {  
    if (!turnButtonON(item)) {
        turnButtonOFF(item);
    }
}

function pfp(chara) {
    return '../images/pfp/' + chara + '.webp';
}

function makeProfileID() {
    profileCount = JSON.parse(localStorage.getItem("profileCount"));
    profileID = "profile" + profileCount.toString();
    profileCount++;
    localStorage.setItem("profileCount", JSON.stringify(profileCount));
}

function createProfile(id, json) {
    let div = document.createElement('div');
    div.id = id;
    div.textContent = json.name;

    let pic = document.createElement('img');
    pic.src = pfp(json.pfp);

    div.appendChild(pic);
    content.appendChild(div);

    div.addEventListener("click", () => {
        console.log('current mode ', mode);
        if (['delete', 'export'].includes(mode)) {
            if (div.classList.contains('buttonON')) {
                turnButtonOFF(div);
            } else {
                turnButtonON(div);
            }
        } else { 
            window.location.href = `editProfiles.html?profile=${encodeURIComponent(id)}`;
        }
    });

    // for css
    div.className = 'profile button buttonOFF';
}

function createCharacter(json, have, ban) {
    const profiles = Object.keys(json);
    profiles.forEach(item => {
        let div = document.createElement('div');
        div.id = item;
        div.textContent = json[item].name;

        let pic = document.createElement('img');
        pic.src = pfp(item);

        div.appendChild(pic);
        profileCharacters.appendChild(div);

        div.addEventListener("click", () => {
            if (document.getElementById('changePfp').classList.contains('buttonON')) {
                changePfp(item);
            } else {
                toggleCharacter(div);
            }
        });

        // for css
        div.className = 'profile button buttonOFF';

        if (have.includes(item)) {
            div.classList.add('have');
        } else if (ban.includes(item)) {
            div.classList.add('ban');
        } else {
            div.classList.add('dontHave');
        }
    });
}







// handling file i/o
function setupIO() {
    document.getElementById("import").addEventListener("change", function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const jsonData = event.target.result;
            updateProfileList(JSON.parse(jsonData));  // jsonData is string
            if (Object.keys(jsonData).length > 0) {
                message.textContent = '';
            }
            console.log("imported csv", jsonData);
        }
        
        reader.readAsText(file);
    });

    // exports handled in toggleMode('export') and writeExportJSON()
}

function writeExportJSON(loc) {
    let json = {};
    let profilesToExport = document.querySelectorAll(loc);
    if (profilesToExport.length > 0) {
        profilesToExport.forEach(item => {
            let fetched = JSON.parse(localStorage.getItem(item.id));
            json[item.id] = fetched;
        });
    }
    console.log(json);
    return json;
}



/* handling list of profiles in main profile page*/

let jsonData;
let profileList = [];
let mode = 'none';
const message = document.getElementById('message');
const content = document.getElementById('content');

function toggleMode(m) {
    mode = m;
    let button = document.getElementById(mode);
    if (button.classList.contains('buttonOFF')) {
        turnButtonON(button);

        const otherButtons = document.querySelectorAll('#choices .button');
        otherButtons.forEach(item => {
            if (item !== button) {
                turnButtonOFF(item);
            }
        });

        if (mode == 'new') {
            window.location.href = 'editProfiles.html';
        }
    } else {
        turnButtonOFF(button);
        mode = 'none';
    }

    // clear old data
    let tempButtons = document.querySelectorAll('#choices .temp');
    if (tempButtons.length > 0) {
        tempButtons.forEach(item => {
            item.remove();
        });
    }
    message.textContent = '';

    // make new data
    let confirm;
    let cancel;
    if (['delete', 'export'].includes(mode)) {
        confirm = document.createElement('div');
        confirm.textContent = 'confirm';
        confirm.className = 'button buttonON temp';

        cancel = document.createElement('div');
        cancel.textContent = 'cancel';
        cancel.className = 'button buttonON temp';

        document.getElementById('choices').appendChild(confirm);
        document.getElementById('choices').appendChild(cancel);

        cancel.addEventListener("click", () => {
            let selectedProfiles = document.querySelectorAll('#content .buttonON');
            if (selectedProfiles.length > 0) {
                selectedProfiles.forEach(item => {
                    turnButtonOFF(item);
                });
            }
            toggleMode(mode);
        });
    }

    // delete mode
    if (mode == 'delete') {
        message.textContent = 'select profiles you want to delete. use confirm to confirm or cancel to exit.';
        confirm.addEventListener("click", () => {  //TODO
            let profilesToDelete = document.querySelectorAll('#content .buttonON');
            if (profilesToDelete.length > 0) {
                profilesToDelete.forEach(item => {
                    profileList.splice(profileList.indexOf(item.id), 1);
                    localStorage.removeItem(item.id);
                    item.remove();
                });
                localStorage.setItem("profileList", JSON.stringify(profileList));
                toggleMode('delete');  // exit delete mode
            }
        });
    }

    // export mode
    if (mode == 'export') {
        message.textContent = 'select profiles you want to delete. use confirm to export or cancel to exit.';
        confirm.addEventListener("click", () => {
            const jsonData = JSON.stringify(writeExportJSON('#content .buttonON'));
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            a.download = "randomizerProfiles.json";
            a.click();
            
            // Clean up the URL and the element after the download
            URL.revokeObjectURL(url);

            toggleMode('export');  // exit export mode
        });
    }
}

function updateProfileList(json) {
    let profiles = Object.keys(json);
    profiles.forEach(id => {
        makeProfileID();
        createProfile(profileID, json[id]);
        profileList.push(profileID);
        localStorage.setItem(profileID, JSON.stringify(json[id]));
    });
    localStorage.setItem('profileList', JSON.stringify(profileList));
    console.log("updated profile list", profileList);
}





/* content for editing profiles / editProfile.html */

const profilePic = document.getElementById('pfp');
const profileName = document.getElementById('name');
const profileCharacters = document.getElementById('characters');
let profileFilter = [];
let profile;  // get from local storage
let profileID;  // json id from profile

let profileCount;


function editProfile() {
    if (profileID !== null) {
        profile = JSON.parse(localStorage.getItem(profileID));
    } else {
        profile = {
            "name" : "new profile",
            "pfp" : "albedo",
            "characters" : [],
            "bans" : []
        };
    }

    // set up characters
    createCharacter(jsonData, profile.characters, profile.bans);

    // set up info
    profilePic.src = pfp(profile.pfp);
    profileName.placeholder = profile.name;
}

function toggleFilter(filter) {
    let button = document.getElementById(filter);
    let elements = document.querySelectorAll('.' + filter);
    if (turnButtonON(button)) {
        profileFilter.push(filter);
        elements.forEach(item => {
            console.log('showing', item);
            item.style.display = '';
        });
    } else {
        turnButtonOFF(button);
        profileFilter.splice(profileFilter.indexOf(filter), 1);
        elements.forEach(item => {
            item.style.display = 'none';
        });
    }
}

function toggleCharacter(chara) {
    if (chara.classList.contains('dontHave')) {
        chara.classList.remove('dontHave');
        chara.classList.add('have');
        profile.characters.push(chara.id);

        // make sure you only have aether or lumine
        if (chara.id === 'aether') {
            while (!document.getElementById('lumine').classList.contains('dontHave')) {
                toggleCharacter(document.getElementById('lumine'));
            }
        }
        if (chara.id === 'lumine') {
            while (!document.getElementById('aether').classList.contains('dontHave')) {
                toggleCharacter(document.getElementById('aether'));
            }
        }

    } else if (chara.classList.contains('have')) {
        chara.classList.remove('have');
        chara.classList.add('ban');
        profile.characters.splice(profile.characters.indexOf(chara.id), 1);
        profile.bans.push(chara.id);
    } else {
        chara.classList.remove('ban');
        chara.classList.add('dontHave');
        profile.bans.splice(profile.bans.indexOf(chara.id), 1);
    }
}

function exitEdit(cmd) {
    if (cmd === 'save') {
        profile.characters = [];  // clear old data
        profile.bans = [];

        let have = document.querySelectorAll('#characters .have');
        have.forEach(item => {
            profile.characters.push(item.id);
        });
        
        let ban = document.querySelectorAll('#characters .ban');
        ban.forEach(item => {
            profile.bans.push(item.id);
        });

        // new profile creation
        if (profileID === null) {
            // if no profileID is found, make one and save it
            makeProfileID();

            profileList = JSON.parse(localStorage.getItem("profileList"));
            if (profileList === null) {  // there are no saved profiles
                profileList = [];
            }

            profileList.push(profileID);
            localStorage.setItem("profileList", JSON.stringify(profileList));
        }

        localStorage.setItem(profileID, JSON.stringify(profile)); 
    }
    window.location.href = 'profiles.html';
}

function changePfp(character) {
    profile.pfp = character;
    profilePic.src = pfp(character);
    document.getElementById('changePfp').click();
}





function fetchLocalStorage() {
    profileList = localStorage.getItem("profileList");
    console.log('fetched local profiles: ', profileList);
    if (profileList === null || profileList.length == 0) {
        message.textContent = 'you have no profiles! click new to create one or import a file';
        profileList = [];
    } else {
        profileList = JSON.parse(profileList);

        // output data into contetnt
        profileList.forEach(item => {
            console.log("parsing", item);
            const json = JSON.parse(localStorage.getItem(item));
            createProfile(item, json);
        });
    }

    // profileID for new profiles
    profileCount = localStorage.getItem("profileCount");
    if (profileCount === null) {
        localStorage.setItem("profileCount", JSON.stringify(1));
    }
}


async function initializePage() {
    console.log('initializing profiles page');

    // fetching character data
    const response = await fetch("./dataChara.json");
    jsonData = await response.json();

    // set up main page
    if (document.body.dataset.page === 'profileList') {
        setupIO();
        fetchLocalStorage();

        const id = ['import', 'new', 'delete', 'export'];
        for (let i = 0; i < id.length; i++) {
            const button = document.getElementById(id[i]);
            button.className = 'button buttonOFF';
            button.addEventListener("click", () => {
                toggleMode(id[i]);
            });
        }

    // set up editing page
    } else if (document.body.dataset.page === 'profileEditing') {
        const id2 = ['have', 'dontHave', 'ban'];
        for (let i = 0; i < id2.length; i++) {
            const button = document.getElementById(id2[i]);
            button.className = 'button buttonON';
            button.addEventListener("click", () => {
                toggleFilter(id2[i]);
            });
        }

        const id3 = ['save', 'cancel'];
        for (let i = 0; i < id3.length; i++) {
            const button = document.getElementById(id3[i]);
            button.className = 'button buttonOFF';
            button.addEventListener("click", () => {
                exitEdit(id3[i]);
            });
        }

        const PFPbutton = document.getElementById('changePfp');
        PFPbutton.className = 'button buttonOFF';
        PFPbutton.addEventListener("click", () => {
            if (turnButtonOFF(PFPbutton)) {
                message.textContent= '';
            } else {
                turnButtonON(PFPbutton);
                message.textContent = 'select the character you want as the profile picture.'
            }
        });

        profileName.addEventListener("input", (event) => {
            profile.name = event.target.value;;
        });

        profileID = new URLSearchParams(window.location.search).get('profile');
        console.log(profileID);
        editProfile();
    }

    console.log('finished initialization');
};

initializePage();
