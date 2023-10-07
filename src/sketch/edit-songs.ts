//export all functions from this file


export function renderAddSongPopup(){
	//create popup element
	const popup = generateGenericPopup("Add Songs To Profile", generateDoubleSongSearch());
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
	popupClose.classList.add("popup-close");
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

function generateDoubleSongSearch(): HTMLDivElement {
	/* <div id="add-song-container">
           {children}
        </div> */
    const container = document.createElement("div");
    container.id = "add-song-container";
    const songSearch = generateSongSearch();
	const youtubeSearch = generateYTSearch();
    container.appendChild(songSearch);
    container.appendChild(youtubeSearch);
    return container;
}

function generateYTSearch(): HTMLDivElement {
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

    return container;
}

function generateSongSearch(): HTMLDivElement{
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
	searchContainer.classList.add("song-search-container","div-100w","pad-5");
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

export function generateSearchResultHtml(name: string, id: string, options: SearchResultFormatOptions) {
	const item = document.createElement("div");
	item.className = "select-item";
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

    for (const button of options.buttons) {
        const musicBtn = document.createElement("button");
        musicBtn.className = "search-result-button button-simple";
        musicBtn.innerHTML = button.innerHTML;
        buttons.appendChild(musicBtn);
        musicBtn.addEventListener("click", button.onClick);
    }

	return item;
}

type SearchResultFormatOptions = { 
    buttons: {
        innerHTML: string
        onClick: () => void
    }[]; 
}

