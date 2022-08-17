import {setIcon} from "obsidian";
import ToggleExcludedFilesPlugin from "./main";

export class RibbonIcon {

	constructor(private ribbonIconEl: HTMLElement, private readonly plugin: ToggleExcludedFilesPlugin) {
		this.ribbonIconEl.onClickEvent(async () => {
			await plugin.toggleExcludedFiles();
		})
	}

	public display(isToggleOn: boolean) {
		this.ribbonIconEl.ariaLabel = 'Excluded Files ' + (isToggleOn ? 'Hidden' : 'Visible');
		// Icons cheat sheet: https://forum.obsidian.md/t/list-of-available-icons-for-component-seticon/16332/5
		setIcon(this.ribbonIconEl, isToggleOn ? "minus-with-circle" : "eye");
	}
}
