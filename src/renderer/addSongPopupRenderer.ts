// This file is required by the index.html file and will

import { extractYtIdFromLink } from "../util/yt.util";

// be executed in the renderer process for that window.
export{}
const { ipcRenderer } = require("electron");


console.log('addSongRenderer: started');

document.getElementById("submit")?.addEventListener('click', () => {

    if (checkInput()) {
        //reads the user Input
        let songTopic =  (<HTMLInputElement>document.getElementById('topicInput'))?.value;
        let songId = extractYtIdFromLink((<HTMLInputElement>document.getElementById('urlInput'))?.value);
        let songLength = (<HTMLInputElement>document.getElementById('lengthInput'))?.value;
        let songType = (<HTMLInputElement>document.getElementById('typeInput'))?.value;

        let song = { topic: songTopic, id: songId, length: songLength, type: songType }

        //sends the data
        ipcRenderer.send('add-song', song);

        window.close();
    }

})


function checkInput() {
    let state = true;

    //checks if there is content in each box
    let aButtons = document.getElementsByTagName('input');
    Array.from(aButtons, elem =>{
        document.getElementById('errorMessage')?.setAttribute('innerHTML', "");
        if (!elem.value) {
            state = false
            if (elem.className.indexOf(' error') == -1) {
                elem.className = elem.className + ' error'
                console.log('error:' + elem + '; ' + elem.className);
            }
            document.getElementById('errorMessage')?.setAttribute('innerHTML',"Please fill out all rows!");

        } else {
            if (elem.className.indexOf(' error') != -1) {
                elem.className = elem.className.replace(' error', '');
                console.log('repaired' + elem + '; ' + elem.className);
            }
        }
    })


    //checks if url is a yt link
    let urlInput = document.getElementById('urlInput')
    if (urlInput && urlInput.getAttribute('value') && !extractYtIdFromLink(urlInput.getAttribute('value')!)) {
        state = false
        if (urlInput.className.indexOf(' error') == -1) {
            urlInput.className = urlInput.className + ' error';
        }
        document.getElementById('errorMessage')?.setAttribute('innerHTML', "Please enter a valid URL!");
    }

    return state;
}




