import { FilterParams } from "./filter.ts";

export type Preset = {
  name: string,
  locked: boolean,
  filters: FilterParams[],
  preampGain: number
};
