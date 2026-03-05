export const API = {
  MYIP_URL: "https://api.myip.com",
} as const;

export const UI = {
  CMD_INSERT_IP_NAME: "Insert IP Info at Cursor",
  NOTICE_IP_INSERTED: "IP info inserted.",
  NOTICE_NO_MD_EDITOR: "No active Markdown editor found.",

  NOTICE_HTTP_ERROR: (status: number) =>
    `IP service returned an error (HTTP ${status}).`,
  NOTICE_PARSE_ERROR: "Failed to parse IP service response.",
  NOTICE_INCOMPLETE_DATA: "IP service returned incomplete data.",

  NOTICE_NETWORK_ERROR:
    "Network error: Unable to reach IP service. Check your internet connection.",
  NOTICE_UNEXPECTED_ERROR:
    "An unexpected error occurred while fetching IP info.",
  NOTICE_FETCH_ERROR: (msg: string) => `Failed to fetch IP info: ${msg}`,

  LABEL_IP: "IP Address:",
  LABEL_COUNTRY: "Country:",
} as const;
