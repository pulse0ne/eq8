<template>
    <div class="col p1">
      <div class="col m1 settings-section">
        <h2>Settings</h2>
        <div class="row">
          <label for="sensitivity" class="mr1"></label>
          <input id="sensitivity" type="range" min="0" max="9" step="1" :value="sensitivity" @change="sensitivityChanged">
        </div>
      </div>
      <div class="col m1 settings-section">
        <h2>Presets</h2>
      </div>
    </div>
</template>

<script>
const port = browser.runtime.connect({ name: 'eq8' });

export default {
  name: 'Options',
  data () {
    return {
      sensitivity: 4
    };
  },
  created () {
    port.onMessage.addListener(this.handleState.bind(this));
    port.postMessage({ type: 'GET::STATE' });
  },
  methods: {
    sensitivityChanged ($event) {
      const value = parseInt($event.target.value);
      console.log(value);
    },
    handleState (msg) {
      console.log(msg);
    }
  }
};
</script>

<style lang="scss" scoped>
  @import 'styles/base';

  .settings-section:not(:last-child) { border-bottom: 1px solid rgba(0, 0, 0, 0.1); }

  $track-w: 128px;
  $track-h: 4px;
  $thumb-d: 12px;

  @mixin track() {
    box-sizing: border-box;
    border: none;
    width: $track-w; height: $track-h;
    background: #ccc;
  }

  @mixin thumb() {
    box-sizing: border-box;
    border: none;
    width: $thumb-d; height: $thumb-d;
    border-radius: 50%;
    background: $line-color;
  }

  [type='range'] {
    &, &::-webkit-slider-thumb {
      -webkit-appearance: none;
    }

    margin: 0;
    padding: 0;
    width: $track-w; height: $thumb-d;
    background: transparent;
    font: 1em/1 arial, sans-serif;

    &::-webkit-slider-runnable-track {
      @include track
    }
    &::-moz-range-track { @include track }
    &::-ms-track { @include track }

    &::-webkit-slider-thumb {
      margin-top: .5*($track-h - $thumb-d);
      @include thumb
    }
    &::-moz-range-thumb { @include thumb }
    &::-ms-thumb {
      margin-top: 0;
      @include thumb
    }

    &::-ms-tooltip { display: none }
  }
</style>
