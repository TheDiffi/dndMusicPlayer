// This file is required by the index.html file and will
// be executed in the renderer process for that window.

console.log('renderer log');

const { ipcRenderer, ipcMain } = require('electron');


document.getElementById("submit").addEventListener('click', () => {

    if (checkInput()) {
        let songTopic = document.getElementById('topicInput').value;
        let songId = extractYtIdFromLink(document.getElementById('urlInput').value);
        let songLength = document.getElementById('lengthInput').value;
        let songType =  document.getElementById('typeInput').value;
        let song = { topic: songTopic, id: songId, length: songLength, type: songType }

        //sends the data
        ipcRenderer.send('add-song', song);

        window.close();
    } else {
        
    }



})

function checkInput() {
    let state = true;

    //checks if there is content in each box
    let aButtons = document.getElementsByTagName('input');
    for (const elem of aButtons) {
        document.getElementById('errorMessage').innerHTML = ""
        if (!elem.value) {
            state = false
            if (elem.className.indexOf(' error') == -1) {
                elem.className = elem.className + ' error'
                console.log('error:' + elem + '; ' + elem.className);
            }
            document.getElementById('errorMessage').innerHTML = "Please fill out all rows!"

        } else {
            if (elem.className.indexOf(' error') != -1) {
                elem.className = elem.className.replace(' error', '');
                console.log('repaired' + elem + '; ' + elem.className);
            }
        }
    }

    //checks if url is a yt link
    let urlInput = document.getElementById('urlInput')
    if (!extractYtIdFromLink(urlInput.value)) {
        state = false
        if (urlInput.className.indexOf(' error') == -1) {
            urlInput.className = urlInput.className + ' error';
        }
        document.getElementById('errorMessage').innerHTML = "Please enter a valid URL!"
    }

    return state;
}

function extractYtIdFromLink(ytUrl) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = ytUrl.match(regExp);

    return (match && match[7].length == 11) ? match[7] : false;
};

