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
            @change="freqDialHandler"
          />
          <NumberEditLabel
            :value="fixedFrequency"
            :label="freqLabel"
            :min="10"
            :max="24000"
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
          @handle-selected="handleSelected"
          @filter-changed="frFilterChanged"
        />
        <div class="grow row">
          <div
            class="section grow col align-center justify-center"
            v-for="f in frFilters"
            :key="f.id"
            :class="{ 'selected': selectedFilter && f.id === selectedFilter.id }"
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
              />{{ f.id }}
            </div>
          </div>
        </div>
      </div>
      <div class="col section">
        <div class="grow">
          <div class="master-enable" @click="toggleMasterEnabled" title="Enable/Disable">
            <i class="eq8 power_settings_new" :class="{ enabled: eqEnabled }"></i>
          </div>
        </div>
        <div class="col justify-center align-center">
          <i class="eq8 settings settings-btn" title="Options"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Dial from './components/Dial';
import Choose from './components/Choose';
import NumberEditLabel from './components/NumberEditLabel';
import Checkbox from './components/Checkbox';
import FrequencyResponsePlot from './components/FrequencyResponsePlot';

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
    Checkbox
  },
  data () {
    return {
      eqEnabled: true,
      dialSize: 55,
      filterOptions: opts,
      freqStart: 10.0,
      selectedFilter: null,
      frAudioContext: new WebAudioContext(),
      frFilters: []
    };
  },
  created () {
    port.onMessage.addListener(msg => msg.type === 'SET::STATE' ? this.stateUpdateHandler(msg.state) : this.$noOp());
    this.$runtime.sendMessage({ type: 'GET::STATE' })
      .then(this.stateUpdateHandler)
      .then(() => this.selectedFilter = this.frFilters[0]);
  },
  methods: {
    stateUpdateHandler ({ filters, enabled }) {
      this.frFilters = this.$arrayCopy(filters);
      this.eqEnabled = enabled;
      if (this.selectedFilter) {
        this.selectedFilter = this.frFilters.find(f => f.id === this.selectedFilter.id);
      }
    },
    gainDialHandler (value) {
      const newFilter = Object.assign(this.selectedFilter, { gain: value });
      port.postMessage({ type: 'SET::FILTER', filter: newFilter });
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
    }
  },
  computed: {
    nyquist () {
      return this.frAudioContext.sampleRate * 0.5;
    },
    fixedFrequency () { // TODO this isn't necessary anymore (selectedFilter will have the "fixed" frequency value)
      const f = this.freqValue;
      const o = Math.log10(this.nyquist / this.freqStart);
      return this.nyquist * Math.pow(10, o * (f - 1));
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
    }
  }
};
</script>

<style lang="scss">
  @import './styles/base';

  #app {
    font-size: 12px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 4px;
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

    &.selected {
      background: $selected-section-color;
    }
  }

  .dial-section {
    min-width: 75px;
  }

  .zeroer {
    margin: -0.5em 0;

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
</style>
