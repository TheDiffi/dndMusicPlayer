import { Song } from "..";
export {};
let fs = require("fs");
var { ipcMain } = require("electron");

const musicSongs = new Map(/*key=topic, value=songObj*/);
const ambienceSongs = new Map(/*key=topic, value=songObj*/);
const filepathSongs = "./assets/data/songs.json";

ipcMain.on("load-songs", (event: any) => {
  //reads and sends the songs to the renderer
  event.sender.send("return-songs", loadSongs());
});

ipcMain.on("add-song", (event: any, song: Song) => {
  console.log(song + " song-request");
  appendSongToJson(song);
  loadSongs();
});

ipcMain.on(
  "song-request",
  (event: any, songTopic: string, songType: string) => {
    event.returnValue = getSongFromTopicAndType(songTopic, songType);
  }
);

ipcMain.on("delete-song", (event: any, songTopic: string, songType: string) => {
  let song = getSongFromTopicAndType(songTopic, songType);
  deleteSongFromJson(song);
  loadSongs();
});

function getSongFromTopicAndType(songTopic: string, songType: string = "") {
  let song;
  switch (songType) {
    case "music":
      song = musicSongs.get(songTopic);
      break;
    case "ambience":
      song = ambienceSongs.get(songTopic);
      break;
    default:
      song = musicSongs.get(songTopic);
      song = ambienceSongs.get(songTopic);
  }
  console.log(`Found Song ${JSON.stringify(song)} from topic: ${songTopic}`);
  return song;
}

function loadSongs() {
  //reads and parses json file
  let songs = readSongsJson();

  if (undefined === songs) {
    throw Error("songs could not be read correctly");
  }
  //clears and fills the maps
  musicSongs.clear();
  songs.music.forEach((music: Song) => {
    musicSongs.set(music.topic, music);
  });

  ambienceSongs.clear();
  songs.ambience.forEach((ambience: Song) => {
    ambienceSongs.set(ambience.topic, ambience);
  });
  return songs;
}

function appendSongToJson(song: Song) {
  //reads the data
  let data = readSongsJson();

  if (undefined === data) {
    throw Error("songs could not be read correctly");
  }
  //modifies the object
  if (song.type === "music") {
    data.music.push(song);
    console.log(song.type + ": type");
  } else if (song.type === "ambience") {
    data.ambience.push(song);
    console.log(song.type + ": type");
  }

  //stringifies the object and overwrites the file
  writeSongsJson(JSON.stringify(data));

  //whole system is bad optimation wise but reliable
}

function deleteSongFromJson(songToDel: Song) {
  //reads the data in form of  [music: [array of songs], ambience:[array of songs]]
  let data = readSongsJson();
  let found = false;

  if (undefined === data) {
    throw Error("songs could not be read correctly");
  } else {
    //searches music & ambience and deletes the song
    if (songToDel.type === "music") {
      data.music.forEach((elem: Song) => {
        if (elem.id === songToDel.id) {
          data!.music.splice(data!.music.indexOf(elem), 1);
          console.log(`Removed ${elem.topic}`);
          return;
        }
      });
    } else if (songToDel.type === "ambience") {
      data.ambience.forEach((elem: Song) => {
        if (elem.id === songToDel.id) {
          data!.music.splice(data!.music.indexOf(elem), 1);
          console.log(`Removed ${elem.topic}`);
          return;
        }
      });
    } else {
      console.warn(
        `UNEXPECTED EVENT in src/song-handler/deleteSong(Z.96): songType is neither ambience nor music. Song Type = ${songToDel.type}`
      );
    }
  }

  //stringifies the new object and overwrites the file
  writeSongsJson(JSON.stringify(data));

  //whole system is bad optimation wise but reliable
}

function readSongsJson() {
  //Check if file exists
  if (fs.existsSync(filepathSongs)) {
    //reads and parses json file
    console.log("Reading songs...");
    let songs: { music: Array<Song>; ambience: Array<Song> } = JSON.parse(
      fs.readFileSync(filepathSongs, "utf8")
    );
    return songs;
  } else {
    console.log("File Doesn't Exist. Creating new file.");
    fs.writeFile(filepathSongs, "", (err: any) => {
      if (err) {
        console.log(err);
      }
    });
  }
}

function writeSongsJson(content: string, path = filepathSongs) {
  fs.writeFileSync(path, content, (err: any) => {
    console.log("Could not append to file in song-request");
  });
}
