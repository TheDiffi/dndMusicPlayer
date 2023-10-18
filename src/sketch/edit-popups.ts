//export all functions from this file

import { Profile, Song } from "../util/types.util";
import { youTubeSongSearch } from "../util/yt.util";
import {
	addProfile,
	addSongToCurrentProfile,
	getAllSongs,
	getProfiles,
	getSongFromId,
	isSongInCurrentProfile,
	lookupSongs,
	saveSong,
	searchInSongs,
} from "./profile-handler";

export function renderAddSongToProfilePopup(type: "music" | "ambience") {
	//create popup element
	const popup = generateGenericPopup("Add Songs To Profile", generateDoubleSongSearch(type));
	document.body.appendChild(popup);
}

export function renderAddSongGenericPopup(type: "music" | "ambience") {
	//create popup element
	const popup = generateGenericPopup("Add Songs", generateYTSearch(type));
	document.body.appendChild(popup);
}

export function generateGenericPopup(title: string, content: HTMLElement) {
	/* <div class="popup-container">
			<div class="popup-wrapper">
				<div class="popup-close">✖️</div>
				<div class="popup-title"><h2>Add Songs To Profile</h2></div>
				<div class="popup-content">
					
				</div>
			</div>
		</div> */

	const popupContainer = document.createElement("div");
	popupContainer.classList.add("popup-container");
	const popupWrapper = document.createElement("div");
	popupWrapper.classList.add("popup-wrapper");
	const popupClose = document.createElement("div");
	popupClose.classList.add("popup-close", "big");
	popupClose.innerText = "✖️";
	const popupTitle = document.createElement("div");
	popupTitle.classList.add("popup-title");
	const popupTitleH2 = document.createElement("h2");
	popupTitleH2.innerText = title;
	popupTitle.appendChild(popupTitleH2);
	const popupContent = document.createElement("div");
	popupContent.classList.add("popup-content");

	popupWrapper.appendChild(popupClose);
	popupWrapper.appendChild(popupTitle);
	popupWrapper.appendChild(popupContent);
	popupContainer.appendChild(popupWrapper);

	popupClose.addEventListener("click", () => {
		popupContainer.remove();
	});

	popupContent.appendChild(content);

	return popupContainer;
}

function generateDoubleSongSearch(type: "music" | "ambience"): HTMLDivElement {
	/* <div id="add-song-container">
           {children}
        </div> */
	const container = document.createElement("div");
	container.id = "add-song-container";
	const songSearch = genGenericSongSearch("Saved Songs", "saved-songs-search", onSearchRenderAddSongs);
	const youtubeSearch = generateYTSearch(type);
	container.appendChild(songSearch);
	container.appendChild(youtubeSearch);
	return container;
}

