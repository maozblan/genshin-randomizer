// some global variables ////////////////////////////////////////////////////////
// tag for local storage so things don't overwrite eachother
const lsTag = "genshinRandomizer";
// list of profiles saved in ids (string version)
let profileList = localStorage.getItem(`${lsTag}_profileList`);
// profileID of profile currently being edited
let currentProfile;
// json of all randomizing profiles
let rProfiles = {};
// boolean on if ban are on or off
let rBans = true;
// so we don't have to fetch it every time for randomization
let characterDataJSON = null;


// initialize page /////////////////////////////////////////////////////////////
$(document).ready(function() {
    $("#nav-bar").hide();
    // page swapping
    $(".nb-button").click(function() {
        // console.log("screen swap");
        let screen = $(this).data("screen");
        if (!$(`#${screen}-screen`).hasClass("current-screen")) {
            // console.log("swapping screen");
            $(".current-screen").toggleClass("current-screen");
            $(`#${screen}-screen`).toggleClass("current-screen");
            if (screen != "home") {
                $("#nav-bar").show();
            } else {
                $("#nav-bar").hide();
            }
        }
    });
    // set up clear all button
    $("#clear-all-profiles").click(function() {
        profileList.forEach(profile => {
            localStorage.removeItem(`${lsTag}_${profile}`);
        });
        profileList = [];
        profileCount = 0;
        localStorage.setItem(`${lsTag}_profileList`, JSON.stringify(profileList));
        localStorage.setItem(`${lsTag}_profileCount`, JSON.stringify(profileCount));
        $(".character-container .profile").remove();
    });
    // hide buttons
    $("#profile-save").hide();
    $("#profile-cancel").hide();
    // set up profile screen
    setupCharacterButtons();
    setupProfiles();
    // set up randomzier screen
    setupRandomizerDivs();
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

async function fetchEditLog() {
    const res = await fetch("js/data/editLog.json");
    const json = await res.json();
    return json;
}

// setup functions /////////////////////////////////////////////////////////////
function setupProfiles() {
    if (profileList == null || profileList == "[]" || profileList.length == 0) {
        updateMessage("profile-screen", "you have no profiles! use new to create a new one or import one from a file.");
        profileList = [];
    } else {
        if (typeof profileList === 'string' || profileList instanceof String) {
            profileList = JSON.parse(profileList);
        }
        profileList.forEach(id => {
            const profile = JSON.parse(localStorage.getItem(`${lsTag}_${id}`));
            makeProfileButton(profile, id);
        });
    }
    $("#editing-profiles").hide();
}

async function setupCharacterButtons() {
    const json = await fetchCharaterData();
    let container = $(".character-container");
    Object.keys(json).forEach(character => {
        createCharacterButton(container,
            character,              // id
            json[character].name,   // name
            getPFP(character),
            `${json[character].element} ${json[character].star}star character`);
    });
    $(".character-container .character").hide()
        .click(function() {
            if ($("#profile-screen").data("mode") == "updating-pfp") {
                $("#profile-pfp").attr({
                    src : getPFP($(this).attr("id")),
                    alt : $(this).attr("id")
                });
            } else {
                characterToggle($(this));
            }
        });
}

function setupRandomizerDivs() {
    /* player dropdowns 
    <div id="r-p#Div" class="row-div">
        <label for="r-p#">P# :</label>
        <select id="r-p#"></select>
    </div>
    */

    /* player visuals
    <div id="c#-cDiv">
        <div id="c#-dataDiv" class="cDataDiv col-div">
            <img id="c#-element" />
            <p id="c#-pName"></p>
            <p id="c#-cName" class="cDataDiv-characterName"></p>
        </div>
        <img id="c#-cImg" />
    </div>
    */

    for (let i = 1; i <= 4; ++i) {
        // dropdown
        $("#randomize-profiles").append(
            $(`<div id="r-p${i}Div" class="row-div">`)
                .append(`<label for="r-p${i}">P${i} :`)
                .append(`<select id="r-p${i}">`)
        );
        // visuals
        let dataDiv = $(`<div id="c${i}-dataDiv" class="cDataDiv col-div">`)
            .append(`<img id="c${i}-element">`)
            .append(`<p id="c${i}-pName">`)
            .append(`<p id="c${i}-cName" class="cDataDiv-characterName">`);
        $("#pVisuals").append(
            $(`<div id="c${i}-cDiv">`)
                .append(dataDiv)
                .append($(`<img id="c${i}-cImg">`))
        );
    }

    $("#pVisuals").hide();
}

async function setupEditLog() {
    const json = await fetchEditLog();
    let container = $("#edit-log");
    Object.keys(json).forEach(log => {
        container.prepend(`<p>${json[log][1]}`);
        container.prepend(`<p>Version ${log} - ${json[log][0]}`);
    });
}
setupEditLog();


// profile page ////////////////////////////////////////////////////////////////

/* profile modes (in profile-screen data-mode):
 * export, delete -> allow select profiles, pause enter edit mode
 * updating-pfp -> pause character toggle
**/

// profile page buttons
$("#import").click(function() {
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
                clearMessage("profile-screen");
                // write in new profile
                Object.keys(json).forEach(profileNum => {
                    const id = makeID();
                    profileList.push(id);
                    makeProfileButton(json[profileNum], id);
                    localStorage.setItem(`${lsTag}_${id}`, JSON.stringify(json[profileNum]));
                });
                localStorage.setItem(`${lsTag}_profileList`, JSON.stringify(profileList));
            } else {
                updateMessage("profile-screen", "oh no! no profiles found in file :(");
            }
        } catch (error) {
            updateMessage("profile-screen", "oh no! invalid import file :(");
            console.error(`caught error: ${error}`);
        }
    }
    reader.readAsText(file);
});

