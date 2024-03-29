<template>
  <div id="app">
    <div class="row">
      <div class="col align-center section dail-section">
        <div class="col align-center dial-wrapper">
          <div class="dial-label">Freq</div>
          <Dial
            :size="dialSize"
            :value="freqValue"
            :min="0"
            :max="1"
            :disabled="freqDisabled"
            :wheel-sensitivity="settings.sensitivity"
            @change="freqDialHandler"
          />
          <NumberEditLabel
            :value="fixedFrequency"
            :label="freqLabel"
            :min="10"
            :max="nyquist"
            :disabled="freqDisabled"
            @change="freqInputHandler"
          />
        </div>
        <div class="col align-center dial-wrapper">
          <div class="dial-label">Gain</div>
          <div
            @click="gainDisabled ? $noOp : gainDialHandler(0)"
            class="zeroer"
            :class="{disabled: gainDisabled}"
          >
            <i class="eq8 arrow_drop_down zeroer"></i>
          </div>
          <Dial
            :size="dialSize"
            :value="gainValue"
            :min="-20"
            :max="20"
            :disabled="gainDisabled"
            :wheel-sensitivity="settings.sensitivity"
            @change="gainDialHandler"
          />
          <NumberEditLabel
            :value="gainValue"
            :label="toFixed(gainValue) + ' dB'"
            :min="-20"
            :max="20"
            :disabled="gainDisabled"
            @change="gainDialHandler"
          />
        </div>
        <div class="col align-center dial-wrapper">
          <div class="dial-label">Q</div>
          <Dial
            :size="dialSize"
            :value="qValue"
            :min="0"
            :max="10"
            :disabled="qDisabled"
            :wheel-sensitivity="settings.sensitivity"
            @change="qDialHandler"
          />
          <NumberEditLabel
            :value="qValue"
            :label="toFixed(qValue)"
            :min="0"
            :max="10"
            :disabled="qDisabled"
            @change="qDialHandler"
          />
        </div>
      </div>
      <div class="col">
        <FrequencyResponsePlot
          :disabled="!eqEnabled"
          :filters="frFilters"
          :context="frAudioContext"
          :freq-start="freqStart"
          :active-node="selectedFilter ? selectedFilter.id : null"
          :wheel-sensitivity="settings.sensitivity"
          @handle-selected="handleSelected"
          @filter-changed="frFilterChanged"
        />
        <div class="grow row">
          <div
            class="section grow col align-center justify-center"
            v-for="f in frFilters"
            :key="f.id"
            :class="{ selected: selectedFilter && f.id === selectedFilter.id, selectable: eqEnabled && f.enabled }"
            @click="selectFilter(f)"
          >
            <Choose
              :options="filterOptions"
              :selected="filterTypeForFilter(f)"
              :disabled="!eqEnabled"
              direction="up"
              @change="changeFilterType(f, ...arguments)"
            />
            <div class="grow row align-center justify-end">
              <Checkbox
                class="filter-enable-checkbox"
                :value="f.enabled"
                :disabled="!eqEnabled"
                @input="toggleFilterEnabled(f)"
              /><span class="no-select">{{ f.id }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col section justify-space-between">
        <div class="col align-center mb3">
          <div class="master-enable" @click="toggleMasterEnabled" title="Enable/Disable">
            <i class="eq8 power_settings_new" :class="{ enabled: eqEnabled }"></i>
          </div>
        </div>
        <div class="col justify-center align-center">
          <i class="eq8 save settings-btn" title="Save As Preset" @click="savePresetOpen = true"></i>
        </div>
        <div class="col justify-center align-center">
          <i class="eq8 tune settings-btn" title="Presets" @click="presetsOpen = true"></i>
        </div>
        <div class="col justify-center align-center">
          <i class="eq8 refresh settings-btn" title="Reset" @click="handleReset"></i>
        </div>
        <div class="col justify-center align-center">
          <i class="eq8 settings settings-btn" title="Options" @click="settingsOpen = true"></i>
        </div>
        <div class="col align-center my2">
          <div class="dial-label">Preamp</div>
          <div
            @click="!eqEnabled ? $noOp : preampDialHandler(1.0)"
            class="zeroer"
            :class="{disabled: !eqEnabled}"
          >
            <i class="eq8 arrow_drop_down zeroer"></i>
          </div>
          <Dial
            :size="dialSize"
            :value="preampMultiplier"
            :min="0"
            :max="2"
            :disabled="!eqEnabled"
            :wheel-sensitivity="settings.sensitivity"
            @change="preampDialHandler"
          />
          <NumberEditLabel
            :value="preampMultiplier"
            :label="toFixed(preampMultiplier)"
            :min="0"
            :max="2"
            :disabled="!eqEnabled"
            @change="preampDialHandler"
          />
        </div>
      </div>
    </div>
    <SettingsModal v-if="settingsOpen" @close="settingsOpen = false" v-model="settingsValue" />
    <PresetsModal v-if="presetsOpen" @close="presetsOpen = false" v-model="presetsValue" @delete="deletePreset" @load="loadPreset" />
    <SavePresetModal v-if="savePresetOpen" @close="savePresetOpen = false" :img="presetImage" @save="savePreset" />
  </div>
</template>

<script>
import Dial from './components/Dial';
import Choose from './components/Choose';
import NumberEditLabel from './components/NumberEditLabel';
import Checkbox from './components/Checkbox';
import FrequencyResponsePlot from './components/FrequencyResponsePlot';
import SettingsModal from './components/SettingsModal';
import PresetsModal from './components/PresetsModal';
import SavePresetModal from './components/SavePresetModal';

const WebAudioContext = (window.AudioContext || window.webkitAudioContext);

const opts = [
  { iconClass: ['eq8', 'highpass'], value: 'highpass', title: 'High Pass', qEnabled: false, gainEnabled: false },
  { iconClass: ['eq8', 'lowshelf'], value: 'lowshelf', title: 'Low Shelf', qEnabled: false, gainEnabled: true },
  { iconClass: ['eq8', 'peaking'], value: 'peaking', title: 'Peaking', qEnabled: true, gainEnabled: true },
  { iconClass: ['eq8', 'notch'], value: 'notch', title: 'Notch', qEnabled: true, gainEnabled: false },
  { iconClass: ['eq8', 'highshelf'], value: 'highshelf', title: 'High Shelf', qEnabled: false, gainEnabled: true },
  { iconClass: ['eq8', 'lowpass'], value: 'lowpass', title: 'Low Pass', qEnabled: false, gainEnabled: false }
];

const port = browser.runtime.connect({ name: 'eq8' });

export default {
  name: 'app',
  components: {
    FrequencyResponsePlot,
    Dial,
    Choose,
    NumberEditLabel,
    Checkbox,
    SavePresetModal,
    SettingsModal,
    PresetsModal
  },
  data () {
    return {
      eqEnabled: true,
      dialSize: 55,
      filterOptions: opts,
      freqStart: 10.0,
      preampMultiplier: 1.0,
      selectedFilter: null,
      frAudioContext: new WebAudioContext(),
      frFilters: [],
      settings: {},
      presets: {},
      presetImage: null,
      settingsOpen: false,
      presetsOpen: false,
      savePresetOpen: false
    };
  },
  created () {
    this.$bus.$on('fr-snapshot', snapshot => this.presetImage = snapshot);
    port.onMessage.addListener(msg => msg.type === 'SET::STATE' ? this.stateUpdateHandler(msg.state) : this.$noOp());
    this.$runtime.sendMessage({ type: 'GET::STATE' })
      .then(this.stateUpdateHandler)
      .then(() => this.selectedFilter = this.frFilters[0]);
  },
  methods: {
    stateUpdateHandler ({ filters, enabled, preampMultiplier, settings, presets }) {
      this.frFilters = this.$arrayCopy(filters);
      this.eqEnabled = enabled;
      this.preampMultiplier = preampMultiplier;
      this.settings = this.$arrayCopy(settings);
      this.presets = presets;
      if (this.selectedFilter) {
        this.selectedFilter = this.frFilters.find(f => f.id === this.selectedFilter.id && f.enabled);
      }
    },
    gainDialHandler (value) {
      const newFilter = Object.assign(this.selectedFilter, { gain: value });
      port.postMessage({ type: 'SET::FILTER', filter: newFilter });
    },
    preampDialHandler (value) {
      port.postMessage({ type: 'SET::PREAMP', preampMultiplier: value });
    },
    qDialHandler (value) {
      port.postMessage({ type: 'SET::FILTER', filter: Object.assign(this.selectedFilter, { q: value }) });
    },
    freqDialHandler (value) {
      const o = Math.log10(this.nyquist / this.freqStart);
      const f = this.nyquist * Math.pow(10, o * (value - 1));
      port.postMessage({ type: 'SET::FILTER', filter: Object.assign(this.selectedFilter, { frequency: f }) });
    },
    changeFilterType (filter, option) {
      const q = option.value.endsWith('pass') ? 0.0 : 1.0;
      const gain = 0.0;
      port.postMessage({ type: 'SET::FILTER', filter: Object.assign(filter, { type: option.value, q, gain }) });
    },
    freqInputHandler (value) {
      port.postMessage({ type: 'SET::FILTER', filter: Object.assign(this.selectedFilter, { frequency: value }) });
    },
    toFixed (value) {
      return value.toFixed(2);
    },
    frequencyToValue (value) {
      return (Math.log10(value / this.nyquist) / Math.log10(this.nyquist / this.freqStart)) + 1;
    },
    handleSelected (id) {
      const sel = this.frFilters.find(f => f.id === id);
      if (sel) {
        this.selectedFilter = sel;
      }
    },
    filterTypeForFilter (filter) {
      return filter ? this.filterOptions.find(o => o.value === filter.type) : {};
    },
    selectFilter (filter) {
      if (this.eqEnabled && filter.enabled) {
        this.selectedFilter = filter;
      }
    },
    toggleFilterEnabled (filter) {
      port.postMessage({ type: 'SET::FILTER', filter: Object.assign(filter, { enabled: !filter.enabled }) });
    },
    frFilterChanged (change) {
      const filter = this.frFilters.find(f => f.id === change.id);
      if (filter) {
        delete change.id;
        port.postMessage({ type: 'SET::FILTER', filter: Object.assign(filter, change) });
      }
    },
    toggleMasterEnabled () {
      port.postMessage({ type: 'SET::ENABLED', enabled: !this.eqEnabled });
    },
    handleReset () {
      port.postMessage({ type: 'RESET::FILTERS' });
    },
    savePreset (presetMeta) {
      const preset = {
        name: presetMeta.name,
        icon: presetMeta.icon,
        image: this.presetImage,
        filters: this.frFilters,
        preampMultiplier: this.preampMultiplier
      };
      port.postMessage({ type: 'SAVE::PRESET', preset });
      this.savePresetOpen = false;
    },
    loadPreset (presetId) {
      port.postMessage({ type: 'LOAD::PRESET', id: presetId });
      this.presetsOpen = false;
    },
    deletePreset (presetId) {
      port.postMessage({ type: 'DELETE::PRESET', id: presetId });
    }
  },
  computed: {
    nyquist () {
      return this.frAudioContext.sampleRate * 0.5;
    },
    fixedFrequency () {
      return this.selectedFilter ? this.selectedFilter.frequency : this.freqStart;
    },
    freqLabel () {
      const f = this.fixedFrequency;
      return f >= 1000 ? `${(f / 1000).toFixed(2)} kHz` : `${f.toFixed(2)} Hz`;
    },
    freqDisabled () {
      return !this.eqEnabled;
    },
    gainDisabled () {
      return !this.eqEnabled || !this.filterTypeForFilter(this.selectedFilter).gainEnabled;
    },
    qDisabled () {
      return !this.eqEnabled || !this.filterTypeForFilter(this.selectedFilter).qEnabled;
    },
    gainValue () {
      return this.selectedFilter ? this.selectedFilter.gain : 0;
    },
    qValue () {
      return this.selectedFilter ? this.selectedFilter.q : 1.0;
    },
    freqValue () {
      return this.frequencyToValue(this.selectedFilter ? this.selectedFilter.frequency : this.freqStart);
    },
    presetsValue: {
      get () { return this.presets; },
      set (nv) { console.log('here'); port.postMessage({ type: 'SET::PRESETS', presets: nv }); }
    },
    settingsValue: {
      get () { return this.settings; },
      set (nv) { console.log(nv); port.postMessage({ type: 'SET::SETTINGS', settings: nv }); }
    }
  },
  watch: {
    savePresetOpen (nv) {
      if (!nv) {
        this.presetImage = null;
      } else {
        this.$bus.$emit('request-fr-snapshot');
      }
    }
  }
};
</script>

<style lang="scss">
@import './styles/base';
@import './styles/fonts';
@import './styles/modal';

* { box-sizing: border-box; }

body {
  padding: 0;
  margin: 0;
  font-family: 'Open Sans', sans-serif;
  background-color: $background;
  color: #fefefe;
  overflow-x: auto;
}

button {
  background-color: black;
  color: white;
  padding: 0.5em 2em;
  border: none;
  border-radius: 4px;
  @include standard-shadow;

  &:not(:disabled):hover {
    cursor: pointer;
    background-color: #111;
    @include hover-shadow;
  }

  &:disabled {
    background-color: #666;
  }

  &.small {
    padding: 0.35em 1.5em;
    font-size: 0.9em;
  }
}

$_justify_values: flex-start, flex-end, start, end, left, right, center, space-between, space-around, space-evenly;
@each $v in $_justify_values {
  .justify-#{$v} {
    justify-content: #{$v};
  }
}

