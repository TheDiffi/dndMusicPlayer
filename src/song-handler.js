const { ipcMain } = require('electron');
let fs = require('fs');

const musicSongs = new Map(/*key=topic, value=songObj*/);
const ambienceSongs = new Map(/*key=topic, value=songObj*/);
const filepathSongs = "./assets/data/songs.json";


ipcMain.on('load-songs', (event) => {
    //reads and sends the songs to the renderer
    event.sender.send('return-songs', loadSongs());

})


ipcMain.on('add-song', (event, song) => {
    console.log(song + ' song-request');
    appendSongToJson(song);
    loadSongs();

})

ipcMain.on('song-request', (event, songTopic, songType) => {
    event.returnValue = getSongFromTopicAndType(songTopic, songType);
});


ipcMain.on('delete-song', (event, songTopic, songType) => {
    let song = getSongFromTopicAndType(songTopic, songType)
    deleteSongFromJson(song);
    deleteSongFromLists(song);

});

function deleteSongFromLists(song) {
    if (song.type === 'music') {
        musicSongs.delete(song.topic)

    } else if (song.type === 'ambience') {
        ambienceSongs.delete(song.topic)

    } else { console.warn(`UNEXPECTED EVENT in src/song-handler/deleteSong(Z.96): songType is neither ambience nor music. Song Type = ${song.type}, Song = ${song}`) }
}


function getSongFromTopicAndType(songTopic, songType='') {
    let song;
    console.log(songType)
    switch (songType) {
        case "music":
            song = musicSongs.get(songTopic);
            break;
        case "ambience":
            song = ambienceSongs.get(songTopic);
            break;
        default:
            console.log(`CONTROL`);     
            song = musicSongs.get(songTopic);
            song = ambienceSongs.get(songTopic);
    }
    console.log(`Found Song ${JSON.stringify(song)} from topic: ${songTopic}`);
    return song;
}


function loadSongs() {

    console
    //reads and parses json file
    let songs = readSongsJson();

    //clears and fills the maps
    musicSongs.clear();
    songs.music.forEach((music) => {
        musicSongs.set(music.topic, music);
    });

    ambienceSongs.clear();
    songs.ambience.forEach((ambience) => {
        ambienceSongs.set(ambience.topic, ambience);
    });
    return songs;
}

function appendSongToJson(song) {
    //reads the data
    let data = readSongsJson();

    //modifies the object
    if (song.type === 'music') {
        data.music.push(song);
        console.log(song.type + ': type');

    } else if (song.type === 'ambience') {
        data.ambience.push(song);
        console.log(song.type + ': type');

    }

    //stringifies the object and overwrites the file
    writeSongsJson(JSON.stringify(data));

    //whole system is bad optimation wise but reliable 
}



function deleteSongFromJson(songToDel) {
    //reads the data
    let data = readSongsJson();
    let found = false;

    //searches music & ambience and deletes the song
    if (songToDel.type === 'music') {
        data.music.forEach((elem) => {
            if (elem.id === songToDel.id) {
                data.music.splice(data.music.indexOf(elem), 1);
                console.log(`Removed ${elem.topic}`);
                return;
            }
        })
    }

    else if (songToDel.type === 'ambience') {
        data.ambience.forEach((elem) => {
            if (elem.id === songToDel.id) {
                data.music.splice(data.music.indexOf(elem), 1);
                console.log(`Removed ${elem.topic}`);
                return;
            }
        })
    }
    else {
        console.warn(`UNEXPECTED EVENT in src/song-handler/deleteSong(Z.96): songType is neither ambience nor music. Song Type = ${song.type}`)
    }

    //stringifies the new object and overwrites the file
    writeSongsJson(JSON.stringify(data));

    //whole system is bad optimation wise but reliable 
}



function readSongsJson() {
    //Check if file exists
    if (fs.existsSync(filepathSongs)) {
        //reads and parses json file
        console.log('Reading songs...');
        let songs = JSON.parse((fs.readFileSync(filepathSongs, 'utf8')));
        return songs;

    } else {
        console.log("File Doesn\'t Exist. Creating new file.")
        fs.writeFile(filepathSongs, '', (err) => {
            if (err) {
                console.log(err)
            }
        })
    }

}

function writeSongsJson(content, path = filepathSongs) {
    fs.writeFileSync(path, content, (err) => {
        console.log("Could not append to file in song-request")
    })
}

