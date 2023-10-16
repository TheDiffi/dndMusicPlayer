import electron from "electron";
import { IpcS, Song } from "../util/types.util";
import {
	appendMusicPlayer,
	closePlayer,
	extractYtIdFromLink,
	playMusic,
	setAmbiencePlayerState,
	youTubeSongSearch,
	YTPlayer
} from "../util/yt.util";
import {
	generateSearchResultHtml,
	NewProfilePopup,
	renderAddSongGenericPopup,
	renderAddSongToProfilePopup
} from "./edit-popups";
import { getCurrentProfile, loadProfiles, playAmbience, renderProfileId, setAllSongs } from "./profile-handler";

const ipc = electron.ipcRenderer;

export let ytPlayerMusicMain: YTPlayer;
export let ytPlayersAmbience: YTPlayer[] = [];

function init() {
	//creates the music player
	const container = document.getElementById("music-player-container");
	if (!container) throw Error("Could not find container");
	//loads music player
	ytPlayerMusicMain = appendMusicPlayer(container, "VZYr1eyC81g");

	// load Songs
	setAllSongs(ipc.sendSync(IpcS.getAllSongs));

	// load profiles

	loadProfiles();

	//load the event listeners
	loadEventListeners();
}

//--------------------Event Listeners--------------------
function loadEventListeners() {
	document.getElementById("ping-btn")?.addEventListener("click", () => {
		const profile = new NewProfilePopup();
	});

	document.getElementById("profile-selector")?.addEventListener("change", () => {
		let value = (document.getElementById("profile-selector") as HTMLInputElement).value;
		switch (value) {
			case "allSongs":
				setAllSongs(ipc.sendSync(IpcS.getAllSongs));
				renderProfileId(value);
				break;
			case "addProfile":
				const profile = new NewProfilePopup();
				break;
			default:
				renderProfileId(value);
		}
	});

	document.getElementById("all-songs-btn")?.addEventListener("click", () => {
		renderProfileId("allSongs");
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
		if (getCurrentProfile().id === "allSongs") renderAddSongGenericPopup("music");
		else renderAddSongToProfilePopup("music");
	});
	document.getElementById("add-ambience-btn")?.addEventListener("click", () => {
		if (getCurrentProfile().id === "allSongs") renderAddSongGenericPopup("ambience");
		else renderAddSongToProfilePopup("ambience");
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
		//get first 20 characters of the title
		let name = ytData.snippet.title;
		if (name.length > 40) name = name.substring(0, 35) + "...";

		const element = generateSearchResultHtml(name, ytData.id.videoId, {
			buttons: [
				{
					innerHTML: "🎵",
					idClass: "quickplay-select-btn",
					onClick: () => {
						//adds event listeners to the buttons
						playMusic(ytData.id.videoId, ytPlayerMusicMain);
						document.getElementById("quickplay-select-container")!.style.display = "none";
					},
				},
				{
					innerHTML: "✨",
					idClass: "quickplay-select-btn",
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
				},
			],
		});

		select.appendChild(element);
	});
	//shows the popup
	document.getElementById("quickplay-select-container")!.style.display = "block";
}

init();
