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

		// TODO: add ribbon icon

		// Initialize Status Bar
		let statusBarEl = this.addStatusBarItem();
		this.statusBar = new StatusBar(statusBarEl, this);
		this.statusBar.display(this.settings.isToggleOn);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		await this.refreshExcludedFiles();
	}

	// TODO: this can have wonky behavior when called from adjusting settings in setting tab:
	// TODO: unintended paths can get added to settings while typing, for example
	async saveSettings() {
		await this.saveData(this.settings);
		await this.refreshExcludedFiles();
	}

	public async toggleExcludedFiles() {
		this.settings.isToggleOn = !this.settings.isToggleOn;
		await this.saveSettings();
	}

	async refreshExcludedFiles() {
		// Carry out changes behind the scenes
		await this.modifyUserIgnoreFilters();
		await this.modifyVisibilityInFileExplorer();

		// Update UI
		await this.refreshWorkspace();
		new Notice('Excluded Files Now ' + (this.settings.isToggleOn ? 'Hidden' : 'Visible'));
		this.statusBar?.display(this.settings.isToggleOn);
	}

	// TODO: this doesn't work when called through loadSettings, probably happening too early
	async modifyVisibilityInFileExplorer() {
		this.settings.ignoreFilters.forEach(
			(ignoreFilter) => {
				changePathVisibility(ignoreFilter, this.settings.isToggleOn);
			});
	}

	async modifyUserIgnoreFilters() {
		let appJsonPath = path.join(this.app.vault.configDir, "app.json");

		let text = await this.app.vault.adapter.read(appJsonPath);
		let appJson: AppJson = JSON.parse(text);

		this.settings.ignoreFilters.forEach(
			(ignoreFilter) => {
				if (this.settings.isToggleOn && !appJson.userIgnoreFilters.contains(ignoreFilter)) {
					appJson.userIgnoreFilters.push(ignoreFilter);
				} else if (!this.settings.isToggleOn && appJson.userIgnoreFilters.contains(ignoreFilter)) {
					appJson.userIgnoreFilters.remove(ignoreFilter);
				}
			});

		// Stringify with "space" parameter = 2 so it pretty-prints like Obsidian default behavior
		await this.app.vault.adapter.write(appJsonPath, JSON.stringify(appJson, null, 2));
	}

	// TODO: find some way to do this so that graph views get updated
	// TODO: (code below doesn't work, but could be helpful for finding a solution)
	async refreshWorkspace() {
		// let activeLeaf: WorkspaceLeaf | undefined = this.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
		//
		// this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
		// 	this.app.workspace.setActiveLeaf(leaf, false, true);
		// });
		//
		// if (activeLeaf !== null && activeLeaf !== undefined) {
		// 	this.app.workspace.setActiveLeaf(activeLeaf, false, false);
		// }
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
