// local storage usage //////////////////////////////////////////////////////////
/*

genshinRandomizer_profileList -> list of profile IDs (list of ints)
genshinRandomizer_profileCount -> next available profile ID (one int)
genshinRandomizer_<profileID> -> {
    "name" : name,
    "characters" : list of characters owned (list of strings),
    "bans" : list of characters banned (list of strings)
    // elements cooresponding to keys in dataChara.json
}

*/


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
let bossDataJSON = null;
let bosses;
// list of profiles in profile selector to help with profile swapping
let playerList;


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
    setupElementSettings();
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
        let element;
        if (typeof json[character].element === 'string' || json[character].element instanceof String) {
            element = json[character].element;
        } else {
            element = json[character].element.join(" ");
        }
        createCharacterButton(container,
            character,              // id
            json[character].name,   // name
            getPFP(character),
            // adding in elements and stars for randomization later
            `${element} ${json[character].star}star character`);
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

async function setupRandomizerDivs() {
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
        // update options whenever <select> is changed
        $(`#r-p${i}`).change(function() {
            // implement swap if profile has been previously selected
            let temp = [...playerList];
            temp[i-1] = "--";   // "clear" current profile
            let index = temp.indexOf($(this).val());
            if (index >= 0) {
                // set repeat to the old value of this dropdown
                $(`#r-p${index+1}`).val(playerList[i-1]);
                // i-1 = index of old value of this dropdown in playerList
                // index+1 = index of repeat value in playerList
            }
            updateProfileOptions();
            // so profiles don't clear when switching between tabs
            sessionStorage.setItem(`${lsTag}_profileChoices`, JSON.stringify(playerList));
        });
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
    // region buttons
    bossDataJSON = await fetchBossData();
    Object.keys(bossDataJSON).forEach(region => {
        $("#r-bRegions").append($("<button>", {
            text : region,
            id : region
        }).click(function() {
            $(this).toggleClass("selected");
        }));
    });
    // sourceless images display weird
    $("#pVisuals").hide();
    $("#bVisuals").hide();
    // boss slider buttons
    $("#b-prev").click(prevBoss);
    $("#b-next").click(nextBoss);
    // hide boss randomizer first
    $("#randomize-screen-bosses").hide();
}

function setupElementSettings() {
    // extra parts in character toggle doesn't bother :>
    ['anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo'].forEach(element => {
        // mandatory element
        $("#r-cMandElements").append($("<button>", {
            id : element,
            class : "element-button"
        }).append($("<img>", {
            src : getElementImg(element)
        })).click(function() {
            // check if this is the 5th have
            if (!$(this).hasClass("have") && !$(this).hasClass("ban")
                && $("#r-cMandElements .element-button.have").length == 4) {
                $("#r-cMandElements .element-button.have:first").toggleClass("have");
            }
            characterToggle($(this));
            // clear mono-element
            $("#r-cMonoElement .element-button.have").toggleClass("have");
        }));
        // mono element
        $("#r-cMonoElement").append($("<button>", {
            id : element,
            class : "element-button"
        }).append($("<img>", {
            src : getElementImg(element)
        })).click(function() {
            // clear other mono-element
            if ($(this).hasClass("have")) {
                $("#r-cMonoElement .element-button.have").toggleClass("have");
            } else {
                $("#r-cMonoElement .element-button.have").toggleClass("have");
                $(this).toggleClass("have");
            }
            // clear non-mono weapon selection
            $("#r-cMandElements .element-button.have").toggleClass("have");
            $("#r-cMandElements .element-button.ban").toggleClass("ban");
        }));
    });
    // hide extra settings
    $("#r-cSettingsBar-more:not(.hidden)").toggleClass("hidden");
}

// toggle more settings
$("#r-cMoreSettings").click(function() {
    if ($("#r-cSettingsBar-more").hasClass("hidden")) {
        $(this).html("less settings");
    } else {
        $(this).html("more settings");
    }
    $("#r-cSettingsBar-more").toggleClass("hidden");
});

async function setupEditLog() {
    const json = await fetchEditLog();
    let container = $("#edit-log");
    Object.keys(json).forEach(log => {
        for (let i = json[log].length-1; i >= 1; --i) {
            container.prepend(`<p>${json[log][i]}`);
        }
        container.prepend(`<h2>Version ${log} - ${json[log][0]}`);
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
                    text : "--",
                    class : "null-profile profile-option"
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
                        text : profile.name,
                        class : `${id} profile-option`
                    }));
                }
            });
        }
        // reset profiles in selectors if profiles are given
        let oldData = sessionStorage.getItem(`${lsTag}_profileChoices`);
        if (oldData != null) {
            oldData = JSON.parse(oldData);
            oldData.forEach((profile, index) => {
                $(`#r-p${index+1}`).val(profile);
            });
        }
        updateProfileOptions();
    }
});

