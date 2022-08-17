import {Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, Settings, ToggleExcludedFilesSettingTab} from "./settings/settings";
import {StatusBar} from "./statusBar";
import {changePathVisibility} from "./changePathVisibility";
import * as path from "path";

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
		// TODO: call some form of toggleExcludedFiles here
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// TODO: call some form of toggleExcludedFiles here
	}

	public async toggleExcludedFiles() {
		// Change toggle value in settings
		this.settings.isToggleOn = !this.settings.isToggleOn;
		await this.saveSettings();

		// Carry out changes behind the scenes
		await this.modifyUserIgnoreFilters();
		await this.modifyVisibilityInFileExplorer();

		// Update UI
		new Notice('Excluded Files Now ' + (this.settings.isToggleOn ? 'Hidden' : 'Visible'));
		this.statusBar.display(this.settings.isToggleOn);
	}

	async modifyVisibilityInFileExplorer() {
		this.settings.ignoreFilters.forEach(
			(ignoreFilter) => {
				changePathVisibility(ignoreFilter, this.settings.isToggleOn);
			});
	}

	async modifyUserIgnoreFilters() {
		let appJsonPath = path.join(this.app.vault.configDir, "app.json");

		this.app.vault.adapter.read(appJsonPath).then((text: string) => {
			let appJson: AppJson = JSON.parse(text);

			this.settings.ignoreFilters.forEach(
				(ignoreFilter) => {
					if (this.settings.isToggleOn && !appJson.userIgnoreFilters.contains(ignoreFilter)) {
						appJson.userIgnoreFilters.push(ignoreFilter);
					} else if (!this.settings.isToggleOn && appJson.userIgnoreFilters.contains(ignoreFilter)) {
						appJson.userIgnoreFilters.remove(ignoreFilter);
					}
				});

			return appJson;
		}).then((appJson: AppJson) => {
			// Stringify with "space" parameter = 2 so it pretty-prints like Obsidian default behavior
			this.app.vault.adapter.write(appJsonPath, JSON.stringify(appJson, null, 2))
		}).then(() => {
			// TODO: reload graph views, maybe close any files that are in the excluded folders?
		});
	}
}

type AppJson = {
	"legacyEditor": boolean,
	"livePreview": boolean,
	"promptDelete": boolean,
	"fileSortOrder": string,
	"attachmentFolderPath": string,
	"alwaysUpdateLinks": boolean,
	"userIgnoreFilters": Array<string>,
}
