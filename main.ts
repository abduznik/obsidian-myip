import {
  Plugin,
  MarkdownView,
  Notice,
  requestUrl,
  PluginSettingTab,
  App,
  Setting,
} from "obsidian";
import type { MyIPResponse, MyIPSettings } from "./src/types";
import { DEFAULT_SETTINGS } from "./src/types";
import { API, UI } from "./src/constants";

export default class MyIPPlugin extends Plugin {
  settings!: MyIPSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new MyIPSettingTab(this.app, this));

    this.registerCommands();
  }

  private registerCommands() {
    this.addCommand({
      id: "insert-ip-info-inline",
      name: UI.CMD_INSERT_IP_NAME,
      callback: async () => {
        if (!this.ensureSettingsValid()) return;
        const data = await this.fetchIPInfo();
        if (!data) return;

        const html = `
<div class="ip-info-box">
  <div><strong>${UI.LABEL_IP}</strong> ${data.ip}</div>
  <div><strong>${UI.LABEL_COUNTRY}</strong> ${data.country} (${data.cc})</div>
</div>
          `.trim();

        const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (mdView && mdView.editor) {
          mdView.editor.replaceSelection(html);
          new Notice(UI.NOTICE_IP_INSERTED);

          if (this.settings.autoCopyOnInsert) {
            await navigator.clipboard.writeText(data.ip);
          }
        } else {
          new Notice(UI.NOTICE_NO_MD_EDITOR);
        }
      },
    });

    this.addCommand({
      id: "copy-ip-to-clipboard",
      name: UI.CMD_COPY_IP_NAME,
      callback: async () => {
        if (!this.ensureSettingsValid()) return;
        const data = await this.fetchIPInfo();
        if (!data) return;

        await navigator.clipboard.writeText(data.ip);
        new Notice(UI.NOTICE_IP_COPIED);
      },
    });
  }

  /**
   * Ensures required settings are present before executing logic.
   */
  private ensureSettingsValid(): boolean {
    // Basic guard example
    if (!this.settings) {
      new Notice("Plugin settings not loaded correctly.");
      return false;
    }
    return true;
  }

  private async fetchIPInfo(): Promise<MyIPResponse | null> {
    try {
      const response = await requestUrl({
        url: API.MYIP_URL,
        method: "GET",
        throw: false,
      });

      if (response.status < 200 || response.status >= 300) {
        new Notice(UI.NOTICE_HTTP_ERROR(response.status));
        console.error("HTTP error:", response.status, response.text);
        return null;
      }

      let data: MyIPResponse;
      try {
        data = JSON.parse(response.text);
      } catch (parseError) {
        new Notice(UI.NOTICE_PARSE_ERROR);
        console.error("JSON parse error:", parseError);
        return null;
      }

      if (!data.ip || !data.country || !data.cc) {
        new Notice(UI.NOTICE_INCOMPLETE_DATA);
        console.error("Incomplete response:", data);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Failed to fetch IP info:", err);

      if (err instanceof Error) {
        if (
          err.message.includes("net::ERR") ||
          err.message.includes("Failed to fetch")
        ) {
          new Notice(UI.NOTICE_NETWORK_ERROR);
        } else {
          new Notice(UI.NOTICE_FETCH_ERROR(err.message));
        }
      } else {
        new Notice(UI.NOTICE_UNEXPECTED_ERROR);
      }
      return null;
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class MyIPSettingTab extends PluginSettingTab {
  plugin: MyIPPlugin;

  constructor(app: App, plugin: MyIPPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName(UI.SETTING_AUTO_COPY_NAME)
      .setDesc(UI.SETTING_AUTO_COPY_DESC)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoCopyOnInsert)
          .onChange(async (value) => {
            this.plugin.settings.autoCopyOnInsert = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
