import { Plugin, MarkdownView, Notice, requestUrl } from "obsidian";
import type { MyIPResponse } from "./src/types";
import { API, UI } from "./src/constants";

export default class MyIPPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "insert-ip-info-inline",
      name: UI.CMD_INSERT_IP_NAME,
      callback: async () => {
        try {
          const response = await requestUrl({
            url: API.MYIP_URL,
            method: "GET",
            throw: false,
          });

          if (response.status < 200 || response.status >= 300) {
            new Notice(UI.NOTICE_HTTP_ERROR(response.status));
            console.error("HTTP error:", response.status, response.text);
            return;
          }

          let data: MyIPResponse;
          try {
            data = JSON.parse(response.text);
          } catch (parseError) {
            new Notice(UI.NOTICE_PARSE_ERROR);
            console.error("JSON parse error:", parseError);
            return;
          }

          if (!data.ip || !data.country || !data.cc) {
            new Notice(UI.NOTICE_INCOMPLETE_DATA);
            console.error("Incomplete response:", data);
            return;
          }

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
          } else {
            new Notice(UI.NOTICE_NO_MD_EDITOR);
          }
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
        }
      },
    });
  }
}
