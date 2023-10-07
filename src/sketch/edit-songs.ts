//export all functions from this file

import { Song } from "../util/types.util";
import { youTubeSongSearch } from "../util/yt.util";
import { addSongToCurrentProfile, addSongToProfile, saveSong } from "./profile-handler";

export function renderAddSongPopup(type: "music" | "ambience") {
	//create popup element
	const popup = generateGenericPopup("Add Songs To Profile", generateDoubleSongSearch(type));
	document.body.appendChild(popup);

	//generate song object

	//add song to profile

	//save profile

	// add song button to list
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
	const songSearch = generateSongSearch();
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

		renderYTSearchFunction(inputValue, selectContent, type, {
			buttons: [
				{
					innerHTML: "+🎵",
					onClick: (ytId: string, button) => {
						addSongBtnOnClick(ytId, button, "music");
					},
				},
				{
					innerHTML: "+✨",
					onClick: (ytId: string, button) => {
						addSongBtnOnClick(ytId, button, "ambience");
					},
				},
			],
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
        saveSong(song);
		addSongToCurrentProfile(song);

		// done
		input.remove();
		button.replaceWith("✅");
	}
}

async function renderYTSearchFunction(
	input: string,
	parent: HTMLElement,
	type: "music" | "ambience",
	options: SearchResultFormatOptions
) {
	//sends search request to youtube
	const data = await youTubeSongSearch(input, type);

	const container = document.createElement("div");
	//creates a item for each result
	data.forEach((ytData) => {
		//get first 20 characters of the title
		let name = ytData.snippet.title;
		if (name.length > 40) name = name.substring(0, 35) + "...";

		const element = generateSearchResultHtml(name, ytData.id.videoId, options);

		container.appendChild(element);
	});

	parent.appendChild(container);
}

export function generateSearchResultHtml(name: string, id: string, options: SearchResultFormatOptions) {
	const item = document.createElement("div");
	item.className = "select-item";
	item.id = "select-item " + id;
	const wrapper = document.createElement("div");
	wrapper.className = "search-result-wrapper";
	const title = document.createElement("div");
	title.className = "search-result";
	title.innerHTML = name;
	const buttons = document.createElement("div");
	buttons.className = "search-result-buttons";

	wrapper.appendChild(title);
	wrapper.appendChild(buttons);
	item.setAttribute("ytId", id);
	item.appendChild(wrapper);

	for (const buttonOpt of options.buttons) {
		const button = document.createElement("button");
		button.className = "search-result-button button-simple";
		button.innerHTML = buttonOpt.innerHTML;
		buttons.appendChild(button);
		button.addEventListener("click", () => {
			buttonOpt.onClick(id, button);
		});
	}

	return item;
}

function generateSongSearch(): HTMLDivElement {
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
	const container = document.createElement("div");
	container.id = "add-song-container";
	container.classList.add("div-100w");
	const searchContainer = document.createElement("div");
	searchContainer.classList.add("song-search-container", "div-100w", "pad-5");
	const title = document.createElement("h5");
	title.innerText = "Saved Songs";
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
	searchContainer.appendChild(title);
	searchContainer.appendChild(searchWrapper);
	searchContainer.appendChild(selectContainer);
	container.appendChild(searchContainer);

	return container;
}

type SearchResultFormatOptions = {
	buttons: {
		innerHTML: string;
		onClick: (ytId: string, button: HTMLButtonElement) => void;
	}[];
};
