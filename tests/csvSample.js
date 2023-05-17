let jsonData;

let msg = document.getElementById("msg");
let content = document.getElementById("data");
let visuals = document.getElementById("profile");


function pullProfiles() {
	if (content.firstChild) {
		content.removeChild(content.firstChild);
	}

	if (!localStorage.getItem("profiles")) {
		msg.textContent = "You currently have no profiles, click ADD to make one";
		return
	}
	
	let profileList = document.createElement("div");
    let profileData = JSON.parse(localStorage.getItem("profiles"));

    profileData.profiles.forEach(profile => {
        //view main profiles page
        //making it into a button that you can click
            //clicking the button will trigger function JSONtoCSV(profile)
		let data = profileData[profile];
		console.log("data: ", data);
		
		let button = document.createElement('div');
		let pfp = document.createElement('img');
		let name = document.createElement('p');

		pfp.src = '../images/pfp/' + data.pfp + '.webp';
		pfp.width = 200;
		pfp.height = 200;

		name.textContent = data.name;

		button.appendChild(pfp);
		button.appendChild(name);
		
		profileList.appendChild(button);

		button.addEventListener("click", () => {
			JSONtoCSV(data);
			visualizeProfile(data);
		});
    });

	content.appendChild(profileList);
}


function JSONtoCSV(profile) {
	/* this pulls the profile info stored in json and converts to csv style
	precondition:
		json includes info with name as key
	postcondition:
		exports CSV with selected JSON data + key
	*/

	if (content.firstChild) {
		content.removeChild(content.firstChild);
	}

	let profileInfo = "name,pfp,characters,bans" + '\r\n';
	
	extractedData = profile.name; // this should be a string

	extractedData += "," + profile.pfp;	// pfp is stored as a string

	let characters = [];
	let bans = [];

	profile.characters.forEach(item => {
		characters.push(item);
	});

	profile.bans.forEach(item => {
		bans.push(item);
	});

	characters = '"' + characters.join(",") + '"';	// surround with "" to group in CSV
	bans = '"' + bans.join(",") + '"';

	extractedData += "," + characters + "," + bans;

	profileInfo += extractedData;
	console.log(profileInfo);

	// exportCSV(profileInfo);
	let text = document.createElement('p');
	text.textContent = profileInfo;
	content.appendChild(text);
}


function visualizeProfile(profile) {

	/* all things appended to viauals
	* div - main data -> name and pfp
	* div - character data -> characters owned, characters banned
	*/

	let mainData = document.createElement('div');
	let profileName = document.createElement('p');
	let profilePfp = document.createElement('img');
	mainData.appendChild(profileName);
	mainData.appendChild(profilePfp);

	let characterData = document.createElement('div');
	let charactersOwned = document.createElement('div');
	let charactersBanned = document.createElement('div');
	charactersOwned.className = 'characterData';
	characterData.className = 'characterData';
	characterData.appendChild(charactersOwned);
	characterData.appendChild(charactersBanned);

	visuals.appendChild(mainData);
	visuals.appendChild(characterData);

	profileName.textContent = profile.name;
	profilePfp.src = '../images/pfp/' + profile.pfp + '.webp';
	profilePfp.width = 200;
	profilePfp.height = 200;

	profile.characters.forEach(item => {
            let chara = document.createElement('div');
            let pfp = document.createElement('img');
            pfp.src = '../images/pfp/' + item + '.webp';
            pfp.width = 200;
            pfp.height = 200;
            let name = document.createElement('p');
            name.textContent = item;

            chara.appendChild(pfp);
            chara.appendChild(name);

            charactersOwned.appendChild(chara);
	});

	profile.bans.forEach(item => {
            let chara = document.createElement('div');
            let pfp = document.createElement('img');
            pfp.src = '../images/pfp/' + item + '.webp';
            pfp.width = 200;
            pfp.height = 200;
            let name = document.createElement('p');
            name.textContent = item;

            chara.appendChild(pfp);
            chara.appendChild(name);

            charactersBanned.appendChild(chara);
	});

}





async function initializePage() {
    const response = await fetch("./csvSample.json");
    jsonData = await response.json();
}

initializePage();	// pull json data

let LSbutton = document.getElementById("clear");
LSbutton.addEventListener("click", () => { 
	localStorage.clear();
	pullProfiles();
});

let retButton = document.getElementById("ret");
retButton.addEventListener("click", pullProfiles);

let getButton = document.getElementById("get");
getButton.addEventListener("click", () => {
	console.log(jsonData);
	localStorage.setItem("profiles", JSON.stringify(jsonData));
	pullProfiles();
});

pullProfiles();		// this sets up the page
