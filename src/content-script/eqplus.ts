import { DEFAULT_STATE } from "../core/defaults.ts";
import { EQState } from "../core/types/equalizer.ts";
import { BroadcastMessage } from "../core/types/messaging.ts";
import throttle from "../core/utils/throttle.ts";
import { toScalar } from "../core/utils/scalarDecibelConverter.ts";

type FilterNode = {
  id: string;
  filter: BiquadFilterNode;
};

type FilterBank = {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  filters: FilterNode[];
  preamp: GainNode;
  element: HTMLMediaElement;
};

const filterBanks: FilterBank[] = [];
let state: EQState = DEFAULT_STATE;
let observer: MutationObserver | null = null;

function arrangeFilters(bank: FilterBank) {
  const { context, source, filters, preamp } = bank;
  filters.sort((a, b) => b.filter.frequency.value - a.filter.frequency.value);
  filters.forEach((f, ix, arr) => {
    if (ix > 0) filters[ix - 1].filter.connect(f.filter);
    if (ix === arr.length - 1) f.filter.connect(context.destination);
  });
  if (state?.enabled && filters.length) {
    preamp.connect(filters[0].filter);
    source.connect(preamp);
  } else {
    source.connect(context.destination);
  }
}

function createPipelineForElement(element: HTMLMediaElement) {
  const { filters, preamp } = state;
  const context = new AudioContext();
  const source = context.createMediaElementSource(element);
  const elementFilters: FilterNode[] = [];
  filters.forEach((filter) => {
    const f = context.createBiquadFilter();
    const { frequency, q, gain, type, id } = filter;
    f.frequency.value = frequency;
    f.Q.value = q;
    f.gain.value = gain;
    f.type = type;
    elementFilters.push({ filter: f, id });
  });
  const preampNode = context.createGain();
  preampNode.gain.value = toScalar(preamp);
  const bank = { context, source, filters: elementFilters, preamp: preampNode, element };
  arrangeFilters(bank);
  filterBanks.push(bank);
}

function updatePipelines() {
  filterBanks.forEach((bank) => {
    const { context, source, filters, preamp } = bank;

    bank.filters = filters.filter(
      (node) => state.filters.some((f) => f.id === node.id)
    );

    state.filters.forEach((f) => {
      const entry = bank.filters.find((i) => i.id === f.id);
      if (entry) {
        entry.filter.frequency.value = f.frequency;
        entry.filter.type = f.type;
        entry.filter.Q.value = f.q;
        entry.filter.gain.value = f.gain;
      } else {
        const node = context.createBiquadFilter();
        node.frequency.value = f.frequency;
        node.type = f.type;
        node.Q.value = f.q;
        node.gain.value = f.gain;
        bank.filters.push({ filter: node, id: f.id });
      }
    });

    preamp.gain.value = toScalar(state.preamp);
    source.disconnect();
    preamp.disconnect();
    filters.forEach((f) => f.filter.disconnect());
    arrangeFilters(bank);
  });
}

function messageHandler(message: BroadcastMessage) {
  if (message.type === "stateUpdated") {
    state = message.payload;
    updatePipelines();
  }
}

function mutationHandler() {
  const mediaElements = ([...document.body.querySelectorAll("video")] as HTMLMediaElement[])
    .concat([...document.body.querySelectorAll("audio")]);

  mediaElements
    .filter((el) => el.getAttribute("eqplus") !== "true")
    .forEach((el) => {
      console.log("[eq8]: new audio source discovered");
      el.setAttribute("eqplus", "true");
      createPipelineForElement(el);
    });

  for (let i = filterBanks.length - 1; i >= 0; i--) {
    if (!mediaElements.includes(filterBanks[i].element)) {
      console.log("[eq8]: media element removed");
      filterBanks.splice(i, 1);
    }
  }
}

function init() {
  const port = browser.runtime.connect({ name: "eq+" });
  port.onMessage.addListener(messageHandler as (m: object) => void);

  browser.runtime.sendMessage({ type: "getState" }).then((initialState: EQState | null) => {
    if (initialState) {
      state = initialState;
    }
    const domListener = throttle(mutationHandler, 250);
    observer = new MutationObserver(domListener);
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

init();

export { }; // IMPORTANT: keep this
