import { ipcMain } from "electron";
import { IpcS, Profile, Song } from "../../util/types.util";
import { readProfilesJson, readSongsJson } from "./data-loader";

const profiles: Map<string, Profile> = new Map();

ipcMain.on(IpcS.getProfile, (event: any, profileId: string) => {
    console.info("getProfile: " + profileId);

	//tries if the profile is already loaded
	let profile = profiles.get(profileId);
	//if not, it reads the profiles.json and loads the profile and tries again
	if (!profile) {
		loadProfiles();
		profile = profiles.get(profileId);
	}
    if (!profile) {
        event.returnValue = undefined;
        console.error("profile not found");
        return;
    }

	// AllSongs Profile
	if (profile.id === "0") {
		let songs = readSongsJson();
		songs.forEach((song: Song) => {
			profile?.songs[song.type].push(song);
		});
	}

    console.info("returning profile: " + profile?.name);

	event.returnValue = profile;
});

ipcMain.on(IpcS.getProfiles, (event: any) => {
	loadProfiles();
	event.returnValue = profiles;
});

export function loadProfiles() {
	readProfilesJson().forEach((profile) => profiles.set(profile.id, profile));
}


