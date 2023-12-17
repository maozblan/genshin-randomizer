// some global variables ////////////////////////////////////////////////////////
// tag for local storage so things don't overwrite eachother
const lsTag = "genshinRandomizer";
// list of profiles saved (string version)
let profileList = localStorage.getItem(`${lsTag}_profileList`);

// initialize page /////////////////////////////////////////////////////////////
$(document).ready(function() {
    $("#nav-bar").hide();
    
    // page swapping
    $(".nb-button").click(function() {
        console.log("screen swap");
        let screen = $(this).data("screen");
        if (!$(`#${screen}-screen`).hasClass("current-screen")) {
            console.log("swapping screen");
            $(".current-screen").toggleClass("current-screen");
            $(`#${screen}-screen`).toggleClass("current-screen");
            if (screen != "home") {
                $("#nav-bar").show();
            } else {
                $("#nav-bar").hide();
            }
        }
    });

    // hide the loading page
    setTimeout(() => {
        $("#loading-page").fadeOut(250);
    }, 150);
});

// fetching data ///////////////////////////////////////////////////////////////
async function fetchCharaterData() {
    const res = await fetch("js/data/dataChara.json");
    const json = await res.json();
    return json;
}

async function fetchBossData() {
    const res = await fetch("js/data/dataBoss.json");
    const json = await res.json();
    return json;
}

// profile page ////////////////////////////////////////////////////////////////
// for main profiles page
function setupProfiles() {
    if (profileList == null || profileList.length == 1) {
        updateMessage("profile", "you have no profiles! use new to create a new one or import one from a file.");
    } else {
        profileList = JSON.parse(profileList);
        let container = $(".character-container");
        profileList.forEach(profile => {
            const json = JSON.parse(localStorage.getItem(`${lsTag}_${profile}`));
            createCharacterButtons(container,
                profile,
                json.name,
                getPFP(json.pfp));
        });
    }
}
setupProfiles();

// for editing page
async function setupCharacterButtons(profile) {
    const json = await fetchCharaterData();
    console.log(json);
    let container = $(".character-container");
    Object.keys(json).forEach(character => {
        createCharacterButtons(container,
            json[character].name,   // id
            json[character].name,   // name
            getPFP(character),
            element=json[character].element,
            ownership=profile[character]);
    });
}
// setupCharacterButtons();

// helper functions ////////////////////////////////////////////////////////////
function getPFP(name) {
    return '../images/pfp/' + name + '.webp';
}

function makeID() {
    profileCount = JSON.parse(localStorage.getItem("genshinRandomizer_profileCount"));
    profileID = profileCount.toString();
    profileCount++;
    localStorage.setItem("genshinRandomizer_profileCount", JSON.stringify(profileCount));
}

// create character buttons
function createCharacterButtons(source, id, name, pfp, element="", weapon="", ownership="") {
    let div = $("<div>", {
        text : name,
        id : id,
        class : `profile col-div button ${element} ${weapon} ${ownership}`
    });
    let pic = $(`<img>`, {
        src : pfp
    });
    div.append(pic);
    source.append(div);
    /*
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
    */
}

function updateMessage(screen, message) {
    $(`#${screen}-screen-msg`).html(message);
}

function clearMessage(screen) {
    $(`#${screen}-screen-msg`).html('');
}
