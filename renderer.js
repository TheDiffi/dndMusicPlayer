// This file is required by the index.html file and will
// be executed in the renderer process for that window.
const { ipcRenderer } = require('electron');
console.log('renderer log');


bootup();


//___________________BOOTUP_____________________

function bootup() {
    ipcRenderer.send('load-songs');

}

//async response for ipcRenderer.send('load-songs')
//generates the song buttons
ipcRenderer.on('return-songs', (event, songs) => {
    songs.music.forEach((elm) => { generateMusicBtn(elm) });
    songs.ambience.forEach((elm) => { generateAmbienceBtn(elm) });
})


//generate Music Button Function
function generateMusicBtn(music) {
    let parent = document.getElementById("musicBox");

    //button
    const button = document.createElement('a');
    button.setAttribute('class', 'btn music-btn');
    button.setAttribute('id', music.topic);
    button.setAttribute('function', 'play');
    button.innerHTML = music.topic.charAt(0).toUpperCase() + music.topic.slice(1);

    parent.appendChild(button);
    
    button.addEventListener('click', () => {musicButtonOnClick(button)});
}


//generate Ambience Button Function
function generateAmbienceBtn(ambience) {
    let parent = document.getElementById("ambienceBox");

    //button
    const button = document.createElement('a');
    button.setAttribute('class', 'btn ambience-btn');
    button.setAttribute('id', ambience.topic);
    button.setAttribute('function', 'play');
    button.innerHTML = ambience.topic.charAt(0).toUpperCase() + ambience.topic.slice(1);


    button.addEventListener('click', () => {ambienceButtonOnClick(button)});

    //span
    const spanId = `${ambience.topic}Reply`;
    const span = document.createElement('span');
    span.setAttribute('class', 'ambienceResponse bg-color-7');
    span.setAttribute('id', spanId);

    parent.appendChild(button);
    parent.appendChild(span);
}




//__________________RUNTIME___________________
//TODO: refractore
function generateAmbiencePauseBtn(element, elId) {
    const btnId = `${elId}PauseBtn`;

    const button = document.createElement('a');
    button.setAttribute('class', 'btn ambiencePauseBtn');
    button.setAttribute('id', btnId);
    button.innerHTML = '🛑 ' + element.innerHTML;

    element.parentElement.appendChild(button);

    button.addEventListener('click', () => {
        ipcRenderer.send('ambience-quit', button.id);
    });

    return button;
}

//close all ambience button
const cButton = document.getElementById('closeAll');
cButton.addEventListener('click', () => {
    if (document.getElementsByClassName("btn ambiencePauseBtn").length > 0) {
        ipcRenderer.send('ambience-quit', cButton.id);
    }
});


ipcRenderer.on('ambience-delete-btn', (event, btnId) => {
    if (btnId !== 'closeAll') {
        deleteBtn(btnId);
    } else {
        deleteAllAmbienceBtns();
    }
});

function deleteBtn(btnId) {
    const btn = document.getElementById(btnId);
    btn.parentNode.removeChild(btn);
}

function deleteAllAmbienceBtns() {
    const allBtns = document.getElementsByClassName("btn ambiencePauseBtn");
    Array.from(allBtns).forEach((btn) => { btn.parentNode.removeChild(btn) })
}


//_________________________BUTTONS___________________________________

function musicButtonOnClick(button) {
    switch (button.getAttribute('function')) {
        case 'play':
            playMusicFromButton(button);
            break;
        case 'stop':
            //TODO: figure out how to stop YT embed
            break;
        case 'delete':
            deleteSongFromButton(button);
            break;
        case 'edit':
            //TODO: edit buttons
            break;
    }
}

function playMusicFromButton(button) {
    let song = ipcRenderer.sendSync('song-request', button.id, 'music')
    playYtVideo(parseYtIdToEmbedUrl(song.id, song.length, true, true));
    setPlaying(button.id);
    console.log(`Playing ${JSON.stringify(song)}`);

}

