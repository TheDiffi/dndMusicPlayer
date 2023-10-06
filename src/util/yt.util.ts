import YouTubeApiEmbed from "youtube-player";
import { YouTubePlayer } from "youtube-player/dist/types";
import { Song } from "./types.util";

function appendMusicPlayer(parent: HTMLElement, ytId: string): YTPlayer {
	const type = "music";
	const playerContainerClassName: string = "ytPlayer";
	//creates the new id
	var amountExistingPlayers = parent.getElementsByClassName(playerContainerClassName).length;
	var playerId = amountExistingPlayers ? amountExistingPlayers + 1 : 1;

	//creates the player Container
	var playerContainer = document.createElement("div");
	playerContainer.className = playerContainerClassName;
	playerContainer.id = playerContainerClassName + playerId;

	parent.appendChild(playerContainer);

	//creates the apiEmbed
	let apiEmbed = appendYTEmbed(playerContainer, ytId, playerId);
	//player controls
	let controlsEmbed = appendMusicEmbedControls(playerContainer, playerId, apiEmbed, type);

	// creates the new player
	let newPlayer: YTPlayer = {
		api: apiEmbed,
		type: type,
		container: playerContainer,
		playerId: playerId,
		song: undefined,
	};

	return newPlayer;
}

function appendAmbiencePlayerPopup(parent: HTMLElement, ytId: string): YTPlayer {
	const type = "ambience";
	const parentClassName: string = "ytPlayer";
	//creates the new id
	var amountExistingPlayers = parent.getElementsByClassName(parentClassName).length;
	var playerId = amountExistingPlayers ? amountExistingPlayers + 1 : 1;

	//creates the player Container
	var playerContainer = document.createElement("div");
	playerContainer.className = parentClassName;
	playerContainer.id = parentClassName + playerId;

	parent.appendChild(playerContainer);

	//creates the apiEmbed
	let apiEmbed = appendYTEmbed(playerContainer, ytId, playerId);
	//player controls
	let controlsEmbed = appendMusicEmbedControls(playerContainer, playerId, apiEmbed, type);

	// creates the new player
	let newPlayer: YTPlayer = {
		api: apiEmbed,
		type: type,
		container: playerContainer,
		playerId: playerId,
		song: undefined,
	};

	return newPlayer;
}

function appendYTEmbed(
	playerContainer: HTMLDivElement,
	ytId: string,
	playerId: number,
	apiEmbedOptions: { autoplay: 0 | 1; loop: 0 | 1; color?: "red" | "white" } = {
		autoplay: 0,
		loop: 1,
		color: "white",
	},
	playerOptions: { hidden: boolean; height: string; width: string } = { hidden: false, height: "auto", width: "auto" }
): YouTubePlayer {
	//creates the embed container
	const apiEmbedContainer = document.createElement("div");
	const embedId = "ytEmbed" + playerId;
	apiEmbedContainer.id = embedId;

	//apiEmbedContainer.className = "yt-embed rpgui-container framed-grey";
	playerContainer.appendChild(apiEmbedContainer);

	//creates the apiEmbed via YtAPI
	const apiEmbed = YouTubeApiEmbed(embedId, {
		height: "auto",
		width: "auto",
		videoId: ytId,
		playerVars: apiEmbedOptions,
	});

	if (!apiEmbed) throw Error("apiEmbed is undefined");

	if (playerOptions.hidden) apiEmbedContainer.style.display = "none";

	return apiEmbed;
}

function appendMusicEmbedControls(
	playerContainer: HTMLDivElement,
	ownId: number,
	ytapi: YouTubePlayer,
	type: Songtypes
): HTMLDivElement {
	//volume slider
	let slider = document.createElement("input");
	let attr = ["class", "volume-slider", "type", "range", "min", "0", "max", "100", "value", "50"];

	for (let i = 0; i < attr.length; i += 2) {
		slider.setAttribute(attr[i], attr[i + 1]);
	}
	ytapi.setVolume(slider.valueAsNumber);
	slider.addEventListener("change", () => {
		ytapi.setVolume(slider.valueAsNumber);
	});

	let span = document.createElement("span");
	span.innerText = "Lautstärke";

	const vol = document.createElement("div");
	vol.appendChild(slider);
	vol.appendChild(slider);

	//Buttons
	let pauseBtn = document.createElement("button");
	pauseBtn.innerText = "⏯️";
	pauseBtn.className = "pause EmbedBtn";
	pauseBtn.addEventListener("click", () => togglePause(ytapi));

	let randBtn = document.createElement("button");
	randBtn.innerText = "🔀";
	randBtn.className = "rand EmbedBtn";
	randBtn.addEventListener("click", () => playRandomTime(ytapi));

	const btns = document.createElement("div");
	btns.appendChild(pauseBtn);
	btns.appendChild(randBtn);

	if (type === "ambience") {
		let closeBtn = document.createElement("button");
		closeBtn.innerText = "X";
		closeBtn.className = "close EmbedBtn";
		closeBtn.addEventListener("click", () => closePlayer(playerContainer));
		btns.appendChild(closeBtn);
	}

	//container
	let container = document.createElement("div");
	container.className = "embed-controls";
	container.id = "yt-api-controls" + ownId;
	container.appendChild(btns);
	container.appendChild(vol);

	//appeds the container
	playerContainer.appendChild(container);

	//RPGUI stuff here

	//return
	return container;
}

