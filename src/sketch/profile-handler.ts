import electron from "electron";
import { appendAmbiencePlayer, playMusic } from "../util/yt.util";
import { IpcS, Profile, Scene, Song } from "../util/types.util";
import { ytPlayerMusicMain, ytPlayersAmbience } from "./renderer-sketch";
const ipc = electron.ipcRenderer;

let profiles: Map<string, Profile> = new Map(/* id, Profile */);
export function getProfiles() {
	return profiles;
}
export function setProfiles(newProfiles: Map<string, Profile>) {
	profiles = newProfiles;
}
export function getProfile(id: string) {
	return profiles.get(id);
}
let currentProfile: Profile;
export function getCurrentProfile() {
	return currentProfile;
}
export function setCurrentProfile(newProfile: Profile) {
	currentProfile = newProfile;
}

let allSongs: Song[];
export function getAllSongs() {
	return allSongs;
}
export function setAllSongs(newSongs: Song[]) {
	allSongs = newSongs;
}

const docIds = {
	buttonContainers: {
		music: "music-button-container",
		ambience: "ambience-button-container",
		scene: "scene-button-container",
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
		scene: {
			element: "a",
			attributes: { class: "scene-btn w-button", id: "", function: "play" },
			innerHTML: "",
		},
	},
};

export function loadProfiles() {
	profiles = new Map();
	ipc.sendSync(IpcS.getProfiles).forEach((profile: Profile) => {
		profiles.set(profile.id, profile);
	});
	console.log(profiles);

	const selector = document.getElementById("profile-selector");
	if (!selector) throw Error("Could not find profile selector");
	getProfiles().forEach((profile) => {
		const option = document.createElement("option");
		option.value = profile.id;
		//first letter uppercase
		option.text = profile.name.charAt(0).toUpperCase() + profile.name.slice(1);
		selector.appendChild(option);
	});

	loadProfile("allSongs", false);
}

export function loadProfile(profileId: string, autoplay: boolean = true) {
	//if (getCurrentProfile() && getCurrentProfile().id === profileId) return;
	console.log("Loading Profile: " + profileId);
	//loads all songs profile
	let profile: Profile | undefined =
		profileId === "allSongs" || profileId === "0" ? getAllSongsProfile() : getProfile(profileId);

	if (!profile) {
		console.error("Profile not found");
		return;
	}

	console.log("Current Profile: " + profile);
	setCurrentProfile(profile);
	renderProfile(profile);

	if (profile.id === "0") autoplay = false;
	//play default
	if (profile.defaultSong && autoplay) playMusic(profile.defaultSong.id, ytPlayerMusicMain);
}

function getAllSongsProfile() {
	const profile: Profile = {
		name: "All Songs",
		id: "allSongs",
		songs: {
			music: allSongs.filter((song) => song.type === "music"),
			ambience: allSongs.filter((song) => song.type === "ambience"),
		},
		scenes: undefined,
		defaultSong: undefined,
	};
	return profile;
}

function renderProfile(profile: Profile) {
	//generate song buttons
	let musicBtnParent = document.getElementById(docIds.buttonContainers.music);
	let ambienceBtnParent = document.getElementById(docIds.buttonContainers.ambience);

	if (!musicBtnParent || !ambienceBtnParent) {
		throw Error("Could not generate Song Buttons: parent Element not found");
	}
	//clears the container
	musicBtnParent.innerHTML = "";
	ambienceBtnParent.innerHTML = "";

	renderSongButtons(profile.songs.music, "music");
	renderSongButtons(profile.songs.ambience, "ambience");

	renderScenes(profile);
}

function renderSongButtons(songs: Song[], type: "music" | "ambience") {
	let parent = document.getElementById(docIds.buttonContainers[type]);
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
			const song = allSongs.find((s) => s.id === button.id);
			playAmbience(song);

			break;
		case "stop":
			break;
		case "edit":
			break;
	}
}

export function playAmbience(song: Song | undefined) {
	if (!song) throw Error("Song not found");
	console.log(song);
	//generates player
	const player = appendAmbiencePlayer(document.getElementById("ambience-player-container")!, song);
	ytPlayersAmbience.push(player);

	console.log(`Playing ${JSON.stringify(song.id)}`);
}

function renderScenes(profile: Profile) {
	let parent = document.getElementById(docIds.buttonContainers.scene);
	if (!parent) throw Error(`Could not find scene container`);
	const scenes = profile.scenes;
	if (scenes === undefined) {
		parent.innerHTML = "No Scenes";
		//document.getElementById("scene-container")!.style.display = "none";
		return;
	}

	//clears the container
	parent.innerHTML = "";
	//document.getElementById("scene-container")!.style.display = "";

	scenes.forEach((scene: Scene) => renderSceneBtn(scene, parent!));
}

function renderSceneBtn(scene: Scene, parent: HTMLElement) {
	let element = generateSceneBtn(scene);
	//creates container
	const c = document.createElement("div");
	c.appendChild(element);
	parent.appendChild(c);

	// adds event listener
	element.addEventListener("click", () => {
		sceneButtonOnClick(element);
	});
}

function generateSceneBtn(scene: Scene): HTMLElement {
	let button = document.createElement(htmlPresets.buttons.music.element);

	//sets attributes
	for (const [key, value] of Object.entries(htmlPresets.buttons.music.attributes)) {
		button.setAttribute(key, value);
	}
	//sets id
	button.setAttribute("id", scene.id);
	//sets innerHTML
	button.innerHTML = scene.name.charAt(0).toUpperCase() + scene.name.slice(1);

	return button;
}

function sceneButtonOnClick(button: HTMLElement) {
	const scene = currentProfile.scenes?.find((s) => s.id === button.id);
	if (!scene) throw Error("Scene not found");
	console.log(`Playing Scene ${JSON.stringify(button.id)}`);

	loadScene(scene);
}

function loadScene(scene: Scene) {
	console.log("Loading Scene: " + scene.name);
	console.error("Not implemented yet");
}

export function addSongToCurrentProfile(song: Song) {
	if (!(currentProfile.id == "0")) {
		currentProfile = addSongToProfile(song, currentProfile.id);
	}
	loadProfile(currentProfile.id, true);
	return currentProfile;
}

export function addSongToProfile(song: Song, profileId: string) {
	//get profile
	const profile = profiles.get(profileId);
	if (!profile) throw Error("Profile not found");

	//add song to profile
	profile.songs[song.type].push(song);

	//save profile
	saveProfiles();

	return profile;
}

function saveProfiles() {
	const profilesList: Profile[] = Array.from(profiles.values());
	ipc.send(IpcS.saveProfiles, profilesList);
}

export function saveSong(song: Song) {
	allSongs.find((s) => s.id === song.id) ? updateSong(song) : addSong(song);
	ipc.send(IpcS.saveSongs, allSongs);
}

function addSong(song: Song) {
	allSongs.push(song);
}

function updateSong(song: Song) {
	const index = allSongs.findIndex((s) => s.id === song.id);
	allSongs[index] = song;
}

export function lookupSongs(keyphrase: string, maxResults = 10) {
	let results: Song[] = [];

	if (!keyphrase) {
		results = allSongs;
	} else {
		keyphrase = keyphrase.toLowerCase();
		allSongs.forEach((s) => {
			if (s.topic.toLowerCase().includes(keyphrase)) results.push(s);
		});
	}

	results.splice(maxResults);

	return results;
}
