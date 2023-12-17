// some global variables ////////////////////////////////////////////////////////
// tag for local storage so things don't overwrite eachother
const lsTag = "genshinRandomizer";
// list of profiles saved in ids (string version)
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
    // hide buttons
    $("#profile-save").hide();
    $("#profile-cancel").hide();
    // set up profile screen
    setupCharacterButtons();
    setupProfiles();
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

// setup functions /////////////////////////////////////////////////////////////
function setupProfiles() {
    if (profileList == null || profileList.length == 1) {
        updateMessage("profile", "you have no profiles! use new to create a new one or import one from a file.");
    } else {
        profileList = JSON.parse(profileList);
        let container = $(".character-container");
        profileList.forEach(profile => {
            const json = JSON.parse(localStorage.getItem(`${lsTag}_${profile}`));
            createCharacterButton(container, profile, json.name, getPFP(json.pfp), "profile").click(function() {
                profileEditMode(profile);
                console.log("click");
            });
        });
    }
}
async function setupCharacterButtons() {
    const json = await fetchCharaterData();
    console.log(json);
    let container = $(".character-container");
    Object.keys(json).forEach(character => {
        createCharacterButton(container,
            json[character].name,   // id
            json[character].name,   // name
            getPFP(character),
            `${json[character].element} ${json[character].star}star character`);
    });
    $(".character").hide();
}

// profile page ////////////////////////////////////////////////////////////////
// profile page buttons
$("#import").click(function() {
    console.log("click");
    $("#import-helper").click();
});
$("#import-helper").on("change", function(event) {  // handls json import files
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        let json = event.target.result;
        try {
            json = JSON.parse(json);
            if (Object.keys(json).length > 0) {
                clearMessage("profile");
                // write in new profile
                Object.keys(json).forEach(profile => {
                    const id = makeID();
                    console.log(profile, json[profile], id);
                    localStorage.setItem(`${lsTag}_${id}`, JSON.stringify(json[profile]));
                    profileList.push(id);
                    localStorage.setItem(`${lsTag}_profileList`, JSON.stringify(profileList));
                    createCharacterButton($(".character-container"), id, json[profile].name, getPFP(json[profile].pfp), "profile");
                });
            } else {
                updateMessage("profile", "oh no! no profiles found in file :(");
            }
        } catch (error) {
            updateMessage("profile", "oh no! invalid import file :(");
            console.error(`caught error: ${error}`);
        }
    }
    reader.readAsText(file);
});
$("#new").click(function() {
    console.log("click");
    $("#profile-screen").data("mode", "new");
});
$("#delete").click(function() {
    console.log("click");
    // set up
    $("#profile-save").show();
    $("#profile-cancel").show();
    updateMessage("profile", "select profiles to delete");
    $("#profile-screen").data("mode", "delete");
});
$("#export").click(function() {
    console.log("click");
    // set up
    $("#profile-save").show();
    $("#profile-cancel").show();
    updateMessage("profile", "select profiles to delete");
    $("#profile-screen").data("mode", "export");
});
$("#profile-save").click(function() {
    clearMessage("profile");
    $(this).hide();
    $("#profile-cancel").hide();
    if ($("#profile-screen").data("mode") == "delete") {
        console.log("delete");
    }
    if ($("#profile-screen").data("mode") == "export") {
        console.log("export");
    }
});
$("#profile-cancel").click(function() {
    clearMessage("profile");
    $(this).hide();
    $("#profile-save").hide();
});
// editing page
function profileEditMode(profile) {
    updateCharacterOwnership(profile);
}
function updateCharacterOwnership(profile) {
    console.log(profile)
}

// helper functions ////////////////////////////////////////////////////////////
function getPFP(name) {
    return `../images/pfp/${name}.webp`;
}
function makeID() {
    let profileCount = JSON.parse(localStorage.getItem(`${lsTag}_profileCount`));
    localStorage.setItem(`${lsTag}_profileCount`, JSON.stringify(++profileCount));
    let profileID = profileCount.toString();
    return profileID;
}
// create character buttons
function createCharacterButton(source, id, name, pfp, classes="") {
    let div = $("<div>", {
        text : name,
        id : id,
        class : `card col-div button ${classes}`
    });
    let pic = $(`<img>`, {
        src : pfp
    });
    div.append(pic);
    source.append(div);
   return div;
}
function updateMessage(screen, message) {
    console.log("update message");
    $(`#${screen}-screen-msg`).html(message);
}
function clearMessage(screen) {
    $(`#${screen}-screen-msg`).html('');
}
