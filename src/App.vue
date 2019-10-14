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
            <i class="eq8-arrow_drop_down zeroer"></i>
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
        <FrequencyResponsePlot :filters="frFilters" :context="frAudioContext" :freq-start="freqStart"></FrequencyResponsePlot>
        <div class="grow row">
          <div class="section grow col align-center justify-center" v-for="a in 8" :key="a">
            <Choose :options="testOpts" :selected="editingFilterType" direction="up" @change="testSelectedHandler"></Choose>
            <div class="grow row align-center justify-end">
              <Checkbox class="filter-enable-checkbox"></Checkbox>{{ a }}
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

const opts = [
  { icon: 'eq8-lowpass', value: 'lowpass', title: 'Low Pass', qEnabled: true, gainEnabled: false },
  { icon: 'eq8-lowshelf', value: 'lowshelf', title: 'Low Shelf', qEnabled: false, gainEnabled: true },
  { icon: 'eq8-peaking', value: 'peaking', title: 'Peaking', qEnabled: true, gainEnabled: true },
  { icon: 'eq8-notch', value: 'notch', title: 'Notch', qEnabled: true, gainEnabled: false },
  { icon: 'eq8-highshelf', value: 'highshelf', title: 'High Shelf', qEnabled: false, gainEnabled: true },
  { icon: 'eq8-highpass', value: 'highpass', title: 'High Pass', qEnabled: true, gainEnabled: false }
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
      testVal: 0,
      testOpts: opts,
      testSelected: opts[0],
      editingFilterType: opts[0],
      qValue: 1.0,
      freqValue: 0.2411251725194261, // 64Hz
      gainValue: 0,
      freqStart: 10.0,
      frAudioContext: new AudioContext(),
      frFilters: []
    };
  },
  methods: {
    gainDialHandler (value) {
      this.gainValue = value;
    },
    qDialHandler (value) {
      this.qValue = value;
    },
    freqDialHandler (value) {
      this.freqValue = value;
    },
    testSelectedHandler (option) {
      this.testSelected = option;
      this.editingFilterType = option;
    },
    freqInputHandler (value) {
      this.freqValue = (Math.log10(value / this.nyquist) / Math.log10(this.nyquist / this.freqStart)) + 1;
    },
    toFixed (value) {
      return value.toFixed(2);
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
    }
  },
  watch: {
    fixedFrequency () {
      // window.requestAnimationFrame(this.draw);
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
