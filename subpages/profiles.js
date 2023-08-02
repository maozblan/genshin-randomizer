/* functions that simplify code */

function buttonOFF(item) {
    if (item.classList.contains('buttonON')) {
        item.classList.remove('buttonON');
        item.classList.add('buttonOFF');
    }
}

function buttonON(item) {
    if (item.classList.contains('buttonOFF')) {
        item.classList.remove('buttonOFF');
        item.classList.add('buttonON');
    }
}

function pfp(chara) {
    return '../images/pfp/' + chara + '.webp';
}

function createProfile(json) {
        const profiles = Object.keys(json);
        profiles.forEach(item => {
            let div = document.createElement('div');
            div.id = item;
            div.textContent = json[item].name;

            let pic = document.createElement('img');
            pic.src = pfp(json[item].pfp);

            div.appendChild(pic);
            content.appendChild(div);

            div.addEventListener("click", () => {
                window.location.href = `editProfiles.html?profile=${encodeURIComponent(item)}`;
            });

            // for css
            div.className = 'profile button buttonOFF';
        });
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
                toggleCharacter(div);
            });

            // for css
            div.className = 'profile button buttonOFF';

            if (have.includes(item)) {
                div.classList.add('have');
            } else if (ban.includes(item)) {
                div.classList.add('ban');
            } else {
                div.classList.add('donthave');
            }
        });
}







// handling file i/o
function setupIO() {
    document.getElementById("import").addEventListener("change", function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const jsonData = event.target.result;
            console.log("imported json data: ", jsonData);
            updateProfileList(JSON.parse(jsonData));  // jsonData is string
            if (Object.keys(jsonData).length > 0) {
                message.textContent = '';
            }
        }
        
        reader.readAsText(file);
    });

    /*
    // Function to export the displayed JSON data as a file
    document.getElementById("exportButton").addEventListener("click", function() {
        const jsonData = JSON.stringify(writeExportJson());
        console.log(jsonData);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = "exported_data.json";
        a.click();
        
        // Clean up the URL and the element after the download
        URL.revokeObjectURL(url);
    });
    */
}


/* handling list of profiles in main profile page*/

let jsonData;
let profileList = {};
const message = document.getElementById('message');
const content = document.getElementById('content');

function toggleMode(mode) {
    let button = document.getElementById(mode);
    if (button.classList.contains('buttonOFF')) {
        buttonON(button);

        const otherButtons = document.querySelectorAll('#choices .button');
        otherButtons.forEach(item => {
            if (item !== button) {
                buttonOFF(item);
            }
        });
    } else {
        buttonOFF(button);
    }
}

function updateProfileList(json) {
    profileList = {...profileList, ...json};  // '...' includes original properties
    localStorage.setItem("profileList", JSON.stringify(profileList));
    createProfile(json);
}





/* content for editing profiles / editProfile.html */

const profilePic = document.getElementById('pfp');
const profileName = document.getElementById('name');
const profileCharacters = document.getElementById('characters');
let profileFilter = [];
let profile;  // get from local storage


function editProfile(name) {
    if (name !== null) {
        // set up characters
        profile = JSON.parse(localStorage.getItem('profileList'))[name];
        createCharacter(jsonData, profile.characters, profile.bans);
        document.getElementById('albedo').style.display = '';

        // set up info
        profilePic.src = pfp(profile.pfp);
    } else {
        // set up characters
        createCharacter(jsonData, [], []);

        // set up info
    }
}

function toggleFilter(filter) {
    let button = document.getElementById(filter);
    if (button.classList.contains('buttonOFF')) {
        buttonON(button);
        profileFilter.push(filter);
    } else {
        buttonOFF(button);
        profileFilter.splice(profileFilter.indexOf(filter), 1);
    }
}

function toggleCharacter(chara) {
    if (chara.classList.contains('donthave')) {
        chara.classList.remove('donthave');
        chara.classList.add('have');
        profile.characters.push(chara.id);

        // make sure you only have aether or lumine
        if (chara.id === 'aether') {
            while (!document.getElementById('lumine').classList.contains('donthave')) {
                toggleCharacter(document.getElementById('lumine'));
            }
        }
        if (chara.id === 'lumine') {
            while (!document.getElementById('aether').classList.contains('donthave')) {
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
        chara.classList.add('donthave');
        profile.bans.splice(profile.bans.indexOf(chara.id), 1);
    }
}

function exitEdit(cmd) {
    if (cmd === 'save') {

    }
    window.location.href = 'profiles.html';
}





function fetchLocalStorage() {
    profileList = localStorage.getItem("profileList");
    console.log('fetched local profiles: ', profileList);
    if (profileList === null) {
        message.textContent = 'you have no profiles! click new to create one or import a file';
        profileList = {};
    } else {
        profileList = JSON.parse(profileList);
        console.log(profileList);

        // output data into contetnt
        createProfile(profileList, content, 'profile button buttonOFF');
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

        let id = ['import', 'new', 'delete', 'export'];
        for (let i = 0; i < id.length; i++) {
            const button = document.getElementById(id[i]);
            button.className = 'button buttonOFF';
            button.addEventListener("click", () => {
                toggleMode(id[i]);
            });
        }

    // set up editing page
    } else if (document.body.dataset.page === 'profileEditing') {
        id = ['have', 'dontHave', 'ban', 'changePfp'];
        for (let i = 0; i < id.length; i++) {
            const button = document.getElementById(id[i]);
            button.className = 'button buttonOFF';
            button.addEventListener("click", () => {
                toggleFilter(id[i]);
            });
        }

        id = ['save', 'cancel'];
        for (let i = 0; i < id.length; i++) {
            const button = document.getElementById(id[i]);
            button.className = 'button buttonOFF';
            button.addEventListener("click", () => {
                exitEdit(id[i]);
            });
        }

        const profile = new URLSearchParams(window.location.search).get('profile');
        editProfile(profile);
    }

    console.log('finished initialization');
};

initializePage();
