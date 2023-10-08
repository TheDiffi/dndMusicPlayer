import fs from "fs";
import path from "path";
import { Song, Profile, Songs, Scene } from "../../util/types.util";
import { getSongFromId } from "./song-handler";

const dataPaths = {
	songs: path.join(__dirname, "../../../assets/data/songs.json"),
	profiles: path.join(__dirname, "../../../assets/data/profiles.json"),
};

type SongsJson = { songs: Song[] } | undefined;
type ProfileJson = {
	name: string;
	id: string;
	musicIds: string[];
	ambienceIds: string[];
	scenes: Scene[] | undefined;
	defaultMusic: string;
};

type ProfilesJson = { profiles: ProfileJson[] } | undefined;

//--------------------General--------------------
function readFormattedJson<Type>(filepath: string): Type {
	//Check if file exists
	if (fs.existsSync(filepath)) {
		//reads and parses json file
		console.log("Reading Json... " + filepath);

		let obj: Type = JSON.parse(fs.readFileSync(filepath, "utf8"));

		backupData(obj);
		return obj;
	} else {
		console.log("File Doesn't Exist. Creating new file.");
		console.log("Creating new file at: " + path.dirname(filepath));
		fs.writeFile(filepath, "", (err) => {
			if (err) {
				console.log(err);
			}
		});
		return {} as Type;
	}

	function backupData(obj: Type) {
		fs.writeFile(filepath + ".backup", JSON.stringify(obj), (err) => {
			if (err) {
				console.log(err);
			}
		});
	}
}

function writeFormattedJson<Type>(content: SongsJson | ProfilesJson, filepath: string): void {
	try {
		fs.writeFileSync(filepath, JSON.stringify(content));
	} catch (error) {
		console.log(error);
		console.log("Could not append to file in song-request");
	}
}

//--------------------Profiles--------------------
export function readProfilesJson(): Profile[] {
	const rawData = readFormattedJson<ProfilesJson>(dataPaths.profiles)?.profiles;
	if (!rawData) {
		throw Error("profiles could not be read correctly");
	}

	const profiles: Profile[] = rawData.map((profile) => parseJsonToProfile(profile));

	console.log("Read Profiles: " );
	console.log(profiles);

	return profiles;
}

function parseJsonToProfile(data: ProfileJson): Profile {
	let defaultMusic: Song | undefined= getSongFromId(data.defaultMusic);
	let songs: Songs = {
		music: data.musicIds.map((id) => getSongFromId(id)).filter((song) => song !== undefined) as Song[], 
		ambience: data.ambienceIds.map((id) => getSongFromId(id)).filter((song) => song !== undefined) as Song[],
	};
	return { name: data.name, id: data.id, songs: songs, defaultSong: defaultMusic, scenes: data.scenes};
}

function parseProfileToJson(profile: Profile): ProfileJson {
	return {
		name: profile.name,
		id: profile.id,
		musicIds: profile.songs.music.map((song) => song.id),
		ambienceIds: profile.songs.ambience.map((song) => song.id),
		scenes: profile.scenes,
		defaultMusic: profile.defaultSong?.id ?? profile.songs.music[0].id,
	};
}

export function appendProfileToJson(profile: Profile) {
	let profiles = readFormattedJson<ProfilesJson>(dataPaths.profiles)!.profiles;

	profiles.push(parseProfileToJson(profile));
	writeFormattedJson({ profiles: profiles }, dataPaths.profiles);
}

export function saveProfileToJson(profiles: Profile[]) {
	console.log(profiles)
	const parsedProfiles = profiles.map((profile) => parseProfileToJson(profile));
	writeFormattedJson({ profiles: parsedProfiles }, dataPaths.profiles);
}

export function deleteProfileFromJson(profile: Profile) {
	let profiles = readFormattedJson<ProfilesJson>(dataPaths.profiles)!.profiles;

	if (!profiles) {
		throw Error("profiles could not be read correctly");
	}
	profiles = profiles.filter((p) => p.id !== profile.id);
	writeFormattedJson({ profiles: profiles }, dataPaths.profiles);
}

//--------------------Songs--------------------
export function readSongsJson() {
	return readFormattedJson<SongsJson>(dataPaths.songs)!.songs;
}

export function appendSongToJson(song: Song) {
	//reads the data
	let songs = readFormattedJson<SongsJson>(dataPaths.songs)!.songs;

	if (undefined === songs) {
		throw Error("songs could not be read correctly");
	}

	// appends the song to the correct array
	songs.push(song);

	//overwrites the file
	writeFormattedJson({ songs: songs }, dataPaths.songs);
}

export function saveSongsToJson(songs: Song[]) {
	if (undefined === songs) {
		throw Error("songs could not be saved correctly");
	}
	//overwrites the file
	writeFormattedJson({ songs: songs }, dataPaths.songs);
}

export function deleteSongFromJson(songToDel: Song) {
	let data = readFormattedJson<SongsJson>(dataPaths.songs);

	if (data === undefined) {
		throw Error("songs could not be read correctly");
	}

	data.songs = data.songs.filter((p) => p.id !== songToDel.id);
	writeFormattedJson(data, dataPaths.songs);
}
