import { IpcS, IpcR, Song } from "../../util/types.util";
import { appendSongToJson, deleteSongFromJson, readSongsJson } from "./data-loader";
import { ipcMain } from "electron";

const allMusicSongs = new Map<string, Song>(/*key=id, value=songObj*/);
const allAmbienceSongs = new Map<string, Song>(/*key=id, value=songObj*/);

ipcMain.on(IpcS.getAllSongs, (event: any) => {
	//reads and sends the songs to the renderer
	event.sender.send(IpcR.returnSongs, loadSongs());
});

ipcMain.on(IpcS.addSong, (event: any, song: Song) => {
	console.log(song + " song-request");
	appendSongToJson(song);
	loadSongs();
});

ipcMain.on(IpcS.songRequest, (event: any, songTopic: string, songType: string) => {
	event.returnValue = getSongFromTopicAndType(songTopic, songType);
});

ipcMain.on(IpcS.deleteSong, (event: any, songTopic: string, songType: string) => {
	let song = getSongFromTopicAndType(songTopic, songType);
	deleteSongFromJson(song);
	loadSongs();
});

function getSongFromTopicAndType(songTopic: string, songType: string = "") {
	let song;
	switch (songType) {
		case "music":
			song = allMusicSongs.forEach((s) => {
				if (s.topic === songTopic) song = s;
			});
			break;
		case "ambience":
			song = song = allAmbienceSongs.forEach((s) => {
				if (s.topic === songTopic) song = s;
			});
			break;
		default:
			song = allMusicSongs.forEach((s) => {
				if (s.topic === songTopic) song = s;
			});
			song = allAmbienceSongs.forEach((s) => {
				if (s.topic === songTopic) song = s;
			});
	}

	console.log(`Found Song ${JSON.stringify(song)} from topic: ${songTopic}`);
	return song;
}

function getSongFromId(songId: string): Song | undefined {
	let song = allMusicSongs.get(songId);
	if (!song) song = allAmbienceSongs.get(songId);

	return song;
}


function loadSongs() {
	//reads and parses json file
	let songs = readSongsJson();

	if (!songs) {
		throw Error("songs could not be read correctly");
	}

	//clears and fills the maps
	allMusicSongs.clear();
  	allAmbienceSongs.clear();

	songs.forEach((song: Song) => {
    if (song.type === "music") allMusicSongs.set(song.id, song);
    else allAmbienceSongs.set(song.id, song);
	});

	return songs;
}

export { allMusicSongs, allAmbienceSongs, getSongFromId, loadSongs};


