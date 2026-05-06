const key = (suffix: string) => `eqplus:${suffix}`;

export namespace StorageKeys {
  export const EQ_STATE = key("state:eq");
  export const THEME_STATE = key("state:theme");
  export const SAVED_THEMES = key("themes");
  export const PRESETS = key("presets");
  export const TAB_INFO = key("tabinfo");
  export const TUTORIAL_SEEN = key("tutorial");
  export const SETTINGS = key("settings");
}
