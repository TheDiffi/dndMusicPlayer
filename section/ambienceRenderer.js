// This file is required by the index.html file and will
// be executed in the renderer process for that window.

console.log('renderer log');

const { ipcRenderer } = require('electron');
var pauseButtonId = null;

//------------ Music Buttons ------------------------

ipcRenderer.on('play-ambience', (event, musicId, buttonId) => {
    //saves the pauseButtonId 
    pauseButtonId = buttonId

    let url = ipcRenderer.sendSync('music-request', musicId);
    console.log(url);
    if (url) {
        playYtVideo(url);
    }

})


function playYtVideo(url) {
    document.getElementById('ytEmbed').src = url;
}

const exitBtn = document.getElementById('exitBtn');
exitBtn.addEventListener('click', () => {
    ipcRenderer.send('ambience-quit', pauseButtonId);

}); 

