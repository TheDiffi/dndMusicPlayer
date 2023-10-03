import {
  extractYtIdFromLink,
  createNewYTPlayer,
  YTPlayer,
  YTPlayerType
} from "./util/yt.util";
import YouTubeApiEmbed from "youtube-player";
import { ipcRenderer } from "electron";

// This file is required by the index.html file and will
export { ipcRenderer };

//globals
const ytPlayers: YTPlayer[] = new Array();
let ytMusicPlayer: YTPlayer = null;
let currentProfile: Profile;

// be executed in the renderer process for that window.
console.log("Main Renderer: started");

bootup();

//___________________BOOTUP_____________________

function bootup() {
  ytPlayers.push(
    createNewYTPlayer("content-right-side", "VZYr1eyC81g", YTPlayerType.music, "ytPlayer")
  );
  loadProfile(
    (<HTMLInputElement>document.getElementById("profile-selector")).value
  );
  // loadSongs() 
}

//__________________PROFILES_____________________

function loadProfile(profileId: string) {
  ipcRenderer.send(IpcChannelsSend.getProfile);
  ipcRenderer.on(IpcChannelsReturn.returnSongs, (event: Event, profile: Profile) => {
    currentProfile = profile;
    renderProfile(profile);
  });
}

function renderProfile(profile: Profile) {
  //get songs from ids
  var musicList:Song[] = ipcRenderer.sendSync(IpcChannelsSend.getSongs, profile.musicIds);
  var ambienceList:Song[] = ipcRenderer.sendSync(IpcChannelsSend.getSongs, profile.ambienceIds);

  //generate song buttons
  musicList.forEach((music: Song) => generateMusicBtn(music, docIds.containerMusicBtns));
  ambienceList.forEach((ambience: Song) => generateMusicBtn(ambience, docIds.containerAmbienceBtns));

  //play default
  if(profile.defaultMusic){
    let defaultSong = ipcRenderer.sendSync(IpcChannelsSend.getSong, profile.defaultMusic)
    //playnextSong(defaultSong)

  }
}

//_________________________SONG BUTTONS___________________________________


//generate Music Button Function
function generateMusicBtn(music: Song, parentId: string) {
  let parent = document.getElementById(parentId);

  if (!parent) {
    throw Error("Could not generate MusicBtn: parent Element not found");
  }

  //button
  const button = document.createElement("a");
  button.setAttribute("class", "btn music-btn");
  button.setAttribute("id", music.topic);
  button.setAttribute("function", "play");
  button.innerHTML = music.topic.charAt(0).toUpperCase() + music.topic.slice(1);

  parent.appendChild(button);

  button.addEventListener("click", () => {
    musicButtonOnClick(button);
  });
}

//generate Ambience Button Function
function generateAmbienceBtn(ambience: Song, parentId: string) {
  let parent = document.getElementById(parentId);
  if (!parent) {
    throw Error("Could not generate AmbienceBtn: parent Element not found");
  }

  //button
  const button = document.createElement("a");
  button.setAttribute("class", "btn ambience-btn");
  button.setAttribute("id", ambience.topic);
  button.setAttribute("function", "play");
  button.innerHTML =
    ambience.topic.charAt(0).toUpperCase() + ambience.topic.slice(1);

  button.addEventListener("click", () => {
    ambienceButtonOnClick(button);
  });

  //span
  const spanId = `${ambience.topic}Reply`;
  const span = document.createElement("span");
  span.setAttribute("class", "ambienceResponse bg-color-7");
  span.setAttribute("id", spanId);

  parent.appendChild(button);
  parent.appendChild(span);
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
  let song: Song = ipcRenderer.sendSync(IpcChannelsSend.songRequest, button.id, "music");

  if (playMusicFromYtId(button.id)) {
    setMusicButtonToPlaying(button);
    console.log(`Playing ${JSON.stringify(song)}`);
  }
}

function playMusicFromYtId(ytId: string): boolean {
  ytPlayers?.forEach((player: YTPlayer) => {
    if (player.type === "music") {
      player.api.loadVideoById(ytId);
      return true;
    }
  });
  return false;
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
      ipcRenderer.sendSync(IpcChannelsSend.ambienceRequest, button.id);
      setAmbienceButtonToPlaying(button);

      break;
    case "stop":
      ipcRenderer.send(IpcChannelsSend.ambienceClose, button.id);
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

ipcRenderer.on(IpcChannelsReturn.ambienceClosed, (event: Event, ambienceId: string) => {
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
  ipcRenderer.send(IpcChannelsSend.addSongPopup);
});

ipcRenderer.on(IpcChannelsReturn.addSongButton, (event: Event, song: Song) => {
  console.log("Adding Button...");
  switch (song.type) {
    case "music":
      generateMusicBtn(song, "musicBox");
      break;
    case "ambience":
      generateAmbienceBtn(song, "ambienceBox");
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
  ipcRenderer.send(
    IpcChannelsSend.deleteSong,
    button.id,
    button.className.replace(/btn| |-|delete|playing/g, "")
  );
  //remove from html
  button.parentNode?.removeChild(button);

  //toggles the delete function
  toggleDelPreview();
}

//__________________OTHER EVENTS___________________

const addEmbedBtn = document.getElementById("create-embed");

addEmbedBtn.addEventListener("click", () => {
  let newPlayer = createNewYTPlayer(
    "content-right-side",
    "VZYr1eyC81g",
    YTPlayerType.ambience,
    "ytPlayer"
  );
  ytPlayers.push(newPlayer);
});

//close all ambience button
const cButton = document.getElementById("closeAll");
cButton?.addEventListener("click", () => {
  ipcRenderer.send(IpcChannelsSend.ambienceClose, "closeAll");
});

const submitBtn = document.getElementById("submitBtn");
submitBtn?.addEventListener("click", () => {
  const ytUrl = (<HTMLInputElement>document.getElementById("ytUrl")).value;
  console.log(ytUrl);
  if (ytUrl) {
    playMusicFromYtId(extractYtIdFromLink(ytUrl));
  }
});



//----------------------------other-------------------------------

export interface Song {
  topic: string;
  id: string;
  length: number;
  type: string;
}

interface Songs {
  music: Song[];
  ambience: Song[];
}

interface Profile {
  name: string;
  id: string;
  musicIds: string[];
  ambienceIds: string[];
  defaultMusic?: string;
}

//____________________TESTING_________________
const testBtn = document.getElementById("testBtn");
testBtn?.addEventListener("click", () => {
  console.log(document.getElementsByClassName("btn ambience-btn").length);

  ipcRenderer.send(IpcChannelsSend.testSend, "test");
});

ipcRenderer.on(IpcChannelsReturn.testReply, (event: Event, arg: string) => {
  const message = `Reply: ${arg}`;
  document.getElementById("test-reply")?.setAttribute("innerHTML", message);
});

const sButton = document.getElementById("ri-roll");
sButton?.addEventListener("click", () => {
  playMusicFromYtId("iik25wqIuFo");
});


const docIds = {
  containerMusicBtns: 'music-button-container',
  containerAmbienceBtns: 'ambience-button-container'
}

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
