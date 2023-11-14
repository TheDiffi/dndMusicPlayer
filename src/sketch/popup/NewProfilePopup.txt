import { Song, Profile } from "src/util/types.util";
import { generateSearchResultHtml } from "../edit-popups";
import { getAllSongs, searchInSongs, getSongFromId, getProfiles, addProfile } from "../profile-handler";
import { Popup } from "./Popup";
import { SimpleInputGroup } from "./SimpleInputGroup";

// create a class for the new profile
export class NewProfilePopup extends Popup {
	name: string;
	autoplay: boolean;
	defaultSong: string;
	allSongs: Song[];
	checkedSongs: {
		music: string[];
		ambience: string[];
	};
	constructor() {
		super("Add Profile");
		this.name = "";
		this.autoplay = false;
		this.defaultSong = "";
		this.checkedSongs = {
			music: [],
			ambience: [],
		};
		this.allSongs = getAllSongs();
		this.initPopup(this.genAddProfileContent());
		this.show();
		return;
	}

	genAddProfileContent() {
		/*
						<div class="div-100w">
							<h5 class="inline-input-group">Name:</h5>
							<input
								type="text"
								class="w-input songs-search-input inline-input-group"
								id="new-profile-name-input"
								placeholder="profile name..."
							/>
						</div>
	
						<div id="select-songs-container" class="popup-cols-container div-100w">
							<div class="select-music-container div-100w pad-5">
								<h5>🎵 Music Buttons:</h5>
								<div class="songs-search-wrapper">
									<div class="songs-search">
										<input
											type="text"
											class="w-input songs-search-input"
											id="add-song-songs-search-input"
											placeholder="songname..."
										/>
									</div>
								</div>
								<div class="select-container">
									<div class="select-wrapper">
										<div class="select-content songs-select-content" id="select-music-content">
											<div class="select-item">
												<div class="search-result-wrapper">
													<div class="search-result">Test</div>
													<div>
														<button class="search-result-button button-simple" checked>
															+
														</button>
														<button class="search-result-button button-simple">⚡</button>
													</div>
												</div>
											</div>
											
										</div>
									</div>
								</div>
								<br />
								<input type="checkbox" name="autoplay-default-song" id="autoplay-default-song" /> Autoplay
								Default Song ⚡
							</div>
							<div class="song-search-container div-100w pad-5">
								<h5>✨ Ambience Buttons:</h5>
								<div class="songs-search-wrapper">
									<div class="songs-search">
										<input
											type="text"
											class="w-input songs-search-input"
											id="add-song-songs-search-input"
											placeholder="songname..."
										/>
									</div>
								</div>
								<div class="select-container">
									<div class="select-wrapper">
										<div class="select-content songs-select-content">
											<div class="select-item">
												<div class="search-result-wrapper">
													<div class="search-result">Test</div>
													<div>
														<button class="search-result-button button-simple">+</button>
													</div>
												</div>
											</div>
											
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="popup-confirm"><button class="confirm-button">Confirm</button></div>
					 */

		const container = document.createElement("div");
		//NAME INPUT
		const songNameInput = new SimpleInputGroup("Name:", "profile name...", {
			inputId: "new-profile-name-input",
			labelId: "new-profile-name-label",
			containerId: "new-profile-name",
		});
		// AUTOPLAY INPUT
		const autoplayInput = genAutoplayInput();

		// SELECT SONGS CONTAINER
		const selectSongContainer = document.createElement("div");
		selectSongContainer.classList.add("popup-cols-container", "div-100w");
		selectSongContainer.id = "select-songs-container";

		const musicSelect = this.genMusicSelect();
		const ambienceSelect = this.genAmbienceSelect();

		// CONFIRM BUTTON
		const confirm = document.createElement("div");
		confirm.classList.add("popup-confirm");
		const confirmButton = document.createElement("button");
		confirmButton.classList.add("confirm-button");
		confirmButton.innerText = "Confirm";
		confirm.appendChild(confirmButton);
		confirmButton.addEventListener("click", () => {
			this.confirm(confirmButton);
		});

		//append all elements
		container.appendChild(songNameInput.element);
		container.appendChild(autoplayInput);
		selectSongContainer.appendChild(musicSelect);
		selectSongContainer.appendChild(ambienceSelect);
		container.appendChild(selectSongContainer);
		container.appendChild(confirm);

		return container;

		function genAutoplayInput() {
			const autoplayInput = document.createElement("div");
			autoplayInput.innerHTML = `
		<div class="div-100w" style="margin-left: 10px; margin-bottom: 5px;" >
			<input type="checkbox" name="autoplay-default-song" id="profile-autoplay-input" checked/> Autoplay
			Default Song ⚡
		</div>`;
			return autoplayInput;
		}
	}

	genMusicSelect() {
		const element = genGenericSongSearch("🎵 Music Buttons:", "select-music-container", (input, parent) => {
			this.onSearchRender(input, parent, "music");
		});

		// add custom button behavior

		return element;
	}

	genAmbienceSelect() {
		const element = genGenericSongSearch("✨ Ambience Buttons:", "select-ambience-container", (input, parent) => {
			this.onSearchRender(input, parent, "ambience");
		});

		// add custom button behavior

		return element;
	}

