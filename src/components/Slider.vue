<template>
  <div class="slider-wrap" :class="{ vert: orient === 'vertical' }">
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      v-model="localVal"
    >
  </div>
</template>

<script>
export default {
  name: 'Slider',
  props: {
    min: Number,
    max: Number,
    step: Number,
    value: Number,
    orient: String
  },
  computed: {
    localVal: {
      get () {
        return this.value;
      },
      set (nv) {
        this.$emit('input', parseInt(nv));
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/base';

$track-w: 100%;
$track-h: 4px;
$thumb-d: 12px;

@mixin track() {
  box-sizing: border-box;
  border: none;
  width: $track-w;
  height: $track-h;
  background: #ccc;
  border-radius: $track-h / 2;
}

@mixin thumb() {
  box-sizing: border-box;
  border: none;
  width: $thumb-d;
  height: $thumb-d;
  border-radius: 50%;
  background: $line-color;
}

.slider-wrap {
  position: relative;
  width: $track-w;
  height: $thumb-d;

  [type='range'] {
    &, &::-webkit-slider-thumb { -webkit-appearance: none; }

    margin: 0;
    padding: 0;
    width: $track-w;
    height: $thumb-d;
    background: transparent;

    &::-moz-range-track { @include track; }
    &::-moz-range-thumb { @include thumb; }

    &::-webkit-slider-runnable-track { @include track; }
    &::-webkit-slider-thumb {
      margin-top: .5*($track-h - $thumb-d);
      @include thumb;
    }
  }
}

.slider-wrap.vert {
  position: relative;
  width: $thumb-d;
  height: $track-w;

  [type='range'] {
    &, &::-webkit-slider-thumb { -webkit-appearance: none; }

    position: absolute;
    top: 50%;
    left: 50%;
    margin: 0;
    padding: 0;
    width: $track-w;
    height: $thumb-d;
    transform: translate(-50%, -50%) rotate(-90deg);
    background: transparent;

    &::-moz-range-track { @include track; }
    &::-moz-range-thumb { @include thumb; }

    &::-webkit-slider-runnable-track { @include track; }
    &::-webkit-slider-thumb {
      margin-top: .5*($track-h - $thumb-d);
      @include thumb;
    }
  }
}
</style>
