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
		// Icons cheat sheet: https://forum.obsidian.md/t/list-of-available-icons-for-component-seticon/16332/5
		setIcon(this.statusBarEl, isToggleOn ? "minus-with-circle" : "eye");
	}
}
