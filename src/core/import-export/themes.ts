import { StorageKeys } from "../storage-keys.ts";
import { downloadBlob } from "../utils/downloadBlob.ts";
import { load, update } from "../utils/storageUtils.ts";
import { DEFAULT_THEMES } from "../defaults.ts";
import { Theme } from "../types/theme.ts";

/** EXPORTER **/

function exportThemes() {
  load(StorageKeys.SAVED_THEMES, [])
    .then(themes => new Blob([JSON.stringify(themes)], { type: "text/plain" }))
    .then(blob => downloadBlob(blob, `eqplus-theme-export-${new Date().toISOString()}.json`));
}


/** IMPORTER **/

const paragon = DEFAULT_THEMES[0];

const validateSingle = (val: unknown) => {
  if (!val || typeof val !== "object") {
    return false;
  }

  const topLevelExpected = Object.keys(paragon);
  const topLevelActual = Object.keys(val);

  // check basic top-level fields
  if (!topLevelExpected.every(key => {
    return topLevelActual.includes(key) &&
      (typeof paragon[key as keyof Theme] === typeof (val as Record<string, unknown>)[key]);
  })) {
    return false;
  }

  const withColor = val as unknown & { colors: unknown };
  // check color type
  if (!withColor.colors || typeof withColor.colors !== "object") {
    return false;
  }

  const colorExpected = Object.keys(paragon.colors);
  const colorActual = Object.keys(withColor.colors);

  // check color keys
  if (!colorExpected.every(key => {
    return colorActual.includes(key) &&
      (typeof paragon.colors[key as keyof Theme["colors"]] === typeof (withColor.colors as Record<string, unknown>)[key]);
  })) {
    return false;
  }

  // check color formats
  if (Object.values(withColor.colors).some(c => !/rgba\(\d+, ?\d+, ?\d+, .+?\)/.test(c as string))) {
    return false;
  }

  return true;
};

const deserialize = (rawThemeString: string) => {
  if (!rawThemeString.startsWith("[") || !rawThemeString.endsWith("]")) {
    return null;
  }
  try {
    const arrayOfUnknown = JSON.parse(rawThemeString) as unknown[];
    const allValid = arrayOfUnknown.every(validateSingle);
    if (allValid) {
      return arrayOfUnknown as Theme[];
    }
  } catch (e) {
    // nothing
  }
  return null;
};

function importThemes(blob: Blob): Promise<Theme[]|null> {
  return blob.text().then(rawThemeString => {
    const themes = deserialize(rawThemeString);
    if (!themes) {
      return null;
    } else {
      return update<Theme[]>(StorageKeys.SAVED_THEMES, [], oldValues => {
        const newThemes: Theme[] = [...themes].reverse();
        oldValues.reverse().forEach(v => {
          if (!newThemes.find(t => t.name === v.name)) {
            newThemes.push(v);
          }
        });
        return newThemes.reverse();
      });
    }
  });
}


export {
  exportThemes, importThemes
};
