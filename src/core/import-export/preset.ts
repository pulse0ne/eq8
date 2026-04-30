import JSZip from "jszip";
import { FilterParams } from "../types/filter.ts";
import { Preset } from "../types/preset.ts";
import { FREQ_START } from "../audio-constants.ts";
import { StorageKeys } from "../storage-keys.ts";
import { downloadBlob } from "../utils/downloadBlob.ts";
import { load, update } from "../utils/storageUtils.ts";

/** EXPORTER **/

function filterToApoLine(filter: FilterParams, index: number): string {
  const tokens = [`Filter ${index + 1}:`, "ON"];
  const [ fc, gain, q ] = [ filter.frequency.toFixed(0), filter.gain.toFixed(1), filter.q.toFixed(3) ];
  switch (filter.type) {
    case "allpass":
      tokens.push(`AP Fc ${fc} Hz Q ${q}`);
      break;
    case "bandpass":
      tokens.push(`BP Fc ${fc} Hz Q ${q}`);
      break;
    case "highpass":
      tokens.push(`HPQ Fc ${fc} Hz Q ${q}`);
      break;
    case "highshelf":
      tokens.push(`HSC Fc ${fc} Hz Gain ${gain} dB Q ${q}`);
      break;
    case "lowpass":
      tokens.push(`LPQ Fc ${fc} Hz Q ${q}`);
      break;
    case "lowshelf":
      tokens.push(`LSC Fc ${fc} Hz Gain ${gain} dB Q ${q}`);
      break;
    case "notch":
      tokens.push(`NO Fc ${fc} Hz Q ${q}`);
      break;
    case "peaking":
      tokens.push(`PK Fc ${fc} Hz Gain ${gain} dB Q ${q}`);
      break;
  }
  return tokens.join(" ");
}

function exportPresets() {
  const version = browser.runtime.getManifest().version;
  const date = new Date().toISOString();
  load<Preset[]>(StorageKeys.PRESETS, []).then(presets => {
    const zip = new JSZip();
    const folder = zip.folder("eqplus-presets");
    presets.forEach(preset => {
      const lines = [
        "# This preset was exported from eq+",
        `# [VERSION] : ${version}`,
        `# [NAME]    : ${preset.name}`,
        `# [DATE]    : ${date}`
      ];
      lines.push(`Preamp: ${preset.preampGain.toFixed(1)} dB`);
      preset.filters.forEach((filter, ix) => lines.push(filterToApoLine(filter, ix)));

      folder?.file(`${preset.name}.txt`, lines.join("\n"));
    });
    zip.generateAsync({ type: "blob" }).then(blob => downloadBlob(blob, `eqplus-presets-export-${date}.zip`));
  });
}


/** IMPORTER **/

const SILENTLY_IGNORE = ["Device"];
const FILTER_KEY = "Filter";
const PREAMP_KEY = "Preamp";
const CHANNEL_KEY = "Channel";

const filterRegex = /(?<id>Filter \d+):\s*(?<tokens>.+)/;
const preampRegex = /Preamp:\s*(?<preamp>.+) dB/;

export type WithSoftErrors<T> = T & { softErrors: string[] };

function processFilterType(filterType: string): BiquadFilterType {
  switch (filterType) {
    case "PK":
      return "peaking";
    case "LP":
    case "LPQ":
      return "lowpass";
    case "HP":
    case "HPQ":
      return "highpass";
    case "BP":
      return "bandpass";
    case "LS":
    case "LSC":
      return "lowshelf";
    case "HS":
    case "HSC":
      return "highshelf";
    case "NO":
      return "notch";
    case "AP":
      return "allpass";
    default:
      throw Error(`Unsupported filter type: ${filterType}`);
  }
}

