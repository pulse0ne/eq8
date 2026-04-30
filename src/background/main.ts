import { DEFAULT_STATE } from "../core/defaults.ts";
import { StorageKeys } from "../core/storage-keys.ts";
import { EQState } from "../core/types/equalizer.ts";
import { BroadcastMessage, ControlMessage } from "../core/types/messaging.ts";
import debounce from "../core/debounce.ts";
import fastCopy from "../core/utils/fastCopy.ts";
import { load, save } from "../core/utils/storageUtils.ts";
import throttle from "../core/utils/throttle.ts";
import { FilterParams } from "../core/types/filter.ts";
import { migrateLegacyState } from "../core/utils/migrate.ts";

const contentScriptPorts: browser.runtime.Port[] = [];

const defaultState: EQState = fastCopy(DEFAULT_STATE);

const broadcastMessage = throttle((message: BroadcastMessage) => {
  contentScriptPorts.forEach((port) => port.postMessage(message));
}, 50);

const broadcastState = (state: EQState) => broadcastMessage({ type: "stateUpdated", payload: state } as BroadcastMessage);

const loadState = () => load(StorageKeys.EQ_STATE, defaultState);

const saveStateDebounced: (state: EQState) => void = debounce((state: EQState) => {
  save(StorageKeys.EQ_STATE, state);
}, 250);

async function handleUpdateFilter(updatedFilter: FilterParams): Promise<EQState>{
  const state = await loadState();
  const filterToUpdate = state.filters.find(f => f.id === updatedFilter.id);
  if (filterToUpdate) {
    filterToUpdate.frequency = updatedFilter.frequency;
    filterToUpdate.gain = updatedFilter.gain;
    filterToUpdate.q = updatedFilter.q;
    filterToUpdate.type = updatedFilter.type;
    saveStateDebounced(state);
  }
  return state;
}

async function handleUpdatePreamp(preampValue: number): Promise<EQState> {
  const state = await loadState();
  if (Number.isFinite(preampValue)) {
    state.preamp = preampValue;
    saveStateDebounced(state);
  }
  return state;
}

async function handleAddFilter(filter: FilterParams): Promise<EQState> {
  const state = await loadState();
  const newFilters = [...state.filters, filter];
  const newState = { ...state, filters: newFilters };
  saveStateDebounced(newState);
  return newState;
}

async function handleRemoveFilter(id: string): Promise<EQState> {
  const state = await loadState();
  const filterIndex = state.filters.findIndex(f => f.id === id);
  if (filterIndex > -1) {
    state.filters.splice(filterIndex, 1);
    saveStateDebounced(state);
  }
  return state;
}

async function handleSetFilters(filters: FilterParams[]): Promise<EQState> {
  const state = await loadState();
  state.filters = filters;
  saveStateDebounced(state);
  return state;
}

async function handleUpdateEnabled(enabled: boolean): Promise<EQState> {
  const state = await loadState();
  state.enabled = enabled;
  saveStateDebounced(state);
  return state;
}

function handleUnknown(msg: any) {
  console.error('unknown message type:', msg.type);
}

function setupListeners() {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === "eq+") {
      contentScriptPorts.push(port);
      port.onDisconnect.addListener(() => {
        const ix = contentScriptPorts.indexOf(port);
        if (ix > -1) {
          contentScriptPorts.splice(ix, 1);
        }
      });
    }
  });

  browser.runtime.onMessage.addListener(((message: ControlMessage) => {
    console.debug("got message:", message);
    switch (message.type) {
      case "getState":
        return loadState().then(broadcastState);
      case "addFilter":
        return handleAddFilter(message.payload as FilterParams)
          .then(broadcastState);
      case "removeFilter":
        return handleRemoveFilter(message.payload as string)
          .then(broadcastState);
      case "updateFilter":
        return handleUpdateFilter(message.payload as FilterParams)
          .then(broadcastState);
      case "updatePreamp":
        return handleUpdatePreamp(message.payload as number)
          .then(broadcastState);
      case "setFilters":
        return handleSetFilters(message.payload as FilterParams[])
          .then(broadcastState);
      case "updateEnabled":
        return handleUpdateEnabled(message.payload as boolean)
          .then(broadcastState);
      default:
        handleUnknown(message);
        return Promise.resolve();
    }
  }) as (m: object) => void);

  console.log("[eq8]: background script listeners initialized");
}

migrateLegacyState().then(setupListeners);

export { }; // IMPORTANT: keep this
