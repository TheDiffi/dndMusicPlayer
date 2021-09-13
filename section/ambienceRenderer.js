// This file is required by the index.html file and will
// be executed in the renderer process for that window.

console.log('renderer log');

const { ipcRenderer } = require('electron');
var pauseButtonId = null;

//------------ Music Buttons ------------------------

ipcRenderer.on('play-ambience', (event, musicId, buttonId) => {
    //saves the pauseButtonId 
    pauseButtonId = buttonId

    let song = ipcRenderer.sendSync('music-request', musicId, 'ambience');
    console.log('Got from music-request the ytId in ambience-renderer: ' + song);
    if (song) {
        playYtVideo(parseYtIdToEmbedUrl(song.id, 0, true, true));
    }

})


function playYtVideo(url) {
    document.getElementById('ytEmbed').src = url;
}

const exitBtn = document.getElementById('exitBtn');
exitBtn.addEventListener('click', () => {
    ipcRenderer.send('ambience-quit', pauseButtonId);

}); 

function parseYtIdToEmbedUrl(ytId, videoLength = 0, isAutoplay = false, isLoop = false) {
    let autoplayParam = isAutoplay ? 'autoplay=1' : 'autoplay=0';
    let randomStartParam = videoLength != 0 ? 'start=' + Math.floor((Math.random() * ((videoLength * 60) * 0.75))) : 'start=0';
    let loopParam = isLoop ? 'loop=1' : 'loop=0';

    
    let url = 'http://www.youtube.com/embed/' + ytId + '?' + autoplayParam + '&' + randomStartParam + '&' + loopParam;
    console.log('parseYtIdToEmbedUrl: ' + url);
    return url;
  }

