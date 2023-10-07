import electron from "electron";
import { IpcS, Profile, Scene, Song } from "../util/types.util";
import {
	YTPlayer,
	appendMusicPlayer,
	playMusic,
	appendAmbiencePlayer,
	setAmbiencePlayerState,
	closePlayer,
	extractYtIdFromLink,
	youTubeSongSearch,
} from "../util/yt.util";
import { renderAddSongPopup, generateSearchResultHtml } from "./edit-songs";

const ipc = electron.ipcRenderer;
let ytPlayerMusicMain: YTPlayer;
let ytPlayersAmbience: YTPlayer[] = [];
let profiles: Map<string, Profile> = new Map(/* id, Profile */);
let allSongs: Song[];
let currentProfile: Profile;

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

function init() {
	//creates the music player
	const container = document.getElementById("music-player-container");
	if (!container) throw Error("Could not find container");
	//loads music player
	ytPlayerMusicMain = appendMusicPlayer(container, "VZYr1eyC81g");

	// load Songs
	allSongs = ipc.sendSync(IpcS.getAllSongs);

	// load profiles

	loadProfiles();

	function loadProfiles() {
		profiles = ipc.sendSync(IpcS.getProfiles);

		const selector = document.getElementById("profile-selector");
		if (!selector) throw Error("Could not find profile selector");
		profiles.forEach((profile) => {
			const option = document.createElement("option");
			option.value = profile.id;
			//first letter uppercase
			option.text = profile.name.charAt(0).toUpperCase() + profile.name.slice(1);
			selector.appendChild(option);
		});

		loadProfile("allSongs", false);
	}

	//load the event listeners
	loadEventListeners();
}

function loadProfile(profileId: string, autoplay: boolean = true) {
	if (currentProfile && currentProfile.id === profileId) return;
	console.log("Loading Profile: " + profileId);
	//loads all songs profile
	let profile: Profile | undefined = profileId === "allSongs" ? getAllSongsProfile() : profiles.get(profileId);

	if (!profile) {
		console.error("Profile not found");
		return;
	}

	currentProfile = profile;
	renderProfile(profile);

	if ((profile.id = "0")) autoplay = false;
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

function playAmbience(song: Song | undefined) {
	if (!song) throw Error("Song not found");
	console.log(song);
	//generates player
	const player = appendAmbiencePlayer(document.getElementById("ambience-player-container")!, song);
	ytPlayersAmbience.push(player);

	console.log(`Playing ${JSON.stringify(song.id)}`);
}

//--------------------Event Listeners--------------------
function loadEventListeners() {
	document.getElementById("profile-selector")?.addEventListener("change", () => {
		loadProfile((document.getElementById("profile-selector") as HTMLInputElement).value);
	});

	document.getElementById("all-songs-btn")?.addEventListener("click", () => {
		loadProfile("allSongs");
	});

	document.getElementById("pause-all-btn")?.addEventListener("click", () => {
		ytPlayerMusicMain.api.stopVideo();
		ytPlayersAmbience.forEach((player) => {
			player.api.stopVideo();
			setAmbiencePlayerState("paused", player.container);
		});
	});

	document.getElementById("start-all-btn")?.addEventListener("click", () => {
		ytPlayerMusicMain.api.playVideo();
		ytPlayersAmbience.forEach((player) => {
			player.api.playVideo();
			setAmbiencePlayerState("playing", player.container);
		});
	});

	document.getElementById("close-all-btn")?.addEventListener("click", () => {
		ytPlayerMusicMain.api.stopVideo();
		ytPlayersAmbience.forEach((player) => {
			closePlayer(player.container);
		});
	});

	document.getElementById("quickplay-submit")?.addEventListener("click", () => {
		const input = (document.getElementById("quickplay-input") as HTMLInputElement).value;
		if (!input) throw Error("No input");
		// if input starts with "https://"
		if (input.startsWith("https://")) {
			const id = extractYtIdFromLink(input);
			if (!id) throw Error("Could not extract id from link");
			playMusic(id, ytPlayerMusicMain);
		} else {
			quickSearch(input);
		}
	});

	document.getElementById("add-music-btn")?.addEventListener("click", () => {
		renderAddSongPopup();
	});
	document.getElementById("add-ambience-btn")?.addEventListener("click", () => {
		renderAddSongPopup();
	});
}

async function quickSearch(input: string) {
	//searches for song
	const data = await youTubeSongSearch(input, "music");
	//create a popup with the results
	const select = document.getElementById("quickplay-select-content");
	if (!select) throw Error("Could not find select element");
	select.innerHTML = "";

	//creates a popup item for each result
	data.forEach((ytData) => {
		console.log("Duration: ");
		//get first 20 characters of the title
		let name = ytData.snippet.title;
		if (name.length > 40) name = name.substring(0, 35) + "...";

		const element = generateSearchResultHtml(name, ytData.id.videoId, {buttons: [{
				innerHTML: "🎵",
				onClick: () => {
					//adds event listeners to the buttons
					playMusic(ytData.id.videoId, ytPlayerMusicMain);
					document.getElementById("quickplay-select-container")!.style.display = "none";
				},
			},
			{
				innerHTML: "✨",
				onClick: () => {
					const song: Song = {
						id: ytData.id.videoId,
						topic: name.substring(0, 6),
						type: "ambience",
						volume: 40,
					};
					playAmbience(song);
					document.getElementById("quickplay-select-container")!.style.display = "none";
				},
			}]
		});

		select.appendChild(element);
	});
	//shows the popup
	document.getElementById("quickplay-select-container")!.style.display = "block";
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

init();
