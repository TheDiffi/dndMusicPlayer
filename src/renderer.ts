import { ipcRenderer } from "electron";
import { IpcRendererEvent } from "electron/renderer";
import { IpcR, IpcS, Profile, Song } from "./util/types.util";
import { appendAmbiencePlayerPopup, appendMusicPlayer, extractYtIdFromLink, playMusic, YTPlayer } from "./util/yt.util";

// This file is required by the index.html file and will
export { ipcRenderer };

//globals
const ytPlayersAmb: YTPlayer[] = new Array();
let ytPlayerMusic: YTPlayer;
let currentProfile: Profile;

const docIds = {
	containerMusicBtns: "music-button-container",
	containerAmbienceBtns: "ambience-button-container",
};

// be executed in the renderer process for that window.
console.log("Main Renderer: started");



//___________________BOOTUP_____________________

function bootup() {
	//creates the default music player
	const container = document.getElementById("music-player-container");
	if (!container) {
		throw Error("Could not find container");
	}
	ytPlayerMusic = appendMusicPlayer(
		container,
		"VZYr1eyC81g",
	);
	loadProfile((document.getElementById("profile-selector") as HTMLInputElement).value);
	//loadSongs()
}

//__________________PROFILES_____________________

function loadProfile(profileId: string) {
	console.log("Loading Profile: " + profileId);
	let profile: Profile = ipcRenderer.sendSync(IpcS.getProfile, profileId);
	if (!profile) {
		console.error("Profile not found");
		return;
	}
	currentProfile = profile;
	renderProfile(profile);
	
}

function renderProfile(profile: Profile) {

	//generate song buttons
	let musicBtnParent = document.getElementById(docIds.containerMusicBtns);
	let ambienceBtnParent = document.getElementById(docIds.containerAmbienceBtns);

	if (!musicBtnParent || !ambienceBtnParent) {
		throw Error("Could not generate Song Buttons: parent Element not found");
	}
	//clears the container
	musicBtnParent.innerHTML = "" ;
	ambienceBtnParent.innerHTML = "";
	
	profile.songs.music.forEach((song: Song) => generateSongBtn(song, musicBtnParent!, "music"));
	profile.songs.ambience.forEach((song: Song) => generateSongBtn(song, ambienceBtnParent!, "ambience"));

	//play default
	if (profile.defaultSong) playMusic(profile.defaultSong.id, ytPlayerMusic);
}

document.getElementById("profile-selector")?.addEventListener("change", () => {
	loadProfile((document.getElementById("profile-selector") as HTMLInputElement).value);
});



//_________________________SONG BUTTONS___________________________________

//generate Ambience Button Function
function generateSongBtn(song: Song, parent: HTMLElement, type: "music" | "ambience") {
	if (!parent) {
		throw Error("Could not generate AmbienceBtn: parent Element not found");
	}

	//button
	const button = document.createElement("a");
	button.setAttribute("class", `btn ${type}-btn`);
	button.setAttribute("id", song.id);
	button.setAttribute("function", "play");
	button.innerHTML = song.topic.charAt(0).toUpperCase() + song.topic.slice(1);
	const c = document.createElement("div");
	c.appendChild(button);
	parent.appendChild(c);

	if (type === "music") {
		button.addEventListener("click", () => {
			musicButtonOnClick(button);
		});

	} else {
		button.addEventListener("click", () => {
			ambienceButtonOnClick(button);
		});

		//generate span
		const spanId = `${song.topic}Reply`;
		const span = document.createElement("span");
		span.setAttribute("class", "ambienceResponse bg-color-7");
		span.setAttribute("id", spanId);

		parent.appendChild(span);
	}
}

function musicButtonOnClick(button: HTMLElement) {
	switch (button.getAttribute("function")) {
		case "play":
			playMusicFromButton(button);
			break;
		case "stop":
			//TODO: figure out how to stop YT embed
			break;
		case "delete":
			deleteSongFromButton(button);
			break;
		case "edit":
			//TODO: edit buttons
			break;
	}
}

function playMusicFromButton(button: HTMLElement) {
	let song: Song = ipcRenderer.sendSync(IpcS.songRequest, button.id, "music");

	playMusic(song.id, ytPlayerMusic)
	setMusicButtonToPlaying(button);
	console.log(`Playing ${JSON.stringify(song)}`);
	
}

function setMusicButtonToPlaying(btnPlaying: HTMLElement) {
	let btns = document.getElementsByClassName("music-btn");

	//deletes 'playing' for all music buttons
	Array.from(btns, (btn) => {
		btn.className = btn.className.replace(" playing", "");
		btn.setAttribute("function", "play");
	});

	//sets playing for the music button
	btnPlaying.setAttribute("function", "stop");
	btnPlaying.setAttribute("class", btnPlaying.className + " playing");
}

function ambienceButtonOnClick(button: HTMLElement) {
	switch (button.getAttribute("function")) {
		case "play":
			ipcRenderer.sendSync(IpcS.ambienceRequest, button.id);
			setAmbienceButtonToPlaying(button);

			break;
		case "stop":
			ipcRenderer.send(IpcS.ambienceClose, button.id);
			break;
		case "delete":
			deleteSongFromButton(button);
			break;
		case "edit":
			//TODO: edit buttons
			break;
	}
}

function setAmbienceButtonToPlaying(btnPlaying: HTMLElement) {
	//sets playing for the music button
	btnPlaying.setAttribute("function", "stop");
	btnPlaying.setAttribute("class", btnPlaying.className + " playing");
	btnPlaying.innerHTML = btnPlaying.innerHTML + "🛑";
}

