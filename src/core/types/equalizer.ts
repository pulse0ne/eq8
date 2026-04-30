import { FilterParams } from "./filter.ts";

export type EQState = {
  filters: FilterParams[];
  preamp: number;
  enabled: boolean;
};
