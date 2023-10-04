import { ipcRenderer } from "electron";
import { IpcS, Profile, Song, Songs } from "../util/types.util";
import { YTPlayer, createNewYTPlayer, playMusic } from "../util/yt.util";

let ytPlayerMusicMain: YTPlayer;
let ytPlayersAmbience: YTPlayer[] = [];
let profiles: Map<string, Profile> = new Map(/* id, Profile */);
let allSongs: Song[];
let currentProfile: Profile;


const docIds = {
	songContainers: {
		music: "music-button-container",
		ambience: "ambience-button-container",
	},
};

const htmlPresets = {
	buttons: {
		music: {
			element: "a",
			attributes: { class: "song-btn music-btn w-button", id: "", function: "play" },
			innerHTML: "",
		},
		ambience: {
			element: "a",
			attributes: { class: "song-btn ambience-btn w-button", id: "", function: "play" },
			innerHTML: "",
		},
	},
};

function init() {
	//creates the music player
	const container = document.getElementById("music-player-container");
	if (!container) throw Error("Could not find container");

	//loads music player
	ytPlayerMusicMain = createNewYTPlayer(container, "VZYr1eyC81g", "ytPlayer", "music");

	// load profiles
	profiles = ipcRenderer.sendSync(IpcS.getProfiles);

	// load Songs
	allSongs = ipcRenderer.sendSync(IpcS.getAllSongs);

	loadProfile((document.getElementById("profile-selector") as HTMLInputElement).value);
}

function loadProfile(profileId: string) {
	console.log("Loading Profile: " + profileId);
	let profile = profiles.get(profileId);
	if (!profile) {
		console.error("Profile not found");
		return;
	}
	if(profile.id === "0") {
		allSongs.forEach((song: Song) => {
			profile?.songs[song.type].push(song);
		});
	}

	currentProfile = profile;
	renderProfile(profile);

	//play default
	if (profile.defaultSong) playMusic(profile.defaultSong.id, ytPlayerMusicMain);
}

function renderProfile(profile: Profile) {
	renderSongButtons(profile.songs.music, "music");
	renderSongButtons(profile.songs.ambience, "ambience");

	//generate song buttons
	let musicBtnParent = document.getElementById(docIds.songContainers.music);
	let ambienceBtnParent = document.getElementById(docIds.songContainers.ambience);

	if (!musicBtnParent || !ambienceBtnParent) {
		throw Error("Could not generate Song Buttons: parent Element not found");
	}
	//clears the container
	musicBtnParent.innerHTML = "";
	ambienceBtnParent.innerHTML = "";

	profile.songs.music.forEach((song: Song) => renderSongBtn(song, musicBtnParent!, "music"));
	profile.songs.ambience.forEach((song: Song) => renderSongBtn(song, ambienceBtnParent!, "ambience"));
}

function renderSongButtons(songs: Song[], type: "music" | "ambience") {
	let parent = document.getElementById(docIds.songContainers[type]);
	if (!parent) throw Error(`Could not find ${type} button container`);

	//clears the container
	parent.innerHTML = "";

	songs.forEach((song: Song) => renderSongBtn(song, parent!, type));
}

//generate Ambience Button Function
function renderSongBtn(song: Song, parent: HTMLElement, type: "music" | "ambience") {
	if (!parent) {
		throw Error("Could not generate AmbienceBtn: parent Element not found");
	}

	let element = generateSongBtn(song, type);
	//creates container
	const c = document.createElement("div");
	c.appendChild(element);
	parent.appendChild(c);

	// adds event listener
	switch (type) {
		case "music":
			element.addEventListener("click", () => {
				musicButtonOnClick(element);
			});
			break;
		case "ambience":
			element.addEventListener("click", () => {
				ambienceButtonOnClick(element);
			});
			break;
	}
}

function generateSongBtn(song: Song, type: "music" | "ambience"): HTMLElement {
	let button = document.createElement(htmlPresets.buttons[type].element);

	//sets attributes
	for (const [key, value] of Object.entries(htmlPresets.buttons[type].attributes)) {
		button.setAttribute(key, value);
	}
	//sets id
	button.setAttribute("id", song.id);
	//sets innerHTML
	button.innerHTML = song.topic.charAt(0).toUpperCase() + song.topic.slice(1);

	return button;
}

function musicButtonOnClick(button: HTMLElement) {
	switch (button.getAttribute("function")) {
		case "play":
			playMusicFromButton(button);
			break;
		case "stop":
			
			break;
	}
}

function playMusicFromButton(button: HTMLElement) {
	playMusic(button.id, ytPlayerMusicMain);
	setMusicButtonToPlaying(button);
	console.log(`Playing ${JSON.stringify(button.id)}`);
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
			playAmbienceFromButton(button);

			break;
		case "stop":
			
			break;
		case "edit":
			
			break;
	}
}

function playAmbienceFromButton(button: HTMLElement) {
	generateAmbiencePlayer(button.id);
	setAmbienceButtonToPlaying(button);
	console.log(`Playing ${JSON.stringify(button.id)}`);
}

function generateAmbiencePlayer(ytId: string) {
	throw new Error("Function not implemented.");
	//TODO: generate Ambience Player

}

function setAmbienceButtonToPlaying(btnPlaying: HTMLElement) {
	//sets playing for the music button
	btnPlaying.setAttribute("function", "stop");
	btnPlaying.setAttribute("class", btnPlaying.className + " playing");
	btnPlaying.innerHTML = btnPlaying.innerHTML + "🛑";
}

//--------------------Event Listeners--------------------
document.getElementById("profile-selector")?.addEventListener("change", () => {
	loadProfile((document.getElementById("profile-selector") as HTMLInputElement).value);
});

init();