function appendAmbiencePlayer(parent: HTMLElement, song: Song): YTPlayer {
	const type = "ambience";
	const parentClassName = "ambience-player";

	var amountExistingPlayers = parent.getElementsByClassName(parentClassName)?.length ?? 0;
	var playerId = amountExistingPlayers ? amountExistingPlayers + 1 : 1;

	//generates and append the player element
	const playerElement = generateAmbiencePlayerElement(playerId, song);
	parent.appendChild(playerElement);

	let apiEmbed = appendYTEmbed(
		playerElement,
		song.id,
		playerId,
		{ autoplay: 1, loop: 1 },
		{ hidden: true, height: "auto", width: "auto" }
	);

	//player controls
	activateAmbiencePlayerControls(playerElement, apiEmbed);

	// creates the new player
	let newPlayer: YTPlayer = {
		api: apiEmbed,
		type: type,
		container: playerElement,
		playerId: playerId,
		song: undefined,
	};

	return newPlayer;
}

function generateAmbiencePlayerElement(id: number, song: Song): HTMLDivElement {
	/* 
	<div class="ambience-player">
		<div class="w-layout-hflex flex-block-2">
			<a class="button w-button ab-player-btn ab-player-play">Play</a>
			<div class="text-block ab-player-title">Title</div>
			<a class="button ab-player-btn ab-player-close w-button">X</a>
		</div>
	</div> 
	*/

	const player = document.createElement("div");
	player.className = "ambience-player";
	player.id = id + "$ambience-player";
	const flex = document.createElement("div");
	flex.className = "w-layout-hflex flex-block-2 ambience-player-flex";
	flex.id = id + "$ambience-player-flex";
	const playBtn = document.createElement("a");
	playBtn.className = "button w-button ab-player-btn ab-player-play";
	playBtn.innerText = "⏸️";
	playBtn.id = id + "$ab-player-play";
	const title = document.createElement("div");
	title.className = "text-block ab-player-title";
	title.innerText = song.topic.charAt(0).toUpperCase() + song.topic.slice(1);
	title.id = id + "$ab-player-title";
	const closeBtn = document.createElement("a");
	closeBtn.className = "button ab-player-btn ab-player-close w-button";
	closeBtn.innerText = "⏹️";
	closeBtn.id = id + "$ab-player-close";
	const slider = document.createElement("input");
	const attr = ["class", "volume-slider", "type", "range", "min", "0", "max", "100", "value", "50"];
	for (let i = 0; i < attr.length; i += 2) {
		slider.setAttribute(attr[i], attr[i + 1]);
	}
	const sliderContainer = document.createElement("div");
	sliderContainer.className = "ambience-vol-container";
	sliderContainer.appendChild(slider);

	flex.appendChild(playBtn);
	flex.appendChild(title);
	flex.appendChild(closeBtn);
	player.appendChild(flex);
	player.appendChild(sliderContainer);

	return player;
}

function activateAmbiencePlayerControls(playerContainer: HTMLDivElement, ytapi: YouTubePlayer) {
	/* Template:
	<div class="ambience-player">
		<div class="w-layout-hflex flex-block-2">
			<a class="button w-button ab-player-btn ab-player-play">Play</a>
			<div class="text-block ab-player-title">Title</div>
			<a class="button ab-player-btn ab-player-close w-button">X</a>
		</div>
	</div> 
	*/

	//volume slider
	const slider = playerContainer.getElementsByClassName("volume-slider")[0] as HTMLInputElement;
	ytapi.setVolume(slider.valueAsNumber);
	slider.addEventListener("change", () => {
		ytapi.setVolume(slider.valueAsNumber);
	});

	//pause button
	const pauseBtn = playerContainer.getElementsByClassName("ab-player-play")[0] as HTMLAnchorElement;
	pauseBtn.addEventListener("click", () => {
		togglePause(ytapi).then((stateId) => {
			// inverted because the state is the state before the click
			const newState = stateId == 1 ? "paused" : "playing";
			setAmbiencePlayerState(newState, playerContainer);
		});
	});

	//close button
	const closeBtn = playerContainer.getElementsByClassName("ab-player-close")[0] as HTMLAnchorElement;
	closeBtn.addEventListener("click", () => {
		closePlayer(playerContainer);
	});

	const title = playerContainer.getElementsByClassName("ab-player-title")[0] as HTMLDivElement;
	title.addEventListener("click", () => playRandomTime(ytapi));
}

