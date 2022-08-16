import {setIcon} from "obsidian";
import ToggleExcludedFilesPlugin from "./main";

export class StatusBar {

	constructor(private statusBarEl: HTMLElement, private readonly plugin: ToggleExcludedFilesPlugin) {
		this.statusBarEl.setAttribute("aria-label-position", "top");

		this.statusBarEl.onClickEvent(async () => {
			await plugin.toggleExcludedFiles();
		});
	}

	public display(isToggleOn: boolean) {
		this.statusBarEl.ariaLabel = 'Excluded Files ' + (isToggleOn ? 'Hidden' : 'Visible');
		setIcon(this.statusBarEl, isToggleOn ? "minus-with-circle" : "eye");
	}
}