function generateYTSearch(type: "music" | "ambience"): HTMLDivElement {
	/* <div class="youtube-search-big div-100w pad-5">
                <h5>YT Search</h5>
                <div class="input-group-wrapper">
                    <div class="input-group">
                        <input
                            type="text"
                            class="w-input"
                            id="add-song-yt-search-input"
                            placeholder="https://www.youtube.com/...."
                        />
                        <button id="yt-search-submit" class="yt-search-submit w-input button-simple">Enter</button>
                    </div>
                </div>
                <div class="select-container">
                    <div class="select-wrapper">
                        <div class="select-content">	
                        </div>
                    </div>
                </div>
            </div> */
	const container = document.createElement("div");
	container.classList.add("youtube-search-big", "div-100w", "pad-5");
	const title = document.createElement("h5");
	title.innerText = "YT Search";
	const inputGroupWrapper = document.createElement("div");
	inputGroupWrapper.classList.add("input-group-wrapper");
	const inputGroup = document.createElement("div");
	inputGroup.classList.add("input-group");
	const input = document.createElement("input");
	input.type = "text";
	input.classList.add("w-input");
	input.id = "add-song-yt-search-input";
	input.placeholder = "https://www.youtube.com/....";
	const button = document.createElement("button");
	button.id = "yt-search-submit";
	button.classList.add("yt-search-submit", "w-input", "button-simple");
	button.innerText = "Enter";
	const selectContainer = document.createElement("div");
	selectContainer.classList.add("select-container");
	const selectWrapper = document.createElement("div");
	selectWrapper.classList.add("select-wrapper");
	const selectContent = document.createElement("div");
	selectContent.classList.add("select-content");

	inputGroup.appendChild(input);
	inputGroup.appendChild(button);
	inputGroupWrapper.appendChild(inputGroup);
	selectWrapper.appendChild(selectContent);
	selectContainer.appendChild(selectWrapper);
	container.appendChild(title);
	container.appendChild(inputGroupWrapper);
	container.appendChild(selectContainer);

	button.addEventListener("click", () => {
		const inputValue = input.value;
		if (!inputValue) throw Error("Input value is empty");

		getCleanYTSearchResults(inputValue, type)
			.then((data) => {
				if (data === undefined) return;

				//clears the container
				selectContent.innerHTML = "";

				//creates a item for each result
				data.forEach((ytData) => {
					const item = generateSearchResultHtml(ytData.title, ytData.id, {
						buttons: [
							{
								innerHTML: "+🎵",
								idClass: "add-yt-music-button",
								onClick: (ytId: string, button) => {
									addSongBtnOnClick(ytId, button, "music");
								},
							},
							{
								innerHTML: "+✨",
								idClass: "add-yt-ambience-button",
								onClick: (ytId: string, button) => {
									addSongBtnOnClick(ytId, button, "ambience");
								},
							},
						],
					});
					selectContent.appendChild(item);
				});
			})
			.catch((err) => {
				console.error(err);
			});
	});

	return container;
}

function addSongBtnOnClick(ytId: string, button: HTMLButtonElement, type: "music" | "ambience") {
	const item = button.parentElement?.parentElement?.parentElement as HTMLDivElement;
	const input = item?.getElementsByClassName("give-song-name-input")[0] as HTMLInputElement;

	//if there is no song name input, generate one
	if (!input) {
		//remove all other inputs
		document.querySelectorAll(".give-song-name-input").forEach((input) => {
			input.remove();
		});
		//generate input for song name
		const songNameInput = document.createElement("input");
		songNameInput.type = "text";
		songNameInput.classList.add("w-input", "div-100w", "give-song-name-input");
		songNameInput.placeholder = "Enter Title Of Song To Save";
		item?.appendChild(songNameInput);
	} else {
		//get song name
		const songName = input.value;
		if (!songName) {
			input.style.border = "1px solid red";
			return;
		}

		//generate song object
		const song: Song = {
			id: ytId,
			topic: songName,
			volume: 50,
			type: type,
		};

		//add song to profile
		console.log(song);
		saveSong(song);
		addSongToCurrentProfile(song);

		// done
		input.remove();
		button.replaceWith("✅");
	}
}

async function getCleanYTSearchResults(input: string, type: "music" | "ambience") {
	//sends search request to youtube
	const data = await youTubeSongSearch(input, type);
	if (data === undefined) return;

	let results: { id: string; title: string }[] = [];
	data.forEach((d) => {
		let name = d.snippet.title;
		if (name.length > 40) name = name.substring(0, 35) + "...";
		d.topic = name;
		results.push({ id: d.id.videoId, title: name });
	});

	return results;
}

export function generateSearchResultHtml(name: string, ytId: string, options: SearchResultFormatOptions) {
	const item = document.createElement("div");
	item.className = "select-item";
	item.id = "select-item " + ytId;
	const wrapper = document.createElement("div");
	wrapper.className = "search-result-wrapper";
	const title = document.createElement("div");
	title.className = "search-result";
	title.innerHTML = name;
	const buttons = document.createElement("div");
	buttons.className = "search-result-buttons";

	wrapper.appendChild(title);
	wrapper.appendChild(buttons);
	item.setAttribute("ytId", ytId);
	item.appendChild(wrapper);

	for (const buttonOpt of options.buttons) {
		const button = document.createElement("button");
		button.className = "search-result-button button-simple";
		button.classList.add(buttonOpt.idClass);
		button.innerHTML = buttonOpt.innerHTML;
		button.setAttribute("ytId", ytId);
		buttons.appendChild(button);

		if (buttonOpt.onRender) buttonOpt.onRender(ytId, button);

		button.addEventListener("click", () => {
			if (button.disabled) return;
			buttonOpt.onClick(ytId, button);
		});
	}

	return item;
}

