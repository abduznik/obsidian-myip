export interface MyIPResponse {
  ip: string;
  country: string;
  cc: string;
}

export interface MyIPSettings {
  autoCopyOnInsert: boolean;
}

export const DEFAULT_SETTINGS: MyIPSettings = {
  autoCopyOnInsert: false,
};
