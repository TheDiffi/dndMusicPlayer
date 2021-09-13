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

ipcMain.on('music-request', (event, songTopic, songType) => {

    switch (songType) {
        case "music":
            event.returnValue = musicSongs.get(songTopic);
            break;
        case "ambience":
            event.returnValue = ambienceSongs.get(songTopic);
            break;

    }


    /*     let song;
        switch (songTopic) {
            case 'tavern':
                song = { topic: "tavern", id: 'dd10InDdvJE', length: 60 };
                break;
            case 'battle':
                song = { topic: "battle", id: 'lAGm9MTyRJ8', length: 58 };
                break;
            case 'village':
                song = { topic: "village", id: 'Wd3kd0zY2bQ', length: 60 };
                break;
            case 'forest':
                song = { topic: "forest", id: '6Em9tLXbhfo', length: 170 };
                break;
            case 'field':
                song = { topic: "field", id: '0qcsdctvhTM', length: 140 };
                break;
            case 'rain':
                song = { topic: "rain", id: 'KSSpVMIgN2Y', length: 180 };
                break;
            case 'chatter':
                song = { topic: "chatter", id: 'EULoybB2Nsw', length: 180 };
                break;
            case 'swords':
                song = { topic: "swords", id: 'oBsHWwmXbcM', length: 60 };
                break;
            case 'war':
                song = { topic: "war", id: '0rl7AatkjfA', length: 170 };
                break;
    
        }
    
        event.returnValue = song; */

});


function loadSongs() {

    //Check if file exists
    if (fs.existsSync(filepathSongs)) {
        //reads and parses json file
        let songs = JSON.parse((fs.readFileSync(filepathSongs, 'utf8')));
        console.log('Reading songs...');

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

    } else {
        console.log("File Doesn\'t Exist. Creating new file.")
        fs.writeFile(filepathSongs, '', (err) => {
            if (err) {
                console.log(err)
            }
        })
    }
}

function appendSongToJson(song) {
    //reads the data
    let data = JSON.parse((fs.readFileSync(filepathSongs, 'utf8')));


    //modifies the object
    if (song.type === 'music') {
        delete song.type;
        console.log(song.type + ': type');

        data.music.push(song);
    } else if (song.type === 'ambience') {
        delete song.type;
        console.log(song.type + ': type');

        data.ambience.push(song);
    }


    //stringifies the object and overwrites the file
    fs.writeFileSync(filepathSongs, JSON.stringify(data), (err) => {
        console.log("Could not append to file in song-request")
    })

    //whole system is bad optimation wise but reliable 
}