function genGenericSongSearch(title: string, id: string, onSearchRender: (input: string, parent: HTMLElement) => void) {
	/*  <div class="song-search-container div-100w pad-5">
                <h5>Saved Songs</h5>
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
                        </div>
                    </div>
                </div>
            </div> 
    */

	const searchContainer = document.createElement("div");
	searchContainer.id = id;
	searchContainer.classList.add("song-search-container", "div-100w", "pad-5");
	const titleEl = document.createElement("h5");
	titleEl.innerText = title;
	const searchWrapper = document.createElement("div");
	searchWrapper.classList.add("songs-search-wrapper");
	const songsSearch = document.createElement("div");
	songsSearch.classList.add("songs-search");
	const input = document.createElement("input");
	input.type = "text";
	input.classList.add("w-input", "songs-search-input");
	input.id = "add-song-songs-search-input";
	input.placeholder = "songname...";
	const selectContainer = document.createElement("div");
	selectContainer.classList.add("select-container");
	const selectWrapper = document.createElement("div");
	selectWrapper.classList.add("select-wrapper");
	const selectContent = document.createElement("div");
	selectContent.classList.add("select-content", "songs-select-content");

	songsSearch.appendChild(input);
	searchWrapper.appendChild(songsSearch);
	selectWrapper.appendChild(selectContent);
	selectContainer.appendChild(selectWrapper);
	searchContainer.appendChild(titleEl);
	searchContainer.appendChild(searchWrapper);
	searchContainer.appendChild(selectContainer);

	//initial Render
	onSearchRender("", selectContent);

	input.addEventListener("input", () => {
		onSearchRender(input.value, selectContent);
	});

	return searchContainer;
}

function onSearchRenderAddSongs(input: string, parent: HTMLElement) {
	const searchResults = getSortedSongSearchResults(input);

	//clears the container
	parent.innerHTML = "";
	//creates a item for each result
	searchResults.forEach((s) => {
		const searchResultItem = generateSearchResultHtml(s.topic, s.id, {
			buttons: [
				{
					innerHTML: "+🎵",
					idClass: "add-music-button",
					onRender: (ytId: string, button: HTMLButtonElement) => {
						s.type = "music";
						if (isSongInCurrentProfile(s)) {
							button.replaceWith("✅");
							button.disabled = true;
						}
					},
					onClick: (ytId: string, button) => {
						s.type = "music";
						//add song to profile
						addSongToCurrentProfile(s);
						button.replaceWith("✅");
					},
				},
				{
					innerHTML: "+✨",
					idClass: "add-ambience-button",
					onRender: (ytId: string, button: HTMLButtonElement) => {
						s.type = "ambience";
						if (isSongInCurrentProfile(s)) {
							button.replaceWith("✅");
							button.disabled = true;
						}
					},
					onClick: (ytId: string, button) => {
						s.type = "ambience";
						//add song to profile
						addSongToCurrentProfile(s);
						button.replaceWith("✅");
					},
				},
			],
		});
		parent.appendChild(searchResultItem);
	});
}

function getSortedSongSearchResults(input: string): Song[] {
	console.log("searching for songs. input: " + input);
	const searchResults = lookupSongs(input);
	if (searchResults === undefined) return [];

	// sorts the results by topic alpabetically
	searchResults.sort((a, b) => {
		if (a.topic < b.topic) return -1;
		if (a.topic > b.topic) return 1;
		return 0;
	});

	searchResults.sort((a, b) => {
		if (a.type === "music" && b.type === "ambience") return 1;
		if (a.type === "ambience" && b.type === "music") return -1;
		return 0;
	});

	return searchResults;
}

