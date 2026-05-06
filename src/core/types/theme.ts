import { Color } from "./color.ts";

export type Theme = {
  name: string,
  schemaVersion: number,
  locked: boolean,
  colors: {
    accentPrimary: Color,
    accentSecondary: Color,
    background: Color,
    border: Color,
    controlLabel: Color,
    controlTrack: Color,
    dialKnob: Color,
    disabled: Color,
    graphBackground: Color,
    graphLine: Color,
    graphLineMarker: Color,
    graphNodeColor1: Color,
    graphNodeColor2: Color,
    graphNodeColor3: Color,
    graphNodeColor4: Color,
    graphText: Color,
    selectBackground: Color,
    selectBorder: Color,
    selectText: Color,
    surface: Color,
    text: Color
  }
};