function setAmbiencePlayerState(newState: "paused" | "playing", playerContainer: HTMLDivElement) {
	const pauseBtn = playerContainer.getElementsByClassName("ab-player-play")[0] as HTMLAnchorElement;
	if (newState == "paused") {
		pauseBtn.innerText = "▶️";
		pauseBtn.className = pauseBtn.className.replace(" paused", "") + " playing";
	} else if ((newState = "playing")) {
		pauseBtn.innerText = "⏸️";
		pauseBtn.className = pauseBtn.className.replace(" playing", "") + " paused";
	}
}

async function togglePause(player: YouTubePlayer): Promise<number> {
	let state = await player.getPlayerState();
	if (state == 1) {
		player.pauseVideo();
	} else if (state == 2 || state == 5) {
		player.playVideo();
	}
	return state as number;
}

function playMusic(songId: string, ytPlayerMusic: YTPlayer) {
	ytPlayerMusic.api.loadVideoById(songId);
	playRandomTime(ytPlayerMusic.api);
	ytPlayerMusic.api.setVolume(50);
	ytPlayerMusic.api.setLoop(true);
}

function closePlayer(playerContainer: HTMLDivElement) {
	playerContainer.remove();
}

async function playRandomTime(ytapi: YouTubePlayer) {
	let duration = await ytapi.getDuration();
	ytapi.seekTo(Math.random() * (duration - duration / 10), true);
}

function playExampleVid(ytapi: YouTubePlayer): void {
	ytapi.loadVideoById("rQryOSyfXmI");
}

function playYtUrl(url: string, appendToId: string = "ytContainer") {
	if (null === document.getElementById("ytEmbed")) {
		createYTEmbed(appendToId, url);
	} else {
		document.getElementById("ytEmbed")!.setAttribute("src", url);
	}
}

function extractYtIdFromLink(ytUrl: string): string {
	var regExp = RegExp(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
	var match = ytUrl.match(regExp);
	return match && match[7].length == 11 ? match[7] : "";
}

function parseYtIdToEmbedLink(ytId: string, isAutoplay = false, isLoop = false, videoLength = 0) {
	let autoplayParam = isAutoplay ? "autoplay=1" : "autoplay=0";
	let randomStartParam =
		videoLength != 0 ? "start=" + Math.floor(Math.random() * (videoLength * 60 * 0.75)) : "start=0";
	let loopParam = isLoop ? "loop=1&playlist=" + ytId : "loop=0";

	let url = "http://www.youtube.com/embed/" + ytId + "?" + autoplayParam + "&" + randomStartParam + "&" + loopParam;
	console.log("parseYtIdToEmbedUrl: " + url);
	return url;
}

function createYTEmbed(appendToId: string, ytUrl: string, asAudioPlayer = false) {
	const iframe = document.createElement("iframe");
	const width = asAudioPlayer ? 560 : 560;
	const height = asAudioPlayer ? 25 : 315;
	let attr2 = [
		"ytEmbed",
		"560",
		"315",
		ytUrl,
		"Player",
		"0",
		"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
	];
	["id", "width", "height", "src", "title", "frameborder", "allow"].forEach((attr1) => {
		if (attr2.length > 0) {
			iframe.setAttribute(attr1, attr2.shift()!);
		}
	});
	document.getElementById(appendToId)?.appendChild(iframe);
}

async function youTubeSearchRequest(
	searchString: string,
	maxResults: number = 5,
	type: "video" | "channel" | "playlist" = "video"
) {
	const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${searchString}&type=${type}&key=${process.env.YT_API_KEY}`;
	try {
		const res = await fetch(url);
		const data = await res.json();
		console.log("Search Response:")
		console.log(data);

		return data.items;
	} catch (err) {
		console.error(err);
		return [];
	}
}

function youTubeSongSearch(searchString: string, type: "music" | "ambience", maxResults: number = 3) {
	const dndSearch = "fantasy dnd " + type + " " + searchString;
	return youTubeSearchRequest(dndSearch, maxResults, "video");
}

interface YTPlayer {
	song: Song | undefined;
	api: YouTubePlayer;
	type: "music" | "ambience";
	container: HTMLDivElement;
	playerId: number;
	//TODO: add rest
}

type Songtypes = "music" | "ambience";

export {
	appendMusicPlayer,
	youTubeSearchRequest,
	appendAmbiencePlayerPopup,
	YTPlayer,
	Songtypes,
	extractYtIdFromLink,
	parseYtIdToEmbedLink,
	createYTEmbed,
	playYtUrl,
	playRandomTime,
	playMusic,
	appendAmbiencePlayer,
	setAmbiencePlayerState,
	closePlayer,
	youTubeSongSearch,
};
