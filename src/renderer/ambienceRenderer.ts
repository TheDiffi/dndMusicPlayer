// This file is required by the index.html file and will

import { extractYtIdFromLink, parseYtIdToEmbedUrl, playYtUrl } from "../util/yt.util";

// be executed in the renderer process for that window.
export{}
const { ipcRenderer } = require("electron");

console.log("AmbienceRenderer: started");

var pauseButtonId: null = null;

//------------ Music Buttons ------------------------

ipcRenderer.on("play-ambience", (event: any, musicId: any, buttonId: null) => {
  //saves the pauseButtonId
  pauseButtonId = buttonId;

  let song = ipcRenderer.sendSync("song-request", musicId, "ambience");
  console.log("Got from song-request the ytId in ambience-renderer: " + song);
  if (song) {
    playYtUrl(parseYtIdToEmbedUrl(song.id, 0, true, true));
  }
});


const exitBtn = document.getElementById("exitBtn");
exitBtn?.addEventListener("click", () => {
  ipcRenderer.send("ambience-quit", pauseButtonId);
});

const submitBtn = document.getElementById("submitBtn");
submitBtn?.addEventListener("click", () => {
  const ytUrl = document.querySelector("#ytUrl")?.getAttribute("value");
  if (ytUrl) {
    playYtUrl(parseYtIdToEmbedUrl(extractYtIdFromLink(ytUrl)));
  }
});

