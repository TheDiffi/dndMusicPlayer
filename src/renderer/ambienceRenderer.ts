// This file is required by the index.html file and will

import {
  extractYtIdFromLink,
  parseYtIdToEmbedUrl,
  playYtUrl,
} from "../util/yt.util";

// be executed in the renderer process for that window.
export {};
const { ipcRenderer } = require("electron");

console.log("AmbienceRenderer: started");

var closeBtnId: string;

//------------ Music Buttons ------------------------

ipcRenderer.on("play-ambience", (event: any, ambienceId: string) => {
  let song = ipcRenderer.sendSync("song-request", ambienceId, "ambience");
  console.log("Got from song-request the ytId in ambience-renderer: " + song);

  if (song) {
    playYtUrl(parseYtIdToEmbedUrl(song.id, true, true, 0));
  }

  //saves the pauseButtonId
  closeBtnId = ambienceId;
});

const exitBtn = document.getElementById("exitBtn");
exitBtn?.addEventListener("click", () => {
  ipcRenderer.send("ambience-close", closeBtnId);
});
