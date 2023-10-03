// This file is required by the index.html file and will

import { IpcS, IpcR } from "../util/types.util";
import { extractYtIdFromLink, parseYtIdToEmbedLink, playYtUrl } from "../util/yt.util";

// be executed in the renderer process for that window.

const { ipcRenderer } = require("electron");

console.log("AmbienceRenderer: started");

var closeBtnId: string;

//------------ Music Buttons ------------------------

ipcRenderer.on(IpcR.playAmbience, (event: any, ambienceId: string) => {
	let song = ipcRenderer.sendSync(IpcS.songRequest, ambienceId, "ambience");
	console.log("Got from song-request the ytId in ambience-renderer: " + song);

	if (song) {
		playYtUrl(parseYtIdToEmbedLink(song.id, true, true, 0));
	}

	//saves the pauseButtonId
	closeBtnId = ambienceId;
});

const exitBtn = document.getElementById("exitBtn");
exitBtn?.addEventListener("click", () => {
	ipcRenderer.send(IpcS.ambienceClose, closeBtnId);
});
