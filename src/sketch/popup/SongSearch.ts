import { Song } from "src/util/types.util";
import { youTubeSongSearch } from "src/util/yt.util";
import { saveSong, addSongToCurrentProfile } from "../profile-handler";

export class SongSearch {
	element: HTMLDivElement;
	selectContent: HTMLDivElement;
	inputEl: HTMLInputElement;
	onInputRender: (input: string, parent: HTMLElement) => void;

	constructor(title: string, id: string, onInputRender: (input: string, parent: HTMLElement) => void) {
		this.element = SongSearch.generateSongSearch(title, id);
		this.selectContent = this.element.querySelector(".songs-select-content") as HTMLDivElement;
		this.inputEl = this.element.querySelector(".songs-search-input") as HTMLInputElement;
		this.onInputRender = onInputRender;

		//initial Render
		this.onInputRender("", this.selectContent);

		this.inputEl.addEventListener("input", () => {
			this.onInputRender(this.inputEl.value, this.selectContent);
		});
	}

	static generateSongSearch(title: string, id: string): HTMLDivElement {
		/* 
		<div class="song-search-container div-100w pad-5">
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

		return searchContainer;
	}
}

export class YTSongSearch {
	element: HTMLDivElement;
	constructor() {
		this.element = this.generateYTSearch();
	}

	generateYTSearch(): HTMLDivElement {
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

			this.getCleanYTSearchResults(inputValue)
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
										this.addSongBtnOnClick(ytId, button, "music");
									},
								},
								{
									innerHTML: "+✨",
									idClass: "add-yt-ambience-button",
									onClick: (ytId: string, button) => {
										this.addSongBtnOnClick(ytId, button, "ambience");
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

	addSongBtnOnClick(ytId: string, button: HTMLButtonElement, type: "music" | "ambience") {
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

	async getCleanYTSearchResults(input: string) {
		//sends search request to youtube
		const data = await youTubeSongSearch(input);
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
}

function generateSearchResultHtml(name: string, ytId: string, options: SearchResultFormatOptions) {
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

type SearchResultFormatOptions = {
	buttons: {
		innerHTML: string;
		idClass: string;
		onRender?: (ytId: string, button: HTMLButtonElement) => void;
		onClick: (ytId: string, button: HTMLButtonElement) => void;
	}[];
};