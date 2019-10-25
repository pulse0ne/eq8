const $storage = browser.storage.local;
const contentScripts = [];

const defaultFilters = [
  {
    id: 1,
    frequency: 46,
    gain: 0.0,
    q: 0.0,
    type: 'lowshelf',
    enabled: true
  },
  {
    id: 2,
    frequency: 215,
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: true
  },
  {
    id: 3,
    frequency: 1000,
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: true
  },
  {
    id: 4,
    frequency: 4642,
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: true
  },
  {
    id: 5,
    frequency: 711,
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: false
  },
  {
    id: 6,
    frequency: 1668,
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: false
  },
  {
    id: 7,
    frequency: 3914,
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: false
  },
  {
    id: 8,
    frequency: 9182,
    gain: 0.0,
    q: 1.0,
    type: 'highshelf',
    enabled: false
  }
];

const copyHack = obj => JSON.parse(JSON.stringify(obj));

// https://gist.github.com/jed/982883
const uuid = a => a
  ? (a ^ Math.random() * 16 >> a / 4).toString(16)
  : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);

const state = {
  enabled: true,
  filters: copyHack(defaultFilters),
  preampMultiplier: 1.0,
  settings: {
    sensitivity: 1024
  },
  presets: {
    'd9c9ad7c-4ba6-4a7d-9f37-2e476fdfafba': {
      name: 'Default',
      locked: true,
      image: null,
      icon: 'audiotrack',
      filters: copyHack(defaultFilters),
      preampMultiplier: 1.0
    }
  }
};

const iconSizes = [16, 32, 48, 96, 128];
const { icons, iconsSelected } = iconSizes.reduce((a, c) => {
  a.icons[String(c)] = `icons/icon-${c}.png`;
  a.iconsSelected[String(c)] = `icons/icon-${c}-selected.png`;
  return a;
}, { icons: {}, iconsSelected: {} });

const STORAGE_KEY = '::state';

// noinspection DuplicatedCode
const throttle = function (func, threshold, context) {
  if (!threshold || threshold < 0) threshold = 250;
  let last;
  let deferred;
  return function () {
    const self = context || this;
    const now = +new Date();
    const args = arguments;
    if (last && now < last + threshold) {
      clearTimeout(deferred);
      deferred = setTimeout(function () {
        last = now;
        func.apply(self, args);
      }, threshold);
    } else {
      last = now;
      func.apply(self, args);
    }
  };
};

const broadcastMessage = throttle((msg) => $storage.set({ [STORAGE_KEY]: state })
  .then(() => contentScripts.forEach(p => p.postMessage(msg))), 50);

const broadcastState = () => broadcastMessage({ type: 'SET::STATE', state });

$storage.get([STORAGE_KEY])
  .then(g => g[STORAGE_KEY] ? Promise.resolve(Object.assign(state, g[STORAGE_KEY])) : $storage.set({ [STORAGE_KEY]: state }))
  .catch(() => $storage.set({ [STORAGE_KEY]: state }))
  .finally(() => {
    browser.browserAction.setIcon({ path: state.enabled ? iconsSelected : icons });

    browser.runtime.onConnect.addListener(port => {
      if (port.name === 'eq8') {
        contentScripts.push(port);
        port.onDisconnect.addListener(() => {
          const ix = contentScripts.indexOf(port);
          if (ix > -1) {
            contentScripts.splice(ix, 1);
          }
        });
      }

      port.onMessage.addListener(msg => {
        switch (msg.type) {
        case 'GET::STATE':
          port.postMessage({ type: 'SET::STATE', state });
          break;
        case 'SET::FILTER':
          const id = msg.filter.id;
          const f = state.filters.find(f => f.id === id);
          f.frequency = msg.filter.frequency;
          f.gain = msg.filter.gain;
          f.q = msg.filter.q;
          f.type = msg.filter.type;
          f.enabled = msg.filter.enabled;
          broadcastState();
          break;
        case 'SET::ENABLED':
          state.enabled = msg.enabled;
          browser.browserAction.setIcon({ path: state.enabled ? iconsSelected : icons });
          broadcastState();
          break;
        case 'SET::PREAMP':
          state.preampMultiplier = msg.preampMultiplier;
          broadcastState();
          break;
        case 'SET::SETTINGS':
          state.settings = msg.settings;
          broadcastState();
          break;
        case 'RESET::FILTERS':
          state.filters = copyHack(defaultFilters);
          state.preampMultiplier = 1.0;
          broadcastState();
          break;
        case 'SAVE::PRESET':
          const presetId = msg.id || uuid();
          state.presets[presetId] = msg.preset;
          broadcastState();
          break;
        case 'DELETE::PRESET':
          delete state.presets[msg.id];
          broadcastState();
          break;
        case 'LOAD::PRESET':
          const pre = state.presets[msg.id];
          state.filters = copyHack(pre.filters);
          state.preampMultiplier = pre.preampMultiplier;
          broadcastState();
          break;
        default:
          console.error('Unrecognized message: ' + msg);
          break;
        }
      });
    });

    browser.runtime.onMessage.addListener(msg => msg.type === 'GET::STATE' ? Promise.resolve(state) : Promise.resolve());
  });