	onSearchRender(input: string, parent: HTMLElement, type: "music" | "ambience") {
		// searches and filters the songs
		const searchResults = input ? searchInSongs(input, this.allSongs) : this.allSongs;
		const filteredResults = searchResults.filter((s) => s.type === type);

		//clears the container
		parent.innerHTML = "";

		const formatOptions: SearchResultFormatOptions = {
			buttons: [
				{
					innerHTML: "+",
					idClass: "check-" + type + "-button",
					onRender: (ytId: string, button: HTMLButtonElement) => {
						//if this song is already in the profile, check the button
						const isChecked = this.checkedSongs[type].includes(ytId);
						button.setAttribute("checked", isChecked.toString());
					},
					onClick: (ytId: string, button: HTMLButtonElement) => {
						//UNCHECK
						if (this.checkedSongs[type].includes(ytId)) {
							this.checkedSongs[type] = this.checkedSongs[type].filter((id) => id !== ytId);

							//uncheck default song button
							if (type === "music") {
								this.defaultSong = this.checkedSongs[type][0] ?? "";
							}
						}

						//CHECK
						else if (!this.checkedSongs[type].includes(ytId)) {
							this.checkedSongs[type].push(ytId);
							//button.setAttribute("checked", "true");

							//if this is the first button checked, make it the default song
							if (type === "music" && this.checkedSongs[type].length === 1) {
								//set the default song button checked
								const defaultSongButton = button.parentElement?.getElementsByClassName(
									"default-song-button"
								)[0] as HTMLButtonElement;
								//defaultSongButton.setAttribute("checked", "true");
								this.defaultSong = defaultSongButton.getAttribute("ytId")!;
							}
						}

						//set checked attribute
						this.renderChecks(type);
					},
				},
			],
		};

		//add default song button
		if (type === "music") {
			formatOptions.buttons.push({
				innerHTML: "⚡",
				idClass: "default-song-button",
				onRender: (ytId: string, button: HTMLButtonElement) => {
					button.setAttribute("checked", (ytId === this.defaultSong).toString());
				},
				onClick: (ytId: string, button) => {
					//cant uncheck default song button
					if (ytId === this.defaultSong) return;

					//uncheck all other default song buttons
					this.element.querySelectorAll(".search-result-button.default-song-button").forEach((button) => {
						button.setAttribute("checked", "false");
					});

					//set checked
					//button.setAttribute("checked", "true");
					this.defaultSong = ytId;

					//check if add song button is checked, if not check it
					const addSongButton = button.parentElement?.getElementsByClassName(
						"check-music-button"
					)[0] as HTMLButtonElement;
					//addSongButton.setAttribute("checked", "true");
					this.checkedSongs[type].push(addSongButton.getAttribute("ytId")!);

					//set checked attribute
					this.renderChecks(type);
				},
			});
		}

		//creates a item for each result
		filteredResults.forEach((s) => {
			const searchResultItem = generateSearchResultHtml(s.topic, s.id, formatOptions);
			parent.appendChild(searchResultItem);
		});
	}

	renderChecks(type: "music" | "ambience") {
		this.element.querySelectorAll(".check-" + type + "-button").forEach((button) => {
			// is the button checked
			const checked: boolean = this.checkedSongs[type].includes(button.getAttribute("ytId")!) ?? false;
			button.setAttribute("checked", checked.toString());
		});

		if (type === "music") {
			this.element.querySelectorAll(".default-song-button").forEach((button) => {
				// is the button checked
				const checked: boolean = this.defaultSong === button.getAttribute("ytId");
				button.setAttribute("checked", checked.toString());
			});
		}
	}

	confirm(button: HTMLButtonElement) {
		//get name
		const nameInput = this.element.querySelector("#new-profile-name-input") as HTMLInputElement;
		const name = nameInput.value;
		if (!name) {
			nameInput.style.border = "1px solid red";
			return;
		}

		//get autoplay
		const autoplayInput = this.element.querySelector("#profile-autoplay-input") as HTMLInputElement;
		const autoplay = autoplayInput.checked;

		button.innerText = "Getting Songs";

		//get songs
		const musicSongs: Song[] = [];
		const ambienceSongs: Song[] = [];

		this.checkedSongs.music.forEach((ytId) => {
			const song = getSongFromId(ytId);
			if (song) musicSongs.push(song);
		});

		this.checkedSongs.ambience.forEach((ytId) => {
			const song = getSongFromId(ytId);
			if (song) ambienceSongs.push(song);
		});

		//get default song
		const defaultSong = getSongFromId(this.defaultSong ?? musicSongs[0].id ?? "");

		//create profile
		const profile: Profile = {
			name: name,
			id: (getProfiles().size + 1).toString(),
			autoplay: autoplay,
			defaultSong: defaultSong,
			songs: {
				music: musicSongs,
				ambience: ambienceSongs,
			},
			scenes: undefined,
		};
		console.log("new profile:");
		console.log(profile);

		//add profile
		addProfile(profile);

		//close popup
		this.element.remove();
	}
}