function ambienceButtonOnClick(button) {

    switch (button.getAttribute('function')) {
        case 'play':
            if (ipcRenderer.sendSync('ambience-duplicate-check', button.id)) {
                ipcRenderer.send('ambience-request', button.id, generateAmbiencePauseBtn(button, button.id).id);
            }
            break;
        case 'stop':
            //TODO: figure out how to stop YT embed
            break;
        case 'delete':
            deleteSongFromButton(button);
            break;
        case 'edit':
            //TODO: edit buttons
            break;
    }
}



//__________________________ADD SONG________________________________
document.getElementById("btn-add-song").addEventListener('click', () => {
    console.log('Clicked Add Song Button!');
    ipcRenderer.send('add-song-popup');
});

ipcRenderer.on('add-song-button', (event, song) => {
    console.log('Adding Button...');
    switch (song.type) {
        case 'music': generateMusicBtn(song); break;
        case 'ambience': generateAmbienceBtn(song); break;
    }

});


//_______________DELETE SONG_________________________
document.getElementById("btn-delete-song").addEventListener('click', () => {
    console.log('Clicked Delete Song Button!');
    toggleDelPreview();
});

function toggleDelPreview() {
    let allAmbBtns = document.getElementsByClassName("btn ambience-btn");
    Array.from(allAmbBtns).forEach((btn) => {
        toggleDeleteHtml(btn)
    });

    let allMusBtns = document.getElementsByClassName("btn music-btn");
    Array.from(allMusBtns).forEach((btn) => {
        toggleDeleteHtml(btn)
    });
}

function toggleDeleteHtml(elem) {
    if (elem.className.includes('delete')) {
        elem.className = elem.className.replace(' delete', '');
        elem.innerHTML = elem.innerHTML.replace(' 🗑️', '');
        elem.setAttribute('function', 'play')

    } else {
        elem.className = elem.className + ' delete';
        elem.innerHTML = elem.innerHTML + ' 🗑️';
        elem.setAttribute('function', 'delete')
    }
}

function deleteSongFromButton(button){
    //remove from runtime & storage
    console.log(button.className.replace(/btn |-|delete/g,''));
    ipcRenderer.send('delete-song', button.id, button.className.replace(/btn| |-|delete|playing/g,''))
    //remove from html
    button.parentNode.removeChild(button);
}


// _______________YOUTUBE_____________________

const submitBtn = document.getElementById('submitBtn');
submitBtn.addEventListener('click', submitYtUrl);

function submitYtUrl(e) {
    const ytUrl = document.querySelector('#ytUrl').value;
    if (ytUrl !== null) {
        playYtVideo(parseYtIdToEmbedUrl(extractYtIdFromLink(ytUrl)));
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

function parseYtIdToEmbedUrl(ytId, videoLength = 0, isAutoplay = false, isLoop = false) {
    let autoplayParam = isAutoplay ? 'autoplay=1' : 'autoplay=0';
    let randomStartParam = videoLength != 0 ? 'start=' + Math.floor((Math.random() * ((videoLength * 60) * 0.75))) : 'start=0';
    let loopParam = isLoop ? 'loop=1&playlist=' + ytId : 'loop=0';

    let url = 'http://www.youtube.com/embed/' + ytId + '?' + autoplayParam + '&' + randomStartParam + '&' + loopParam;
    console.log('parseYtIdToEmbedUrl: ' + url);
    return url;
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
    let btns = document.getElementsByClassName('music-btn');

    //deletes 'playing' for all music buttons
    for (const btn of btns) {
        btn.className = btn.className.replace(' playing', '')
        btn.setAttribute('function', 'play');
    }

    //sets playing for the music button
    document.getElementById(idPlaying).setAttribute('function', 'stop');
    document.getElementById(idPlaying).className += ' playing';
}

//----------------------------other-------------------------------

const sButton = document.getElementById('ri-roll');
sButton.addEventListener('click', () => {
    playYtVideo('https://www.youtube.com/embed/iik25wqIuFo?autoplay=1');
});



//____________________TESTING_________________
const testBtn = document.getElementById('testBtn');

testBtn.addEventListener('click', () => {
    ipcRenderer.send('test-send', 'test')
});

ipcRenderer.on('test-reply', (event, arg) => {
    const message = `Reply: ${arg}`
    document.getElementById('test-reply').innerHTML = message
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