// get list of playerIDs from dropdowns, save to global variable
function fetchProfileChoices() {
    playerList = [];
    for (let i = 1; i <= 4; ++i) {
        if ($(`#r-p${i}`).children("option:selected").val() != "null-profile") {
            playerList.push($(`#r-p${i}`).children("option:selected").val());
        }
    }
}

// update dropdown style and usability
function updateProfileOptions() {
    fetchProfileChoices();
    // show all profile choices
    $(".profile-option.hidden:not(.null-profile)").toggleClass("hidden");
    // hide profiles already selected for last player
    playerList.forEach(profileID => {
        $(`#r-p${playerList.length+1} .${profileID}.profile-option:not(.null-profile):not(.hidden)`).toggleClass("hidden");
    });
    // allow "--" choice in ONLY the last profile
    $(`.profile-option.null-profile:not(.hidden)`).toggleClass("hidden");
    $(`#r-p${playerList.length} .profile-option.null-profile.hidden`).toggleClass("hidden")
    $(`#r-p${playerList.length+1} .profile-option.null-profile.hidden`).toggleClass("hidden")
    for (let i = 1; i <= 4; ++i) {
        // enable all profiles
        if ($(`#r-p${i}Div`).hasClass("disabled")) {
            $(`#r-p${i}Div`).toggleClass("disabled");
        }
        $(`#r-p${i}`).attr("disabled", false);
    }
    // disable all excess selectors
    for (let i = playerList.length+2; i <= 4; ++i) {
        $(`#r-p${i}Div:not(.disabled)`).toggleClass("disabled");
        $(`#r-p${i}`).attr("disabled", true);
    }
}

// randomize characters
$("#r-characters").click(async function() {
    // get data
    if (characterDataJSON == null) {
        characterDataJSON = await fetchCharaterData();
    }
    // fetch player IDs to global variable
    fetchProfileChoices();
    if (playerList.length == 0) {
        updateMessage("randomize-screen", "select at least one player before randomizing.")
        return;
    }
    clearMessage("randomize-screen");
    // get players
    let pN; // player number, helper variable
    if (playerList.length == 4) {
        pN = [0, 1, 2, 3];
    } else if (playerList.length == 3) {
        pN = [0, 0, 1, 2];
    } else if (playerList.length == 2) {
        pN = [0, 0, 1, 1];
    } else {
        pN = [0, 0, 0, 0];
    }
    // list of playerIDs
    let p = [playerList[pN[0]], playerList[pN[1]], playerList[pN[2]], playerList[pN[3]]];
    // fetch limitations
    let mandE = [];
    let banE = [];
    // check mono first
    if ($("#r-cMonoElement .element-button.have").length == 0) {
        $("#r-cMandElements .element-button.have").each(function() {
            mandE.push($(this).attr("id"));
        });
        while (mandE.length < 4) {
            mandE.push("");
        }
        mandE = shuffle(mandE);
        // get bans
        $("#r-cMandElements .element-button.ban").each(function() {
            banE.push($(this).attr("id"));
        });
    } else {
        // fill up the element with the mono element
        for (let i = 0; i < 4; ++i) {
            mandE.push($("#r-cMonoElement .element-button.have").attr("id"));
        }
    }
    // jackpot

    // get characters
    let c = ["", "", "", ""];
    // go once to randomize the mandatory elements first
    for (let i = 0; i < 4; ++i) {
        if (mandE[i] != "") {
            let pool = getCharacterPool(p[i], be=banE, e=mandE[i]);
            if (pool.length == 0 || (pool.length == 1 && ['aether', 'lumine'].includes(pool[0]))) {
                updateMessage("randomize-screen", "please have a character of every element for every profile selected that is not traveler.\nif that is true, these settings may not be possible! :(");
                return;
            }
            [c[i]] = [...randomize(pool.filter(character => !c.includes(character)), 1)];
        }
    }
    // go a second time to fill in missing spots
    for (let i = 0; i < 4; ++i) {
        if (mandE[i] == "") {
            let pool = getCharacterPool(p[i], be=banE);
            [c[i]] = [...randomize(pool.filter(character => !c.includes(character)), 1)];
        }
    }
    displayRCharacters(c, p, mandE=mandE);
});

function displayRCharacters(characters, players, mandE="") {
    $("#pVisuals").show();
    console.log(characters, mandE);
    for (let i = 0; i < 4; ++i) {
        $(`#c${i+1}-cImg`).attr("src", getCard(characters[i]));
        $(`#c${i+1}-pName`).html(rProfiles[players[i]].name);
        $(`#c${i+1}-cName`).html(characterDataJSON[characters[i]].name.toUpperCase());
        // randomize element for traveler
        if (["aether", "lumine"].includes(characters[i])) {
            if (mandE[i] != "") {
                $(`#c${i+1}-element`).attr("src", getElementImg(mandE[i]));
            } else {
                $(`#c${i+1}-element`).attr("src", getElementImg(characterDataJSON[characters[i]].element[Math.floor(Math.random() * characterDataJSON[characters[i]].element.length)]));
            }
        } else {
            $(`#c${i+1}-element`).attr("src", getElementImg(characterDataJSON[characters[i]].element));
        }
    }
}