$("#new").click(function() {
    currentProfile = null;
    profileEditMode("new");
});

['delete', 'export'].forEach(mode => {
    $(`#${mode}`).click(function() {
        $("#profile-save").show();
        $("#profile-cancel").show();
        updateMessage("profile-screen", `select profiles to ${mode}`);
        $("#profile-screen").data("mode", mode);
    });
});

$("#profile-save").click(function() {
    clearMessage("profile-screen");
    $(this).hide();
    $("#profile-cancel").hide();
    // deleting profiles from local storage
    if ($("#profile-screen").data("mode") == "delete") {
        $(".profile.selected").each(function() {
            // profileList is parsed in setUpProfiles()
            profileList.splice(profileList.indexOf($(this).attr("id")), 1);
            localStorage.removeItem(`${lsTag}_${$(this).attr("id")}`);
            $(this).remove();
        });
        localStorage.setItem(`${lsTag}_profileList`, JSON.stringify(profileList));
    }
    // exporting json
    if ($("#profile-screen").data("mode") == "export") {
        let exportJSON = {};
        let profiles = [];
        $(".profile.selected").each(function() {
            exportJSON[$(this).attr("id")] = JSON.parse(localStorage.getItem(`${lsTag}_${$(this).attr("id")}`));
            profiles.push($(this).text());
        });
        profiles = profiles.join('-');
        if (exportJSON != {}) {
            const jsonData = JSON.stringify(exportJSON);
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            a.download = `GRP_${profiles}.json`;
            a.click();
            // Clean up the URL and the element after the download
            URL.revokeObjectURL(url);
        } else {
            updateMessage("profile-screen", "nothing selected to export...");
        }
    }
    // unselect selected profiles
    $(".selected.profile").toggleClass("selected");
    // clear profile mode
    $("#profile-screen").data("mode", "");
});

$("#profile-cancel").click(function() {
    clearMessage("profile-screen");
    $(this).hide();
    $("#profile-save").hide();
    // unselect selected profiles
    $(".selected.profile").toggleClass("selected");
    $("#profile-screen").data("mode", "");
});

// editing page
function profileEditMode(profileID) {
    let p;
    if (profileID == "new") {
        p = {
            name : "new profile",
            pfp : "aether",
            characters : ["aether", "amber", "kaeya", "lisa", "noelle", "barbara"],
            bans : []
        };
    } else {
        currentProfile = profileID;  // for saving profile later
        p = JSON.parse(localStorage.getItem(`${lsTag}_${profileID}`));
    }
    updateCharacterOwnership(p);
    // update character container
    $(".profile").hide();
    $(".character").show();
    // update upper page data
    $("#profile-pfp").attr({
        src : getPFP(p.pfp),
        alt : p.pfp  // for changing pfp later
    });
    $("#profile-name").attr("placeholder", p.name);
    // change upper page
    $("#all-profiles").hide();
    $("#editing-profiles").show();
}

// updates classes for characters for css styling
function updateCharacterOwnership(profileJSON) {
    // change all to default
    $(".character-container .character.have").toggleClass("have");
    $(".character-container .character.ban").toggleClass("ban");
    // update classes
    profileJSON.characters.forEach(character => {
        $(`#${character}`).toggleClass("have");
    });
    profileJSON.bans.forEach(character => {
        $(`#${character}`).toggleClass("ban");
    });
}

