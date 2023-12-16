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

// profile page ////////////////////////////////////////////////////////////////
async function setupProfilePage() {
    const json = await fetchCharaterData();
    console.log(json);
    let container = $(".character-container");
    Object.keys(json).forEach(character => {
        createCharacterButtons(container, json[character].name, getPFP(character));
    });
}
setupProfilePage();

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
function createCharacterButtons(source, name, pfp) {
    let div = $("<div>", {
        text : name,
        class : "profile col-div button"
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
