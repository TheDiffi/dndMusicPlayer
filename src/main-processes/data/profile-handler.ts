import { ipcMain } from "electron";
import { IpcS, Profile, Song } from "../../util/types.util";
import { readProfilesJson, readSongsJson, saveProfileToJson } from "./data-loader";


ipcMain.on(IpcS.getProfile, (event: any, profileId: string) => {
    console.info("getProfile: " + profileId);
	const profiles = loadProfiles();

	if(profileId === "0") return getAllSongsProfile();
	//tries if the profile is already loaded
	let profile = profiles.find((profile) => profile.id === profileId);
	//if not, it reads the profiles.json and loads the profile and tries again
	if (!profile) {
		loadProfiles();
		profile = profiles.find((profile) => profile.id === profileId);
	}
    if (!profile) {
        event.returnValue = undefined;
        console.error("profile not found");
        return;
    }

    console.info("returning profile: " + profile?.name);

	event.returnValue = profile;
});

function getAllSongsProfile(){
	const songs = readSongsJson();
	const profile: Profile = {
		name: "All Songs",
		id: "0",
		songs: {
			music: songs.filter((song) => song.type === "music"),
			ambience: songs.filter((song) => song.type === "ambience"),
		},
		scenes: undefined,
		defaultSong: undefined,
	};
	return profile;
}

ipcMain.on(IpcS.getProfiles, (event: any) => {
	const profiles = loadProfiles();
	event.returnValue = profiles;
});

export function loadProfiles() {
	return readProfilesJson();
}

ipcMain.on(IpcS.saveProfiles, (event: any, profiles: Profile[]) => {
	console.log("saving profiles");
	saveProfileToJson(profiles);

});