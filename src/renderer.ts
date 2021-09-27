import { extractYtIdFromLink, parseYtIdToEmbedUrl, playYtUrl } from "./util/yt.util";

// This file is required by the index.html file and will
export{ipcRenderer, Song}
// be executed in the renderer process for that window.
const { ipcRenderer } = require("electron");
console.log("Main Renderer: started");

bootup();

//___________________BOOTUP_____________________

function bootup() {
  ipcRenderer.send("load-songs");
}

//async response for ipcRenderer.send('load-songs')
//generates the song buttons
ipcRenderer.on(
  "return-songs",
  (event: Event, songs: { music: Array<Song>; ambience: Array<Song> }) => {
    songs.music.forEach((elm) => {
      generateMusicBtn(elm);
    });
    songs.ambience.forEach((elm) => {
      generateAmbienceBtn(elm);
    });
  }
);

//generate Music Button Function
function generateMusicBtn(music: Song) {
  let parent = document.getElementById("musicBox");

  if (!parent) {
    throw Error("Could not generate MusicBtn: musicBox Element not found");
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
function generateAmbienceBtn(ambience: Song) {
  let parent = document.getElementById("ambienceBox");
  if (!parent) {
    throw Error("Could not generate MusicBtn: ambienceBox Element not found");
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

//__________________RUNTIME___________________
//TODO: refractore
function generateAmbiencePauseBtn(element: HTMLElement, elId: string) {
  const btnId = `${elId}PauseBtn`;

  const button = document.createElement("a");
  button.setAttribute("class", "btn ambiencePauseBtn");
  button.setAttribute("id", btnId);
  button.innerHTML = "🛑 " + element.innerHTML;

  element.parentElement?.appendChild(button);

  button.addEventListener("click", () => {
    ipcRenderer.send("ambience-quit", button.id);
  });

  return button;
}

//close all ambience button
const cButton = document.getElementById("closeAll");
cButton?.addEventListener("click", () => {
  if (document.getElementsByClassName("btn ambiencePauseBtn").length > 0) {
    ipcRenderer.send("ambience-quit", cButton.id);
  }
});

ipcRenderer.on("ambience-delete-btn", (event: Event, btnId: string) => {
  if (btnId !== "closeAll") {
    deleteBtn(btnId);
  } else {
    deleteAllAmbienceBtns();
  }
});

function deleteBtn(btnId: string) {
  const btn = document.getElementById(btnId);
  btn?.parentNode?.removeChild(btn);
}

function deleteAllAmbienceBtns() {
  const allBtns = document.getElementsByClassName("btn ambiencePauseBtn");
  Array.from(allBtns).forEach((btn) => {
    btn.parentNode?.removeChild(btn);
  });
}

//_________________________BUTTONS___________________________________

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
  let song = ipcRenderer.sendSync("song-request", button.id, "music");
  playYtUrl(parseYtIdToEmbedUrl(song.id, song.length, true, true));
  setPlaying(button);
  console.log(`Playing ${JSON.stringify(song)}`);
}

function ambienceButtonOnClick(button: HTMLElement) {
  switch (button.getAttribute("function")) {
    case "play":
      if (ipcRenderer.sendSync("ambience-duplicate-check", button.id)) {
        ipcRenderer.send(
          "ambience-request",
          button.id,
          generateAmbiencePauseBtn(button, button.id).id
        );
      }
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

//__________________________ADD SONG________________________________
document.getElementById("btn-add-song")?.addEventListener("click", () => {
  console.log("Clicked Add Song Button!");
  ipcRenderer.send("add-song-popup");
});

ipcRenderer.on("add-song-button", (event: Event, song: Song) => {
  console.log("Adding Button...");
  switch (song.type) {
    case "music":
      generateMusicBtn(song);
      break;
    case "ambience":
      generateAmbienceBtn(song);
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
    "delete-song",
    button.id,
    button.className.replace(/btn| |-|delete|playing/g, "")
  );
  //remove from html
  button.parentNode?.removeChild(button);
}


// _______________YOUTUBE_____________________

const submitBtn = document.getElementById("submitBtn");
submitBtn?.addEventListener("click", () => {
  const ytUrl = document.querySelector("#ytUrl")?.getAttribute("value");
  if (ytUrl) {
    playYtUrl(parseYtIdToEmbedUrl(extractYtIdFromLink(ytUrl)));
  }
});

function setPlaying(btnPlaying: HTMLElement) {
    let btns = document.getElementsByClassName("music-btn");
  
    //deletes 'playing' for all music buttons
    Array.from(btns, btn =>{
      btn.className = btn.className.replace(" playing", "");
      btn.setAttribute("function", "play");
    })
   
  
    //sets playing for the music button
    btnPlaying.setAttribute("function", "stop");
    btnPlaying.setAttribute("class", btnPlaying.className + " playing");
  }

//----------------------------other-------------------------------

const sButton = document.getElementById("ri-roll");
sButton?.addEventListener("click", () => {
  playYtUrl("https://www.youtube.com/embed/iik25wqIuFo?autoplay=1");
});


interface Song {
    topic: string;
    id: string;
    length: number;
    type: string;
  }
  

//____________________TESTING_________________
const testBtn = document.getElementById("testBtn");
testBtn?.addEventListener("click", () => {
  ipcRenderer.send("test-send", "test");
});

ipcRenderer.on("test-reply", (event: Event, arg: string) => {
  const message = `Reply: ${arg}`;
  document.getElementById("test-reply")?.setAttribute("innerHTML", message);
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