// button functionality 
$("#edit-profile-save").click(function(){
    let newProfile = {};
    newProfile["name"] = $("#profile-name").val();
    if (newProfile.name == "") {
        newProfile.name = $("#profile-name").attr("placeholder");
    }
    newProfile["pfp"] = $("#profile-pfp").attr("alt");
    newProfile["characters"] = [];
    $(".character-container .have").each(function() {
        newProfile.characters.push($(this).attr("id"));
    });
    newProfile["bans"] = [];
    $(".character-container .ban").each(function() {
        newProfile.bans.push($(this).attr("id"));
    });
    if (currentProfile == null) {        // new profile
        currentProfile = makeID();
        makeProfileButton(newProfile, currentProfile);
        profileList.push(currentProfile);
        localStorage.setItem(`${lsTag}_profileList`, JSON.stringify(profileList));
    }
    console.log(newProfile);
    localStorage.setItem(`${lsTag}_${currentProfile}`, JSON.stringify(newProfile));
    $("#edit-profile-cancel").click();  // using the cancel function to swap the screen back
    console.log(profileList);
});

$("#edit-profile-cancel").click(function(){
    // change back to main profiles page
    $("#all-profiles").show();
    $("#editing-profiles").hide();
    $(".profile").show();
    $(".character").hide();
    // in case of extraneous things
    clearMessage("profile-screen");
    $("#profile-screen").data("mode", "");
});

$("#edit-profile-change-pfp").click(function(){
    if($("#profile-screen").data("mode") == "updating-pfp") {
        $("#profile-screen").data("mode", "");
        clearMessage("profile-screen");
        $("#edit-profile-change-pfp").text("change pfp");
    } else {
        $("#profile-screen").data("mode", "updating-pfp");
        updateMessage("profile-screen", "select a character from below as the new profile picture, then click \"save pfp\"");
        $("#edit-profile-change-pfp").text("save pfp");
    }
});

function characterToggle(characterElement) {
    // make sure only lumine or aether is selected
    if (characterElement.attr("id") == "aether") {
        ["have", "ban"].forEach(c => {
            if ($("#lumine").hasClass(c)){
                $("#lumine").toggleClass(c);
            }
        });
    } else if (characterElement.attr("id") == "lumine") {
        ["have", "ban"].forEach(c => {
            if ($("#aether").hasClass(c)){
                $("#aether").toggleClass(c);
            }
        });
    }
    // normal toggle
    if (characterElement.hasClass('have')) {
        // have >> ban
        characterElement.toggleClass("have");
        characterElement.toggleClass("ban");
    } else if (characterElement.hasClass('ban')) {
        // ban >> don't have
        characterElement.toggleClass("ban");
        // skip from ban to have for lumine and aether
        if (["lumine", "aether"].includes(characterElement.attr("id"))) {
            characterToggle(characterElement);
        }
    } else {
        // don't have >> have
        characterElement.toggleClass("have");
    }
}


// randomizer page /////////////////////////////////////////////////////////////


// update dropdown choices every time user switches to randomizer page
$(".nb-button").click(function() {
    if ($(this).data("screen") == "randomize") {
        // set up null option
        for (let i = 1; i <= 4; ++i) {
            $(`#r-p${i}`).empty()   // clear old options
                .append($("<option>", {
                    value : "null-profile",
                    text : "--"
                }));
        }
        if (profileList == null || profileList == "[]" || profileList.length == 0) {
            updateMessage("randomize-screen", "you have no profiles! go to \"PROFILES\" to make one first.");
            profileList = [];
        } else {
            clearMessage("randomize-screen-characters");
            if (typeof profileList === 'string' || profileList instanceof String) {
                profileList = JSON.parse(profileList);
            }
            // set up dropdown options
            profileList.forEach(id => {
                let profile = JSON.parse(localStorage.getItem(`${lsTag}_${id}`));
                rProfiles[id] = profile;
                for (let i = 1; i <= 4; ++i) {
                    $(`#r-p${i}`).append($("<option>", {
                        value : id,
                        text : profile.name
                    }));
                }
            });
        }

    }
});