// toggling bans
$("#toggle-character-bans").click(function() {
    rBans = !rBans;
    if (rBans) {
        $(this).html("Bans ON");
    } else {
        $(this).html("Bans OFF");
    }
});

// randomize bosses
$("#r-bosses").click(function() {
    // get boss pool
    let pool = [];
    $("#r-bRegions .selected").each(function() {
        pool = [...pool, ...bossDataJSON[$(this).attr("id")]];
    });
    if (pool.length == 0) {
        updateMessage("randomize-screen", "please select the regions you want to randomize bosses from");
        return;
    }
    clearMessage("randomize-screen");
    // randomize bosses
    let count = $("#b-count").val();
    if (count == "") {
        count = 1;
    } else {
        count = parseInt(count, 10);
    }
    if (count > pool.length) {
        count = pool.length;
    }
    bosses = [];  // clear old data
    bosses = randomize(pool, count);
    // display bosses
    $("#b-imgs").empty();
    bosses.forEach(boss => {
        $("#b-imgs").append($("<img>", {
            id : boss.replaceAll(" ", "-"),
            src : getBossImg(boss)
        }));
    });
    $(`#${bosses[0].replaceAll(" ", "-")}`).toggleClass("current-boss");
    $("#bVisuals").show();
});

// helper functions for the boss slider
function prevBoss() {
    let cBoss = $("#b-imgs .current-boss").attr("id").replaceAll("-", " ");
    let index = bosses.indexOf(cBoss);
    if (index != 0) {
        $("#b-imgs .current-boss").toggleClass("current-boss");
        $(`#${bosses[index-1].replaceAll(" ", "-")}`).toggleClass("current-boss");
    }
}

function nextBoss() {
    let cBoss = $("#b-imgs .current-boss").attr("id").replaceAll("-", " ");
    let index = bosses.indexOf(cBoss);
    if (index != bosses.length-1) {
        $("#b-imgs .current-boss").toggleClass("current-boss");
        $(`#${bosses[index+1].replaceAll(" ", "-")}`).toggleClass("current-boss");
    }
}

// swapping between character and boss randomizer
$("#randomize-nb button").click(function() {
    // change only if it's not the currently selected tab
    if (!$(this).hasClass("selected")) {
        $("#randomize-nb .selected").toggleClass("selected");
        $(this).toggleClass("selected");
        $(`#randomize-screen .subscreen`).hide();
        $(`#randomize-screen-${$(this).data("screen")}`).show();
        // clear extraneous messages
        clearMessage("randomize-screen");
    }
});


// helper functions ////////////////////////////////////////////////////////////
function getPFP(name) {
    return `images/pfp/${name}.webp`;
}

function getCard(name) {
    return `images/character/${name}.webp`;
}

function getElementImg(element) {
    return `images/elements/${element}.svg`;
}

function getWeaponImg(weapon) {
    return `images/weapons/${weapon}.webp`;
}

function getBossImg(boss) {
    return `images/bosses/${boss.replaceAll(" ", "_")}.webp`;
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

function randomize(pool, count, filler="aether") {
    let selected = [];
    while (selected.length < count) {
        let choice = Math.floor(Math.random() * pool.length);
        if (!selected.includes(pool[choice])) {
            selected.push(pool[choice]);
        }
        // if nothing is in the pool
        if (pool.length == 0) {
            selected.push[filler];
        }
    }
    return selected;
}

// playerID, banned element(s), mandatory element
function getCharacterPool(playerID, be=[], e="") {
    updateCharacterOwnership(rProfiles[playerID]);
    let selectors = "";
    be = be.filter(i => i != "");
    if (e.length != 0) {
        selectors += `.${e}`;
    }
    console.log(be);
    for (let i = 0; i < be.length; ++i) {
        selectors += `:not(.${be[i]})`;
    }
    let pool = [];
    console.log($(`.character-container .character.have${selectors}`), `.character-container .character.have${selectors}`);
    $(`.character-container .character.have${selectors}`).each(function() {
        pool.push($(this).attr("id"));
    });
    // if bans lifted add in bans
    if (!rBans) {
        $(`.character-container .character.ban${selectors}`).each(function() {
            pool.push($(this).attr("id"));
        });
    }
    return pool;
}

function updateMessage(containerID, message) {
    $(`#${containerID} .message`).html(message);
}

function clearMessage(containerID) {
    $(`#${containerID} .message`).html('');
}

function shuffle(array) {
    for (let i = 0; i < array.length; ++i) {
        let rand = Math.floor(Math.random() * (array.length - i) + i);
        [array[i], array[rand]] = [array[rand], array[i]];
    }
    return array;
}
