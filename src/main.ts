import { SmartReaderView, VIEW_TYPE_SMART_READER } from "./SmartReaderView";
import {
	App as ObsidianApp,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
} from "obsidian";
import "@/index.css";
import { StorageService } from "@/lib/services/storage.service";
import { testContentChunkingCommand } from "./commands/testContentChunking";

/**
 * Settings interface for the Smart Reader plugin
 */
interface SmartReaderSettings {
	savePath: string;
	template: string;
	dateFormat: string;
}

/**
 * Default settings for the Smart Reader plugin
 */
const DEFAULT_SETTINGS: SmartReaderSettings = {
	savePath: "",
	template: "# {{title}}\n\n{{content}}",
	dateFormat: "YYYY-MM-DD",
};

/**
 * Main plugin class for the Smart Reader plugin
 */
/**
 * Main plugin class for the Smart Reader plugin
 * Following Single Responsibility Principle with proper type safety
 */
export default class SmartReaderPlugin extends Plugin {
	settings: SmartReaderSettings;
	storageService: StorageService;
	// Add data property to store plugin data
	data: Record<string, any> = {};

	/**
	 * Initialize the plugin
	 * Following Single Responsibility Principle by separating initialization steps
	 */
	async onload() {
		// Load settings first
		await this.loadSettings();

		// Initialize data structure if needed
		if (!this.data) {
			this.data = {};
		}

		// Initialize the storage service with proper type safety
		this.storageService = new StorageService(this);
		
		// Verify storage service is working
		console.log('SmartReaderPlugin: Initializing storage service');
		const articles = await this.storageService.loadArticles();
		console.log(`SmartReaderPlugin: Loaded ${articles.length} articles on startup`);

		// Register the Smart Reader view
		this.registerView(VIEW_TYPE_SMART_READER, (leaf) => {
			const view = new SmartReaderView(leaf, this.storageService);
			view.icon = "album";
			return view;
		});

		// Add ribbon icon to activate the Smart Reader view
		const ribbonIconEl = this.addRibbonIcon("album", "Smart Reader", () => {
			this.activateView();
		});
		ribbonIconEl.addClass("smart-reader-ribbon-class");

		// Add command to open the Smart Reader view
		this.addCommand({
			id: 'open-smart-reader',
			name: 'Open Smart Reader',
			callback: () => this.activateView(),
		});

		// Add command to test content chunking functionality
		this.addCommand({
			id: testContentChunkingCommand.id,
			name: testContentChunkingCommand.name,
			callback: () => testContentChunkingCommand.execute(this),
		});

		// Add settings tab
		this.addSettingTab(new SmartReaderSettingTab(this.app, this));
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_SMART_READER);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: VIEW_TYPE_SMART_READER, active: true });
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	onunload() {}

	/**
	 * Load plugin settings from Obsidian storage
	 * Using proper TypeScript type safety
	 */
	async loadSettings() {
		// Load data first
		const data = await this.loadData();
		console.log('SmartReaderPlugin: Loaded data from storage:', data);
		
		// Merge with default settings
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			data?.settings || {}
		);
		
		// Initialize data structure if needed
		if (!this.data) {
			this.data = {};
		}
		
		// Store settings in data object
		this.data.settings = this.settings;
	}

	/**
	 * Save plugin settings to Obsidian storage
	 * Using proper TypeScript type safety
	 */
	async saveSettings() {
		// Initialize data structure if needed
		if (!this.data) {
			this.data = {};
		}
		
		// Store settings in data object
		this.data.settings = this.settings;
		
		// Save all data
		await this.saveData(this.data);
	}
}

/**
 * Settings tab for the Smart Reader plugin
 */
class SmartReaderSettingTab extends PluginSettingTab {
	plugin: SmartReaderPlugin;

	constructor(app: ObsidianApp, plugin: SmartReaderPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'Smart Reader Settings' });

		new Setting(containerEl)
			.setName("Save Path")
			.setDesc("Path where articles will be saved (optional)")
			.addText((text) =>
				text
					.setPlaceholder("Example: Articles/Read It Later/")
					.setValue(this.plugin.settings.savePath)
					.onChange(async (value) => {
						this.plugin.settings.savePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Note Template")
			.setDesc("Template for creating notes from articles. Available variables: {{title}}, {{content}}, {{url}}, {{date}}")
			.addTextArea((text) => {
				text
					.setPlaceholder("# {{title}}\n\n{{content}}")
					.setValue(this.plugin.settings.template)
					.onChange(async (value) => {
						this.plugin.settings.template = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 6;
				text.inputEl.cols = 40;
			});

		new Setting(containerEl)
			.setName("Date Format")
			.setDesc("Format for the {{date}} variable in the template")
			.addText((text) =>
				text
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
