export class SimpleInputGroup {
	label: string;
	placeholder: string;
	ids: { containerId: string; labelId: string; inputId: string };
	element: HTMLDivElement;

	constructor(label: string, placeholder: string, ids: { containerId: string; labelId: string; inputId: string }) {
		this.label = label;
		this.placeholder = placeholder;
		this.ids = ids;
		this.element = this.createContainer(label, placeholder, ids);
	}

	createContainer(
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
}