ipcRenderer.on(IpcR.ambienceClosed, (event: IpcRendererEvent, ambienceId: string) => {
	if (ambienceId !== "closeAll") {
		let btn = document.getElementById(ambienceId);
		if (btn) setBtnToPlay(btn);
	} else {
		let allAmbBtns = document.getElementsByClassName("btn ambience-btn");
		Array.from(allAmbBtns).forEach((btn) => {
			setBtnToPlay(btn);
		});
	}
});

function setBtnToPlay(btn: Element) {
	if (btn) {
		btn.innerHTML = btn.innerHTML.replace("🛑", "");
		btn.className = btn.className.replace(" playing", "");
		btn.setAttribute("function", "play");
	} else {
		console.warn("COULD NOT SET TO PLAY: BUTTON IS UNDEFINED");
	}
}

//__________________________ADD SONG________________________________
document.getElementById("btn-add-song")?.addEventListener("click", () => {
	console.log("Clicked Add Song Button!");
	ipcRenderer.send(IpcS.addSongPopup);
});

ipcRenderer.on(IpcR.addSongButton, (event: IpcRendererEvent, song: Song) => {
	console.log("Adding Button...");
	switch (song.type) {
		case "music":
			generateSongBtn(song, document.getElementById("musicBox")!, "music");
			break;
		case "ambience":
			generateSongBtn(song, document.getElementById("ambienceBox")!, "ambience");
			break;
	}
});

//_______________DELETE SONG_________________________
document.getElementById("btn-delete-song")?.addEventListener("click", () => {
	console.log("Clicked Delete Song Button!");
	toggleDelPreview();
});

function toggleDelPreview() {
	let allAmbBtns = document.getElementsByClassName("btn ambience-btn");
	Array.from(allAmbBtns).forEach((btn) => {
		toggleDeleteHtml(btn);
	});

	let allMusBtns = document.getElementsByClassName("btn music-btn");
	Array.from(allMusBtns).forEach((btn) => {
		toggleDeleteHtml(btn);
	});
}

function toggleDeleteHtml(elem: Element) {
	if (elem.className.includes("delete")) {
		elem.className = elem.className.replace(" delete", "");
		elem.innerHTML = elem.innerHTML.replace(" 🗑️", "");
		elem.setAttribute("function", "play");
	} else {
		elem.className = elem.className + " delete";
		elem.innerHTML = elem.innerHTML + " 🗑️";
		elem.setAttribute("function", "delete");
	}
}

function deleteSongFromButton(button: HTMLElement) {
	//remove from runtime & storage
	console.log(button.className.replace(/btn |-|delete/g, ""));
	ipcRenderer.send(IpcS.deleteSong, button.id, button.className.replace(/btn| |-|delete|playing/g, ""));
	//remove from html
	button.parentNode?.removeChild(button);

	//toggles the delete function
	toggleDelPreview();
}

//__________________OTHER EVENTS___________________

const addEmbedBtn = document.getElementById("create-embed");

addEmbedBtn?.addEventListener("click", () => {
	let newPlayer = appendAmbiencePlayerPopup(document.getElementById("music-player-container")!, "VZYr1eyC81g");
	ytPlayersAmb.push(newPlayer);
});

//close all ambience button
const cButton = document.getElementById("closeAll");
cButton?.addEventListener("click", () => {
	ipcRenderer.send(IpcS.ambienceClose, "closeAll");
});

const submitBtn = document.getElementById("submitBtn");
submitBtn?.addEventListener("click", () => {
	const ytUrl = (<HTMLInputElement>document.getElementById("ytUrl")).value;
	console.log(ytUrl);
	if (ytUrl) {
		playMusic(extractYtIdFromLink(ytUrl), ytPlayerMusic);
	}
});

//----------------------------other-------------------------------

//____________________TESTING_________________
const testBtn = document.getElementById("testBtn");
testBtn?.addEventListener("click", () => {
	console.log(document.getElementsByClassName("btn ambience-btn").length);
	ipcRenderer.send(IpcS.testSend, "test");
});

ipcRenderer.on(IpcR.testReply, (event: IpcRendererEvent, arg: string) => {
	const message = `Reply: ${arg}`;
	document.getElementById("test-reply")?.setAttribute("innerHTML", message);
});

const sButton = document.getElementById("ri-roll");
sButton?.addEventListener("click", () => {
	playMusic("iik25wqIuFo", ytPlayerMusic);
});



//------------ Music Buttons ------------------------
/* var mButtons = document.getElementsByClassName("btn music-btn");
//for each Music Button -> add an Event Listener
Array.from(mButtons).forEach((el) => {
    let elId = el.getAttribute('id');
    el.addEventListener('click', () => {
        let song = ipcRenderer.sendSync('song-request', elId, 'music')
        console.log(song);
        if (song.topic) {
            playYtVideo(parseYtIdToEmbedUrl(song.id, song.length, true, true));
            setPlaying(elId);
        } else {
            console.log('ERROR: button not configued yet. ytId = null');
        }
    });
});

//------------------Ambience Btns---------------------
 var aButtons = document.getElementsByClassName("btn ambience-btn");
//for each Ambience Button -> add an Event Listener
for (const el of aButtons) {
    let elId = el.getAttribute('id');
    //first checks duplicate, then appends button
    el.addEventListener('click', () => {
        if (ipcRenderer.sendSync('ambience-duplicate-check', elId)) {
            ipcRenderer.send('ambience-request', elId, appendPauseBtn(el, elId).id);
        }
    });
} */

bootup();
