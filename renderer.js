// This file is required by the index.html file and will
// be executed in the renderer process for that window.

console.log('renderer log');

const { ipcRenderer } = require('electron');


//------------ Music Buttons ------------------------
var mButtons = document.getElementsByClassName("btn music-btn");
//for each Music Button -> add an Event Listener
Array.from(mButtons).forEach((el) => {
  let elId = el.getAttribute('id');
  el.addEventListener('click', () => {
    let url = ipcRenderer.sendSync('music-request', elId)
    console.log(url);
    if (url) {
      playYtVideo(url);
      setPlaying(elId);
    } else {
      console.log('ERROR: button not configued yet. url = null');
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
}

function appendPauseBtn(element, elId) {
  const btnId = `${elId}PauseBtn`;

  const button = document.createElement('button');
  button.setAttribute('class', 'btn ambiencePauseBtn');
  button.setAttribute('id', btnId);
  button.innerHTML = 'Pause ' + element.innerHTML;

  element.parentElement.appendChild(button);

  button.addEventListener('click', () => {
    ipcRenderer.send('ambience-quit', button.id);
  });

  return button;
}

const cButton = document.getElementById('closeAll');
cButton.addEventListener('click', () => {
  if (document.getElementsByClassName("btn ambiencePauseBtn").length > 0) {
    ipcRenderer.send('ambience-quit', cButton.id);
  }
});


ipcRenderer.on('ambience-delete-btn', (event, btnId) => {
  if (btnId === 'closeAll') {
    deleteAllAmbienceBtns();

  } else {
    deleteBtn(btnId);
   
  }
});

function deleteBtn(btnId){
  const btn = document.getElementById(btnId);
  btn.parentNode.removeChild(btn);
}

function deleteAllAmbienceBtns(){
  const allBtns = document.getElementsByClassName("btn ambiencePauseBtn");
  Array.from(allBtns).forEach((btn) => { btn.parentNode.removeChild(btn) })
}

//----------------------------other-------------------------------

const sButton = document.getElementById('ri-roll');
sButton.addEventListener('click', () => {
  playYtVideo('https://www.youtube.com/embed/iik25wqIuFo?autoplay=1');
});


// _______________YOUTUBE_____________________

const submitBtn = document.getElementById('submitBtn');
submitBtn.addEventListener('click', submitYtUrl);

function submitYtUrl(e) {
  const ytUrl = document.querySelector('#ytUrl').value;
  if (ytUrl !== null) {
    playYtVideo(parseYtIdToEmbedLink(extractYtIdFromLink(ytUrl)));
  }
};

function playYtVideo(url, appendToId = "ytContainer") {
  if (!document.getElementById('ytEmbed')) {
    createYTEmbed(appendToId, url);
  } else {
    document.getElementById('ytEmbed').src = url;
  }
}

function extractYtIdFromLink(ytUrl) {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = ytUrl.match(regExp);
  console.log((match && match[7].length == 11) ? match[7] : false);
  return (match && match[7].length == 11) ? match[7] : false;
};

function parseYtIdToEmbedLink(ytId, isAutoplay = true) {
  let url = 'http://www.youtube.com/embed/' + ytId
  return isAutoplay ? url + '?autoplay=1' : url;
}

function createYTEmbed(appendToId, ytUrl, asAudioPlayer = false) {
  const iframe = document.createElement("iframe");
  const width = asAudioPlayer ? 560 : 560;
  const height = asAudioPlayer ? 25 : 315;
  let attr2 = ["ytEmbed", "560", "315", ytUrl, "Player", "0", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"];
  ["id", "width", "height", "src", "title", "frameborder", "allow"].forEach((attr1) => {
    console.log(attr1 + " : " + attr2[0]);
    iframe.setAttribute(attr1, attr2.shift());
  });
  const ytContainer = document.getElementById(appendToId);
  ytContainer.appendChild(iframe);

}

function setPlaying(idPlaying) {
  //empties all
  var elsr = document.getElementsByClassName("musicResponse");
  Array.from(elsr).forEach((elr) => {
    elr.innerHTML = "";
  });

  document.getElementById(`${idPlaying}Reply`).innerHTML = 'Playing...'
}


//____________________TESTING_________________
const testBtn = document.getElementById('testBtn');

testBtn.addEventListener('click', () => {
  ipcRenderer.send('test-send', 'test')
});

ipcRenderer.on('test-reply', (event, arg) => {
  const message = `Reply: ${arg}`
  document.getElementById('test-reply').innerHTML = message
});