$_align_values: stretch, flex-start, start, self-start, flex-end, end, self-end, center, baseline;
@each $v in $_align_values {
  .align-#{$v} {
    align-items: #{$v};
  }
}

$_spacer_types: margin, padding;
$_spacer_values: 4, 8, 16, 32;
$_spacer_dirs: top, right, bottom, left;
@each $t in $_spacer_types {
  @each $v in $_spacer_values {
    $ix: index($_spacer_values, $v);
    $f: str_slice($t, 0, 1);
    .#{$f}#{$ix} {
      #{$t}: #{$v}px;
    }
    @each $d in $_spacer_dirs {
      $s: str_slice($d, 0, 1);
      .#{$f}#{$s}#{$ix} {
        #{$t}-#{$d}: #{$v}px;
      }
    }
    .#{$f}x#{$ix} {
      #{$t}-left: #{$v}px;
      #{$t}-right: #{$v}px;
    }
    .#{$f}y#{$ix} {
      #{$t}-top: #{$v}px;
      #{$t}-bottom: #{$v}px;
    }
  }
}

.col, .row { display: flex; }
.col { flex-direction: column; }
.row { flex-direction: row; }
.grow { flex: 1; }

#app {
  font-size: 12px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 4px;
  min-width: 750px;
}

.dial-wrapper {
  margin: 6px 0;
}

.dial-label {
  @include no-select;
}

.section {
  background: $section-color;
  border-radius: 4px;
  padding: 6px;
  margin: 2px;
  transition: background-color $bezier-transition;

  &.selectable:not(.selected):hover {
    background: lighten($section-color, 5%);
  }

  &.selected {
    background: $selected-section-color;
  }
}

.dial-section {
  min-width: 75px;
}

.zeroer {
  margin: -0.5em 0;
  cursor: pointer;

  &.disabled i {
    color: $disabled-color;
  }

  i {
    font-size: 1.5em;
    color: $accent-color;
  }
}

.filter-enable-checkbox {
  margin-right: 0.75em;
}

.master-enable {
  cursor: pointer;

  &:hover {
    .eq8 {
      color: white;
    }
  }

  .eq8 {
    font-size: 32px;
    margin: 8px;
    color: $disabled-color;
    transition: color $bezier-transition;

    &.enabled {
      color: $accent-color;
    }
  }
}

.settings-btn {
  cursor: pointer;
  font-size: 20px;
  margin: 8px;
  transition: color $bezier-transition;

  &:hover {
    color: $accent-color;
  }
}

.no-select {
  @include no-select;
}
</style>