// randomize characters
$("#r-characters").click(function() {
    // fetch player IDs
    let players = [];
    for (let i = 1; i <= 4; ++i) {
        if ($(`#r-p${i}`).children("option:selected").val() != "null-profile") {
            players.push($(`#r-p${i}`).children("option:selected").val());
        }
    }
    if (players.length == 0) {
        updateMessage("randomize-screen", "select at least one player before randomizing.")
        return;
    }
    clearMessage("randomize-screen");
    // randomize and display players
    let c; // characters
    let p; // players
    if (players.length == 4) {
        p = [players[0], players[1], players[2], players[3]]
        // player 1
        c = randomize(getCharacterPool(players[0]), 1);
        // player 2-4
        for (let i = 1; i < 4; ++i) {
            let t = randomize(getCharacterPool(players[i]).filter(character => !c.includes(character)), 1);
            c = [...c, ...t];
        }
    } else if (players.length == 3) {
        p = [players[0], players[0], players[1], players[2]]
        // player 1
        c = randomize(getCharacterPool(players[0]), 2);
        // player 2 & 3
        for (let i = 1; i < 3; ++i) {
            let t = randomize(getCharacterPool(players[i]).filter(character => !c.includes(character)), 1);
            c = [...c, ...t];
        }
    } else if (players.length == 2) {
        p = [players[0], players[0], players[1], players[1]]
        // player 1
        c = randomize(getCharacterPool(players[0]), 2);
        // player 2
        let t = randomize(getCharacterPool(players[1]).filter(character => !c.includes(character)), 2);
        c = [...c, ...t];
    } else {
        p = [players[0], players[0], players[0], players[0]]
        // player 1
        c = randomize(getCharacterPool(players[0]), 4);
    }
    displayRCharacters(c, p);   // need the async
});

async function displayRCharacters(characters, players) {
    $("#pVisuals").show();
    if (characterDataJSON == null) {
        characterDataJSON = await fetchCharaterData();
    }
    for (let i = 0; i < 4; ++i) {
        $(`#c${i+1}-cImg`).attr("src", getCard(characters[i]));
        $(`#c${i+1}-pName`).html(rProfiles[players[i]].name);
        $(`#c${i+1}-cName`).html(characterDataJSON[characters[i]].name.toUpperCase());
        // randomize element for traveler
        if (["aether", "lumine"].includes(characters[i])) {
            $(`#c${i+1}-element`).attr("src", getElementImg(characterDataJSON[characters[i]].element[Math.floor(Math.random() * characterDataJSON[characters[i]].element.length)]));
        } else {
            $(`#c${i+1}-element`).attr("src", getElementImg(characterDataJSON[characters[i]].element));
        }
    }
}

// randomize bosses
$("#r-bosses").click(function() {
});

// toggling bans
$("#toggle-character-bans").click(function() {
    rBans = !rBans;
    if (rBans) {
        $(this).html("Bans ON");
    } else {
        $(this).html("Bans OFF");
    }
});

$("#randomize-nb button").click(function() {
    console.log($(this).data("screen"));
    // change only if it's not the currently selected tab
    if (!$(this).hasClass("selected")) {
        $("#randomize-nb .selected").toggleClass("selected");
        $(this).toggleClass("selected");
    }
});


// helper functions ////////////////////////////////////////////////////////////
function getPFP(name) {
    return `../images/pfp/${name}.webp`;
}

function getCard(name) {
    return `../images/character/${name}.webp`;
}

function getElementImg(element) {
    return `../images/elements/${element}.svg`;
}

function makeID() {
    let profileCount = JSON.parse(localStorage.getItem(`${lsTag}_profileCount`));
    // hopefully no one makes enough profiles for integer overflow
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

// DOES NOT save new profile to local storage OR update profileList
function makeProfileButton(profile, id) {
    createCharacterButton($(".character-container"), id, profile.name, getPFP(profile.pfp), "profile")
        .click(function() {
            if (["delete", "export"].includes($("#profile-screen").data("mode"))) {
                $(this).toggleClass("selected");
            } else {
                profileEditMode(id);
            }
        });
}

function randomize(pool, count) {
    let selected = [];
    while (selected.length < count) {
        let choice = Math.floor(Math.random() * pool.length);
        if (!selected.includes(pool[choice])) {
            selected.push(pool[choice]);
        }
        // if nothing is in the pool
        if (pool.length == 0) {
            selected.push['aether'];
        }
    }
    return selected;
}

function getCharacterPool(playerID) {
    let pool = rProfiles[playerID].characters;
    if (!rBans) {
        pool = [...pool, ...rProfiles[playerID].bans];
    }
    return pool;
}

function updateMessage(containerID, message) {
    $(`#${containerID} .message`).html(message);
}

function clearMessage(containerID) {
    $(`#${containerID} .message`).html('');
}
