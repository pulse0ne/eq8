import { EQState } from "./types/equalizer.js";
import { FilterParams } from "./types/filter.js";
import { UserSettings } from "./types/settings.js";
import { Theme } from "./types/theme.js";

const DEFAULT_FILTERS: FilterParams[] = [48, 225, 1067, 5060].map(f => {
  return { id: `default-${f}`, frequency: f, gain: 0.0, q: 1.0, type: "peaking" };
});

const DEFAULT_THEMES: Theme[] = [
  {
    name: "Default",
    schemaVersion: 1,
    locked: true,
    colors: {
      accentPrimary: "rgba(255, 195, 14, 1.0)",
      accentSecondary: "rgba(255, 195, 14, 1.0)",
      background: "rgba(24, 25, 26, 1.0)",
      border: "rgba(255, 255, 255, 0.7)",
      controlLabel: "rgba(254, 254, 254, 1.0)",
      controlTrack: "rgba(85, 89, 92, 1.0)",
      disabled: "rgba(180, 180, 180, 1.0)",
      dialKnob: "rgba(24, 25, 26, 1.0)",
      graphBackground: "rgba(35, 36, 39, 1)",
      graphLine: "rgba(64, 64, 64, 1.0)",
      graphLineMarker: "rgba(92, 92, 92, 1.0)",
      graphNodeColor1: "rgba(9, 182, 240, 0.5)",
      graphNodeColor2: "rgba(250, 236, 52, 0.5)",
      graphNodeColor3: "rgba(59, 250, 55, 0.5)",
      graphNodeColor4: "rgba(221, 55, 250, 0.5)",
      graphText: "rgba(128, 128, 128, 1.0)",
      selectBackground: "rgba(24, 25, 26, 1.0)",
      selectBorder: "rgba(255, 255, 255, 0.7)",
      selectText: "rgba(254, 254, 254, 1.0)",
      surface: "rgba(55, 56, 57, 1.0)",
      text: "rgba(254, 254, 254, 1.0)"
    }
  },
  {
    name: "Barbie",
    schemaVersion: 1,
    locked: true,
    colors: {
      accentPrimary: "rgba(239, 67, 151, 1)",
      accentSecondary: "rgba(154, 157, 159, 1)",
      background: "rgba(255, 255, 255, 1)",
      border: "rgba(115, 44, 122, 0.53)",
      controlLabel: "rgba(96, 88, 97, 1)",
      controlTrack: "rgba(86, 20, 80, 0.13)",
      disabled: "rgba(180, 180, 180, 1.0)",
      dialKnob: "rgba(23, 24, 26, 0)",
      graphBackground: "rgba(255, 201, 235, 0.05)",
      graphLine: "rgba(144, 54, 144, 0.24)",
      graphLineMarker: "rgba(175, 48, 164, 0.54)",
      graphNodeColor1: "rgba(9, 182, 240, 0.5)",
      graphNodeColor2: "rgba(250, 52, 52, 0.5)",
      graphNodeColor3: "rgba(36, 195, 33, 0.5)",
      graphNodeColor4: "rgba(221, 55, 250, 0.5)",
      graphText: "rgba(128, 128, 128, 1.0)",
      selectBackground: "rgba(255, 255, 255, 1)",
      selectText: "rgba(96, 88, 97, 1)",
      selectBorder: "rgba(115, 44, 122, 0.53)",
      surface: "rgba(92, 172, 238, 0.05)",
      text: "rgba(96, 88, 97, 1)"
    },
  },
  {
    name: "Nord Light",
    schemaVersion: 1,
    locked: true,
    colors: {
      accentPrimary: "rgba(94, 129, 172, 1.0)",
      accentSecondary: "rgba(255, 255, 255, 0.9)",
      background: "rgba(236, 239, 244, 1.0)",
      border: "rgba(76, 86, 106, 1.0)",
      controlLabel: "rgba(45, 52, 64, 1.0)",
      controlTrack: "rgba(229, 233, 240, 1.0)",
      dialKnob: "rgba(45, 52, 64, 1.0)",
      disabled: "rgba(180, 180, 180, 1.0)",
      graphBackground: "rgba(229, 233, 240, 1)",
      graphLine: "rgba(94, 129, 172, 0.25)",
      graphLineMarker: "rgba(94, 129, 172, 0.5)",
      graphNodeColor1: "rgba(9, 182, 240, 0.5)",
      graphNodeColor2: "rgba(250, 52, 52, 0.5)",
      graphNodeColor3: "rgba(36, 195, 33, 0.5)",
      graphNodeColor4: "rgba(221, 55, 250, 0.5)",
      graphText: "rgba(45, 52, 64, 0.5)",
      selectBackground: "rgba(236, 239, 244, 1.0)",
      selectBorder: "rgba(94, 129, 172, 1.0)",
      selectText: "rgba(45, 52, 64, 1.0)",
      surface: "rgba(216, 222, 233, 1.0)",
      text: "rgba(45, 52, 64, 1.0)"
    }
  },
  {
    name: "Nord Dark",
    schemaVersion: 1,
    locked: true,
    colors: {
      accentPrimary: "rgba(94, 129, 172, 1.0)",
      accentSecondary: "rgba(255, 255, 255, 0.9)",
      background: "rgba(46, 52, 64, 1.0)",
      border: "rgba(76, 86, 106, 1.0)",
      controlLabel: "rgba(236, 239, 244, 1.0)",
      controlTrack: "rgba(59, 66, 82, 1.0)",
      dialKnob: "rgba(216, 222, 233, 1.0)",
      disabled: "rgba(180, 180, 180, 1.0)",
      graphBackground: "rgba(67, 76, 94, 1)",
      graphLine: "rgba(236, 239, 244, 0.25)",
      graphLineMarker: "rgba(236, 239, 244, 0.5)",
      graphNodeColor1: "rgba(9, 182, 240, 0.5)",
      graphNodeColor2: "rgba(250, 236, 52, 0.5)",
      graphNodeColor3: "rgba(59, 250, 55, 0.5)",
      graphNodeColor4: "rgba(221, 55, 250, 0.5)",
      graphText: "rgba(236, 239, 244, 0.5)",
      selectBackground: "rgba(46, 52, 64, 1.0)",
      selectBorder: "rgba(94, 129, 172, 1.0)",
      selectText: "rgba(236, 239, 244, 1.0)",
      surface: "rgba(76, 86, 106, 1.0)",
      text: "rgba(236, 239, 244, 1.0)"
    }
  },
  {
    name: "Gap",
    schemaVersion: 1,
    locked: true,
    colors: {
      accentPrimary: "rgba(158, 194, 242, 1)",
      accentSecondary: "rgba(255, 195, 14, 1.0)",
      background: "rgba(0, 19, 33, 1)",
      border: "rgba(158, 194, 242, 0.7)",
      controlLabel: "rgba(0, 19, 33, 1)",
      controlTrack: "rgba(13, 19, 33, 0.39)",
      dialKnob: "rgba(255, 255, 255, 0)",
      disabled: "rgba(180, 180, 180, 1.0)",
      graphBackground: "rgba(0, 46, 69, 0.47)",
      graphLine: "rgba(64, 64, 64, 1.0)",
      graphLineMarker: "rgba(92, 92, 92, 1.0)",
      graphNodeColor1: "rgba(9, 182, 240, 0.5)",
      graphNodeColor2: "rgba(250, 236, 52, 0.5)",
      graphNodeColor3: "rgba(59, 250, 55, 0.5)",
      graphNodeColor4: "rgba(221, 55, 250, 0.5)",
      graphText: "rgba(128, 128, 128, 1.0)",
      selectBackground: "rgba(240, 235, 216, 1)",
      selectBorder: "rgba(0, 0, 0, 0.7)",
      selectText: "rgba(13, 19, 33, 1)",
      surface: "rgba(240, 235, 216, 1)",
      text: "rgba(158, 194, 242, 1)"
    }
  },
  {
    name: "Logic",
    schemaVersion: 1,
    locked: true,
    colors: {
      accentPrimary: "rgba(83, 143, 245, 1)",
      accentSecondary: "rgba(33, 75, 255, 1)",
      background: "rgba(1, 4, 9, 1)",
      border: "rgba(255, 255, 255, 1)",
      controlLabel: "rgba(255, 255, 255, 0.65)",
      controlTrack: "rgba(255, 255, 255, 0.06)",
      dialKnob: "rgba(12, 19, 27, 0)",
      disabled: "rgba(180, 180, 180, 1.0)",
      graphBackground: "rgba(21, 37, 55, 1)",
      graphLine: "rgba(255, 255, 255, 0.19)",
      graphLineMarker: "rgba(255, 255, 255, 0.4)",
      graphNodeColor1: "rgba(9, 182, 240, 0.5)",
      graphNodeColor2: "rgba(250, 236, 52, 0.5)",
      graphNodeColor3: "rgba(59, 250, 55, 0.5)",
      graphNodeColor4: "rgba(221, 55, 250, 0.5)",
      graphText: "rgba(255, 255, 255, 0.72)",
      selectBackground: "rgba(255, 255, 255, 0)",
      selectBorder: "rgba(255, 255, 255, 0.44)",
      selectText: "rgba(255, 255, 255, 0.76)",
      surface: "rgba(6, 15, 26, 1)",
      text: "rgba(254, 254, 254, 1.0)"
    }
  },
  {
    name: "Live",
    schemaVersion: 1,
    locked: true,
    colors: {
      accentPrimary: "rgba(255, 201, 7, 1)",
      accentSecondary: "rgba(255, 239, 33, 1)",
      background: "rgba(81, 81, 81, 1)",
      border: "rgba(255, 255, 255, 1)",
      controlLabel: "rgba(0, 0, 0, 1)",
      controlTrack: "rgba(0, 0, 0, 0)",
      dialKnob: "rgba(101, 101, 101, 1)",
      disabled: "rgba(180, 180, 180, 1.0)",
      graphBackground: "rgba(24, 30, 34, 1)",
      graphLine: "rgba(255, 255, 255, 0.19)",
      graphLineMarker: "rgba(255, 255, 255, 0.4)",
      graphNodeColor1: "rgba(9, 182, 240, 0.5)",
      graphNodeColor2: "rgba(250, 236, 52, 0.5)",
      graphNodeColor3: "rgba(59, 250, 55, 0.5)",
      graphNodeColor4: "rgba(221, 55, 250, 0.5)",
      graphText: "rgba(255, 255, 255, 0.72)",
      selectBackground: "rgba(0, 0, 0, 0)",
      selectBorder: "rgba(0, 0, 0, 0.44)",
      selectText: "rgba(0, 0, 0, 1)",
      surface: "rgba(182, 178, 177, 1)",
      text: "rgba(254, 254, 254, 1.0)"
    }
  },
  {
    name: "ProQ",
    schemaVersion: 1,
    locked: true,
    colors: {
      accentPrimary: "rgba(198, 52, 216, 1)",
      accentSecondary: "rgba(211, 33, 255, 1)",
      background: "rgba(8, 6, 9, 1)",
      border: "rgba(255, 255, 255, 1)",
      controlLabel: "rgba(255, 255, 255, 0.76)",
      controlTrack: "rgba(255, 255, 255, 0.14)",
      dialKnob: "rgba(8, 6, 9, 1)",
      disabled: "rgba(180, 180, 180, 1.0)",
      graphBackground: "rgba(25, 20, 26, 1)",
      graphLine: "rgba(255, 255, 255, 0.19)",
      graphLineMarker: "rgba(255, 255, 255, 0.4)",
      graphNodeColor1: "rgba(9, 182, 240, 0.5)",
      graphNodeColor2: "rgba(250, 236, 52, 0.5)",
      graphNodeColor3: "rgba(59, 250, 55, 0.5)",
      graphNodeColor4: "rgba(221, 55, 250, 0.5)",
      graphText: "rgba(255, 255, 255, 0.72)",
      selectBackground: "rgba(9, 7, 10, 1)",
      selectBorder: "rgba(255, 255, 255, 0.44)",
      selectText: "rgba(255, 255, 255, 0.76)",
      surface: "rgba(37, 35, 40, 1)",
      text: "rgba(254, 254, 254, 1.0)"
    },
  }
];

const DEFAULT_STATE: EQState = {
  filters: DEFAULT_FILTERS,
  preamp: 0.0,
  enabled: true
};

const DEFAULT_SETTINGS: UserSettings = {
  drawCompositeResponse: true
};

export {
  DEFAULT_FILTERS,
  DEFAULT_STATE,
  DEFAULT_THEMES,
  DEFAULT_SETTINGS
};
