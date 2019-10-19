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
    frequency: 64, // TODO
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: false
  },
  {
    id: 6,
    frequency: 64, // TODO
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: false
  },
  {
    id: 7,
    frequency: 64, // TODO
    gain: 0.0,
    q: 1.0,
    type: 'peaking',
    enabled: false
  },
  {
    id: 8,
    frequency: 64, // TODO
    gain: 0.0,
    q: 1.0,
    type: 'highshelf',
    enabled: false
  }
];

const state = {
  enabled: true,
  filters: JSON.parse(JSON.stringify(defaultFilters)),
  presets: {
    'Default': defaultFilters
  },
  selectedPreset: ''
};

const iconSizes = [16, 32, 48, 96, 128];
const { icons, iconsSelected } = iconSizes.reduce((a, c) => {
  a.icons[String(c)] = `icons/icon-${c}.png`;
  a.iconsSelected[String(c)] = `icons/icon-${c}-selected.png`;
  return a;
}, { icons: {}, iconsSelected: {} });

const STORAGE_KEY = '::state';

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

const broadcastMessage = throttle((msg) => $storage.set({ [STORAGE_KEY]: state }).then(() => contentScripts.forEach(p => p.postMessage(msg))), 50);

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
          broadcastMessage({ type: 'SET::STATE', state });
          break;
        case 'SET::ENABLED':
          state.enabled = msg.enabled;
          browser.browserAction.setIcon({ path: state.enabled ? iconsSelected : icons });
          broadcastMessage({ type: 'SET::STATE', state });
          break;
        default:
          console.error('Unrecognized message: ' + msg);
          break;
        }
      });
    });

    browser.runtime.onMessage.addListener(msg => {
      if (msg.type === 'GET::STATE') {
        return Promise.resolve(state);
      } else if (msg.type === 'DELETE::PRESET') {
        delete state.presets[msg.preset];
        return $storage.set({ [STORAGE_KEY]: state }).then(() => Promise.resolve(state));
      } else if (msg.type === 'SAVE::PRESET') {
        state.presets[msg.name] = JSON.parse(JSON.stringify(state.filters));
        return $storage.set({ [STORAGE_KEY]: state }).then(() => {
          broadcastMessage({ type: 'SET::STATE', state });
          return Promise.resolve(state);
        });
      }
      return Promise.resolve();
    });
  });
