import {Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, Settings, ToggleExcludedFilesSettingTab} from "./settings/settings";
import {StatusBar} from "./statusBar";
import {changePathVisibility} from "./changePathVisibility";

export default class ToggleExcludedFilesPlugin extends Plugin {
	settings: Settings;
	statusBar: StatusBar;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new ToggleExcludedFilesSettingTab(this.app, this));

		// Initialize Status Bar
		let statusBarEl = this.addStatusBarItem();
		this.statusBar = new StatusBar(statusBarEl, this);
		this.statusBar.display(this.settings.isToggleOn);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	
	public async toggleExcludedFiles() {
		// Change toggle value in settings
		this.settings.isToggleOn = !this.settings.isToggleOn;
		await this.saveSettings();
		
		// Carry out changes in app.json and hide files in navigation
		this.settings.ignoreFilters.forEach(
			(ignoreFilter) => {
				// TODO: set this up to hide folders in navigation pane
				changePathVisibility(ignoreFilter, this.settings.isToggleOn);

				//this.app.vault.configDir  // TODO: could use this to access main.js
			});
		
		// Update UI
		new Notice('Excluded Files Now ' + (this.settings.isToggleOn ? 'Hidden' : 'Visible'));
		this.statusBar.display(this.settings.isToggleOn);
	}
}
