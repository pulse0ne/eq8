<template>
  <div id="app">
    <div class="row">
      <div class="col align-center section dail-section">
        <div class="col align-center dial-wrapper">
          <div class="dial-label">Freq</div>
          <Dial :size="dialSize" :value="freqValue" :min="0" :max="1" @change="freqDialHandler"></Dial>
          <NumberEditLabel
            :value="fixedFrequency"
            :label="freqLabel"
            :min="10"
            :max="24000"
            @change="freqInputHandler"
          ></NumberEditLabel>
        </div>
        <div class="col align-center dial-wrapper">
          <div class="dial-label">Gain</div>
          <div @click="gainDisabled ? $noOp : gainValue = 0" class="zeroer" :class="{disabled: gainDisabled}">
            <i class="eq8 arrow_drop_down zeroer"></i>
          </div>
          <Dial :size="dialSize" :value="gainValue" :min="-20" :max="20" :disabled="gainDisabled" @change="gainDialHandler"></Dial>
          <NumberEditLabel
            :value="gainValue"
            :label="toFixed(gainValue) + ' dB'"
            :min="-20"
            :max="20"
            :disabled="gainDisabled"
            @change="gainDialHandler"
          ></NumberEditLabel>
        </div>
        <div class="col align-center dial-wrapper">
          <div class="dial-label">Q</div>
          <Dial :size="dialSize" :value="qValue" :min="0.01" :max="10" :disabled="qDisabled" @change="qDialHandler"></Dial>
          <NumberEditLabel
            :value="qValue"
            :label="toFixed(qValue)"
            :min="0.01"
            :max="10"
            :disabled="qDisabled"
            @change="qDialHandler"
          ></NumberEditLabel>
        </div>
      </div>
      <div class="col">
        <FrequencyResponsePlot
          :filters="frFilters"
          :context="frAudioContext"
          :freq-start="freqStart"
          :active-node="selectedFilter ? selectedFilter.id : null"
          @handle-selected="handleSelected"/>
        <div class="grow row">
          <div class="section grow col align-center justify-center" v-for="f in frFilters" :key="f.id">
            <Choose :options="filterOptions" :selected="editingFilterType" direction="up" @change="testSelectedHandler"></Choose>
            <div class="grow row align-center justify-end">
              <Checkbox class="filter-enable-checkbox" :value="f.enabled"></Checkbox>{{ f.id }}
            </div>
          </div>
        </div>
      </div>
      <div class="col section">
        TODO
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
  { iconClass: ['eq8', 'highpass'], value: 'highpass', title: 'High Pass', qEnabled: true, gainEnabled: false },
  { iconClass: ['eq8', 'lowshelf'], value: 'lowshelf', title: 'Low Shelf', qEnabled: false, gainEnabled: true },
  { iconClass: ['eq8', 'peaking'], value: 'peaking', title: 'Peaking', qEnabled: true, gainEnabled: true },
  { iconClass: ['eq8', 'notch'], value: 'notch', title: 'Notch', qEnabled: true, gainEnabled: false },
  { iconClass: ['eq8', 'highshelf'], value: 'highshelf', title: 'High Shelf', qEnabled: false, gainEnabled: true },
  { iconClass: ['eq8', 'lowpass'], value: 'lowpass', title: 'Low Pass', qEnabled: true, gainEnabled: false }
];

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
      dialSize: 55,
      filterOptions: opts,
      testSelected: opts[0], // TODO remove
      editingFilterType: opts[0], // TODO remove
      freqStart: 10.0,
      selectedFilter: null,
      frAudioContext: new WebAudioContext(),
      frFilters: []
    };
  },
  created () {
    browser.runtime.sendMessage({ type: 'GET::STATE' })
      .then(state => this.frFilters = this.$arrayCopy(state.filters))
      .then(() => this.selectedFilter = this.frFilters[0]);
  },
  methods: {
    gainDialHandler (value) {
      // TODO: communicate with back-end
      // this.gainValue = value;
    },
    qDialHandler (value) {
      // TODO: communicate with back-end
      // this.qValue = value;
    },
    freqDialHandler (value) {
      // TODO: communicate with back-end
      // this.freqValue = value;
    },
    testSelectedHandler (option) {
      this.testSelected = option;
      this.editingFilterType = option;
    },
    freqInputHandler (value) {
      // TODO: communicate with back-end
      // this.freqValue = (Math.log10(value / this.nyquist) / Math.log10(this.nyquist / this.freqStart)) + 1;
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
    }
  },
  computed: {
    nyquist () {
      return this.frAudioContext.sampleRate / 2;
    },
    fixedFrequency () {
      const f = this.freqValue;
      const o = Math.log10(this.nyquist / this.freqStart);
      return this.nyquist * Math.pow(10, o * (f - 1));
    },
    freqLabel () {
      const f = this.fixedFrequency;
      return f >= 1000 ? `${(f / 1000).toFixed(2)} kHz` : `${f.toFixed(2)} Hz`;
    },
    gainDisabled () {
      return !this.editingFilterType.gainEnabled;
    },
    qDisabled () {
      return !this.editingFilterType.qEnabled;
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
</style>
