import {
	App,
	ButtonComponent, Notice,
	PluginSettingTab,
	Setting
} from 'obsidian';
import {FolderSuggest} from "./suggesters/FolderSuggester";
import ToggleExcludedFilesPlugin from "../main";

export interface Settings {
	ignoreFilters: Array<string>;
	isToggleOn:boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	ignoreFilters: [""],
	isToggleOn: false,
}

export class ToggleExcludedFilesSettingTab extends PluginSettingTab {
	plugin: ToggleExcludedFilesPlugin;

	constructor(app: App, plugin: ToggleExcludedFilesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Toggle Excluded Files'});

		new Setting(this.containerEl)
			.setName("Add Exclusion Filter")
			.setDesc("Equivalent to adding filters in Options -> Files & Links -> Excluded files")
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip("Add Exclusion Filter")
					.setButtonText("+")
					.setCta()
					.onClick(async () => {
						this.plugin.settings.ignoreFilters.push("");
						await this.plugin.saveSettings();
						this.display();
					});
			});

		this.plugin.settings.ignoreFilters.forEach(
			(folder_template, index) => {
				const s = new Setting(this.containerEl)
					.addSearch((cb) => {
						new FolderSuggest(this.app, cb.inputEl);
						cb.setPlaceholder("Folder")
							.setValue(folder_template)
							.onChange(async (new_folder) => {
								if (
									new_folder &&
									this.plugin.settings.ignoreFilters.some(
										(e) => e == new_folder
									)
								) {
									new Notice('An Excluded File already exists for that path');
									return;
								}

								this.plugin.settings.ignoreFilters[
									index
									] = new_folder;
								await this.plugin.saveSettings();
							});
					})
					.addExtraButton(async (cb) => {
						cb.setIcon("cross")
							.setTooltip("Delete")
							.onClick(() => {
								this.plugin.settings.ignoreFilters.splice(
									index,
									1
								);
								this.plugin.saveSettings();
								this.display();
							});
					});
				s.infoEl.remove();
			}
		);
	}
}
