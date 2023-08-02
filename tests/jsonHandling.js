let pData = {"profiles": []};
let jData;  // parsed json data
let selectedProfiles = [];

function initiatePage() {
    // Function to read the uploaded JSON file
    document.getElementById("fileInput").addEventListener("change", function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
        const jsonData = event.target.result;
        jData = JSON.parse(jsonData);  // jsonData is string
        saveJsonData();
        }
        
        reader.readAsText(file);
    });

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
}

function saveJsonData() {
    const profileList = document.getElementById('profileList');
    for (let i = 0; i < jData.profiles.length; i++) {
        if (!(jData.profiles[i] in pData)) {
            pData[jData.profiles[i]] = jData[jData.profiles[i]];
            pData["profiles"].push(jData.profiles[i]);

            let button = document.createElement('button');
            button.id = button.textContent = jData.profiles[i];
            button.addEventListener("click", () => {
                displayJsonData(button.id);
                toggleSelect(button.id);
            });
            profileList.appendChild(button);
        }
    }
    console.log(pData);
}

function displayJsonData(name) {
    const jsonDataElement = document.getElementById("jsonData");
    let text = '';
    text += "Name : " + name;
    text += "\nPFP : " + pData[name].pfp;
    text += "\nCharacters Owned : " + pData[name].characters.join(', ');
    text += "\nCharacters Banned : " + pData[name].bans.join(', ');
    jsonDataElement.textContent = text;
}

function toggleSelect(name) {
    if (selectedProfiles.includes(name)) {
        selectedProfiles.splice(selectedProfiles.indexOf(name), 1);
    } else {
        selectedProfiles.push(name);
    }
    document.getElementById('selectedProfiles').textContent = selectedProfiles.join(', ');
}

function writeExportJson() {
    let exportJson = {"profiles" : []};
    for (let i = 0; i < selectedProfiles.length; i++) {
        exportJson["profiles"].push(selectedProfiles[i]);
        exportJson[selectedProfiles[i]] = pData[selectedProfiles[i]];
    }
    return exportJson;
}

initiatePage();