function processFilterLine(line: string): FilterParams {
  const filter: FilterParams = {
    id: "",
    frequency: FREQ_START,
    gain: 0.0,
    q: 1.0,
    type: "peaking"
  };

  const match = line.match(filterRegex);
  if (!match || !match.groups) {
    throw Error(`Malformed filter line: ${line}`);
  }
  filter.id = `Imported: ${match.groups.id}`;
  const tokens = (match.groups.tokens?.split(/\s+/) ?? []).reverse();
  if (!tokens.length) {
    throw Error(`No parameters given for line: ${line}`);
  }

  do {
    const t = tokens.pop();
    if (t === "ON") {
      const filterType = tokens.pop();
      if (!filterType) throw Error(`Malformed filter line (missing values): ${line}`);
      filter.type = processFilterType(filterType);
    } else if (t === "Fc") {
      const rawFreqVal = tokens.pop();
      const Hz = tokens.pop();
      if (!Hz || Hz !== "Hz" || !rawFreqVal) throw Error(`Malformed filter line (missing values): ${line}`);
      const freqVal = parseFloat(rawFreqVal);
      if (isNaN(freqVal)) throw Error(`Malformed filter line (invalid frequency): ${line}`);
      filter.frequency = freqVal;
    } else if (t === "Gain") {
      const rawGain = tokens.pop();
      const dB = tokens.pop();
      if (!dB || dB !== "dB" || !rawGain) throw Error(`Malformed filter line (missing values): ${line}`);
      const gainVal = parseFloat(rawGain);
      if (isNaN(gainVal)) throw Error(`Malformed filter line (invalid gain): ${line}`);
      filter.gain = gainVal;
    } else if (t === "Q") {
      const rawQ = tokens.pop();
      if (!rawQ) throw Error(`Malformed filter line (missing Q value): ${line}`);
      const qVal = parseFloat(rawQ);
      if (isNaN(qVal)) throw Error(`Malformed filter line (bad Q value): ${line}`);
      filter.q = qVal;
    }
  } while (tokens.length);

  return filter;
}

function processPreampLine(line: string): number {
  const match = line.match(preampRegex);
  if (!match || !match.groups) {
    throw Error(`Malformed preamp line: ${line}`);
  }
  const raw = match.groups.preamp;
  const preamp = parseFloat(raw);
  if (isNaN(preamp)) throw Error(`Malformed preamp line (bad gain): ${line}`);
  return preamp;
}

function importPreset(file: Blob): Promise<WithSoftErrors<{ preset: Preset}>> {
  return file.text().then(rawText => {
    const softErrors: string[] = [];
    const lines = rawText.split("\n").map(l => l.trim());
    const filters: FilterParams[] = [];
    let preamp = 0.0;
    for (const line of lines) {
      // comments, blank lines, etc.
      if (line.startsWith("#") || !line) {
        continue;
      }

      // silently ignored directives
      if (SILENTLY_IGNORE.some(i => line.startsWith(i))) {
        continue;
      }

      // error on split channels
      if (line.startsWith(CHANNEL_KEY)) {
        throw Error("Independent channel EQ is not currently supported");
      }

      // preamp
      if (line.startsWith(PREAMP_KEY)) {
        try {
          preamp = processPreampLine(line);
        } catch (e) {
          softErrors.push((e as Error).message);
        }
        continue;
      }

      // filters
      if (line.startsWith(FILTER_KEY)) {
        try {
          const filter = processFilterLine(line);
          filters.push(filter);
        } catch (e) {
          softErrors.push((e as Error).message);
        }
        continue;
      }

      // something unknown
      softErrors.push(`Ignoring unsupported or unrecognized configuration: ${line}`);
    }
    return Promise.resolve({
      preset: {
        name: `Imported Preset ${new Date().toISOString()}`,
        locked: false,
        filters,
        preampGain: preamp
      },
      softErrors
    });
  }).then(result => {
    update<Preset[]>(StorageKeys.PRESETS, [], existing => {
      if (existing.some(p => p.name.toLowerCase() === result.preset.name.toLowerCase())) {
        throw Error("preset already exists");
      }
      return [...existing, result.preset];
    });
    return result;
  });
}

export {
  exportPresets, importPreset
};
