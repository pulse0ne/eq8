import { EQState } from "./equalizer.ts";
import { FilterParams } from "./filter.ts";

// messages received by background script
export type ControlMessageType = "getState" | "updateFilter" | "addFilter" | "removeFilter" | "updatePreamp" | "setFilters" | "updateEnabled";

// messages received by content-scripts
export type BroadcastMessageType = "stateUpdated";

export type ControlMessage = {
  type: ControlMessageType;
  payload: FilterParams | FilterParams[] | string | number | boolean;
};

export type BroadcastMessage = {
  type: BroadcastMessageType;
  payload: EQState;
};
