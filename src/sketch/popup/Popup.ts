//export all functions from this file

import { Song } from "../../util/types.util";
import { youTubeSongSearch } from "../../util/yt.util";
import { generateSearchResultHtml } from "../edit-popups";
import {
	addSongToCurrentProfile, isSongInCurrentProfile,
	lookupSongs,
	saveSong
} from "../profile-handler";
import { SongSearch, YTSongSearch } from "./SongSearch";

export class Popup {
	popup: HTMLDivElement;

	constructor(title: string, content?: HTMLElement) {
		this.popup = document.createElement("div");
		this.genPopup(title);
		if (content) this.initPopup(content);
	}

	genPopup(title: string) {
		this.popup.classList.add("popup-container");
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
		this.popup.appendChild(popupWrapper);

		popupClose.addEventListener("click", () => {
			this.close();
		});

		return this.popup;
	}

	initPopup(content: HTMLElement) {
		this.popup.querySelector("popup-content")!.appendChild(content);
		this.show();
	}

	appendContent(content: HTMLElement) {
		this.popup.querySelector("popup-content")!.appendChild(content);
	}

	show() {
		if (document.body.contains(this.popup)) return console.warn("popup already exists");
		document.body.appendChild(this.popup);
	}

	close() {
		this.popup.remove();
	}
}

class FlexPopup extends Popup {
	flexContainer: HTMLDivElement;

	constructor(title: string, elems?: HTMLElement[]) {
		super(title);
		this.flexContainer = document.createElement("div");
		this.genFlexContainer();
		if (elems) this.insertSearches(elems);
	}

	insertSearches(elems: HTMLElement[]): void {
		this.flexContainer.innerHTML = "";
		elems.forEach((el) => {
			this.flexContainer.appendChild(el);
		});
		this.initPopup(this.flexContainer);
	}

	private genFlexContainer() {
		this.flexContainer.classList.add("popup-content-flex-container");
	}
}

export class AddSongToProfilePopup extends FlexPopup {
	//create popup element
	constructor(type: "music" | "ambience") {
		super("Add Songs");
		this.initSearches();
		this.show();
	}

	private initSearches() {
		/* <div id="add-song-container">
			{children}
		</div> */
		const songSearch = new SongSearch("Saved Songs", "saved-songs-search", this.onSearchRenderAddSongs);
		const ytSongSearch = new YTSongSearch();

		this.insertSearches([songSearch.element, ytSongSearch.element]);
	}

	private onSearchRenderAddSongs(input: string, parent: HTMLElement) {
		console.log("searching for songs. input: " + input);
		let searchResults = lookupSongs(input);
		searchResults = this.sortSongSearchResults(searchResults);

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

	private sortSongSearchResults(searchResults: Song[]): Song[] {
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
}

export class AddSongYTPopup extends FlexPopup {
	//TODO
	ytSongSearch: YTSongSearch;
	//create popup element
	constructor(type: "music" | "ambience") {
		super("Add Songs");

		//init searches
		this.ytSongSearch = new YTSongSearch();
		this.insertSearches([this.ytSongSearch.element]);

		//probably unnecessary
		this.show();
	}
}

export class AddSongGenericPopup extends FlexPopup {
	songSearch: SongSearch;
	//TODO
	constructor(type: "music" | "ambience") {
		super("Add Songs");

		//init searches
		this.songSearch = new SongSearch("Saved Songs", "saved-songs-search", this.onSearchRender);
		this.insertSearches([this.songSearch.element]);

		//probably unnecessary
		this.show();
	}

	private onSearchRender(input: string, parent: HTMLElement) {
		//TODO
	}
}



function getCheckedByClass(className: string) {
	const elements = document.getElementsByClassName(className);
	const checked: HTMLElement[] = [];
	for (let i = 0; i < elements.length; i++) {
		const element = elements[i] as HTMLElement;
		if (element.getAttribute("checked") === "true") checked.push(element);
	}
	return checked;
}
