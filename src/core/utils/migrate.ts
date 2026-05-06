import { StorageKeys } from "../storage-keys.ts";
import { EQState } from "../types/equalizer.ts";
import { Preset } from "../types/preset.ts";
import { toDecibel } from "./scalarDecibelConverter.ts";
import { clear, load, save } from "./storageUtils.ts";
import uuid from "./uuid.ts";

type LegacyFilter = {
  id: number;
  frequency: number;
  q: number;
  gain: number;
  type: string;
  enabled: boolean;
};

type LegacyStoredState = {
  enabled: boolean;
  preampMultiplier: number;
  filters: LegacyFilter[];
  presets: Record<string, {
    name: string;
    locked: boolean;
    icon: string;
    filters: LegacyFilter[];
    preampMultiplier: number;
  }>;
};

export function migrateLegacyState(): Promise<any> {
  return load<LegacyStoredState | null>("::state", null).then(maybeLegacyState => {
    if (!maybeLegacyState) return;

    console.log("Found legacy state, migrating...");
    const storagePromises: Promise<any>[] = [];
    const { enabled, preampMultiplier, filters, presets } = maybeLegacyState;

    const newState: EQState = {
      enabled: enabled || false,
      preamp: toDecibel(preampMultiplier || 1.0),
      filters: filters.filter(f => f.enabled).map(f => ({
        id: uuid(),
        frequency: f.frequency || 100.0,
        q: f.q || 1.0,
        gain: f.gain || 0.0,
        type: f.type as any as BiquadFilterType || "peaking",
      }))
    };

    storagePromises.push(save(StorageKeys.EQ_STATE, newState));
    console.log("Migrated state to new format:", newState);

    const newPresets: Preset[] = Object.values(presets).map(p => ({
      name: p.name,
      locked: false,
      filters: p.filters.filter(f => f.enabled).map(f => ({
        id: uuid(),
        frequency: f.frequency,
        q: f.q,
        gain: f.gain,
        type: f.type as any as BiquadFilterType,
      })),
      preampGain: toDecibel(p.preampMultiplier)
    }));

    storagePromises.push(save(StorageKeys.PRESETS, newPresets));
    console.log("Migrated presets to new format:", newPresets);

    storagePromises.push(save("legacyStateBackup", maybeLegacyState));

    return Promise.allSettled(storagePromises).then(() => {
      console.log("Migration complete, clearing legacy state...");
      return clear("::state");
    });
  });
}
