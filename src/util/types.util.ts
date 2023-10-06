export enum IpcS {
	getProfile = "getProfile",
	getProfiles = "getProfiles",
	getAllSongs = "getAllSongs",
	getSong = "getSong",
	deleteSong = "deleteSong",
	addSong = "addSong",

	songRequest = "songRequest",
	ambienceRequest = "ambienceRequest",
	ambienceClose = "ambienceClose",
	addSongPopup = "addSongPopup",
	ambienceDuplicateCheck = "ambienceDuplicateCheck",

	testSend = "testSend",
}




export enum IpcR {
	returnProfile = "returnProfile",
	returnSongs = "returnSongs",
	ambienceClosed = "ambienceClosed",
	addSongButton = "addSongButton",
	testReply = "testReply",
	playAmbience = "playAmbience",
}

export interface Song {
	topic: string;
	id: string;
	volume: number | undefined;
	type: "music" | "ambience";
}

export interface Songs {
	music: Song[];
	ambience: Song[];
}

export interface Profile {
	name: string;
	id: string;
	songs: Songs;
	scenes: Scene[] | undefined;
	defaultSong?: Song;
}

export type Scene = {
	name: string;
	id: string;
	music: Song;
	ambience: Song[];
}