type SearchResultFormatOptions = {
	buttons: {
		innerHTML: string;
		idClass: string;
		onRender?: (ytId: string, button: HTMLButtonElement) => void;
		onClick: (ytId: string, button: HTMLButtonElement) => void;
	}[];
};

function getCheckedByClass(className: string) {
	const elements = document.getElementsByClassName(className);
	const checked: HTMLElement[] = [];
	for (let i = 0; i < elements.length; i++) {
		const element = elements[i] as HTMLElement;
		if (element.getAttribute("checked") === "true") checked.push(element);
	}
	return checked;
}

function genSimpleInputGroup(
	label: string,
	placeholder: string,
	ids: { containerId: string; labelId: string; inputId: string }
) {
	/* <div class="div-100w" id="add-profile-name">
						<h5 class="inline-input-group">Name:</h5>
						<input
							type="text"
							class="w-input songs-search-input inline-input-group"
							id="new-profile-name-input"
							placeholder="profile name..."
						/>
					</div> */
	const container = document.createElement("div");
	container.classList.add("div-100w");
	container.id = ids.containerId;
	const labelEl = document.createElement("h5");
	labelEl.classList.add("inline-input-group");
	labelEl.id = ids.labelId;
	labelEl.innerText = label;
	const input = document.createElement("input");
	input.type = "text";
	input.classList.add("w-input", "songs-search-input", "inline-input-group");
	input.id = ids.inputId;
	input.placeholder = placeholder;

	container.appendChild(labelEl);
	container.appendChild(input);

	return container;
}

// create a class for the new profile
export class NewProfilePopup {
	name: string;
	autoplay: boolean;
	defaultSong: string;
	allSongs: Song[];
	checkedSongs: {
		music: string[];
		ambience: string[];
	};
	popup: HTMLDivElement;
	constructor() {
		this.name = "";
		this.autoplay = false;
		this.defaultSong = "";
		this.checkedSongs = {
			music: [],
			ambience: [],
		};
		this.allSongs = getAllSongs();
		this.popup = this.render();
	}

	render() {
		const popup = generateGenericPopup("Add Profile", this.generateAddProfileContent());
		document.body.appendChild(popup);
		return popup;
	}

	generateAddProfileContent() {
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
		const songNameInput = genSimpleInputGroup("Name:", "profile name...", {
			inputId: "new-profile-name-input",
			labelId: "new-profile-name-label",
			containerId: "new-profile-name",
		});
		// AUTOPLAY INPUT
		const autoplayInput = document.createElement("div");
		autoplayInput.innerHTML = `
		<div class="div-100w" style="margin-left: 10px; margin-bottom: 5px;" >
			<input type="checkbox" name="autoplay-default-song" id="profile-autoplay-input" checked/> Autoplay
			Default Song ⚡
		</div>`;

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
		container.appendChild(songNameInput);
		container.appendChild(autoplayInput);
		selectSongContainer.appendChild(musicSelect);
		selectSongContainer.appendChild(ambienceSelect);
		container.appendChild(selectSongContainer);
		container.appendChild(confirm);

		return container;
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
					this.popup.querySelectorAll(".search-result-button.default-song-button").forEach((button) => {
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
		this.popup.querySelectorAll(".check-" + type + "-button").forEach((button) => {
			// is the button checked 
			const checked: boolean = this.checkedSongs[type].includes(button.getAttribute("ytId")!) ?? false;
			button.setAttribute("checked", checked.toString());
		});

		if(type === "music"){
			this.popup.querySelectorAll(".default-song-button").forEach((button) => {
				// is the button checked 
				const checked: boolean = this.defaultSong === button.getAttribute("ytId");
				button.setAttribute("checked", checked.toString());
			});
		}
	}

	confirm(button: HTMLButtonElement) {
		//get name
		const nameInput = this.popup.querySelector("#new-profile-name-input") as HTMLInputElement;
		const name = nameInput.value;
		if (!name) {
			nameInput.style.border = "1px solid red";
			return;
		}

		//get autoplay
		const autoplayInput = this.popup.querySelector("#profile-autoplay-input") as HTMLInputElement;
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
		this.popup.remove();
	}
}
