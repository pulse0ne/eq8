<template>
  <div class="choose" :class="{open: show, disabled: disabled}">
    <div @click="openOptions" class="choose-display">
      <i v-if="selected.iconClass" :class="selected.iconClass"></i>
      <span v-if="selected.text">{{ selected.text }}</span>
      <i class="eq8 arrow_drop_down bigger-icon"></i>
    </div>
    <div class="choose-popup" :style="popupStyle" ref="popup" v-if="show">
      <div v-for="opt in options" :key="opt.value" class="option" @click="optionSelected(opt)" :title="opt.title">
        <i v-if="opt.iconClass" :class="opt.iconClass"></i>
        <span v-if="opt.text">{{ opt.text }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Choose',
  data () {
    return {
      show: false
    };
  },
  props: {
    selected: Object,
    options: Array,
    direction: { type: String, default: 'down' },
    disabled: Boolean
  },
  computed: {
    popupStyle () {
      const s = {
        left: 0,
        width: '100%',
        textAlign: this.options[0].icon ? 'center' : 'left'
      };
      this.direction === 'up' ? s.bottom = 0 : s.top = 0;
      return s;
    }
  },
  methods: {
    openOptions () {
      this.show = true;
      setTimeout(() => document.addEventListener('click', this.bodyClickHandler));
    },
    bodyClickHandler () {
      document.removeEventListener('click', this.bodyClickHandler);
      this.show = false;
    },
    optionSelected (option) {
      this.$emit('change', option);
    }
  }
};
</script>

<style lang="scss" scoped>
  @import '../styles/base';

  .bigger-icon {
    font-size: 1.5em;
  }

  .choose {
    border: $border;
    padding: 0.3em 0 0.3em 0.75em;
    border-radius: $standard-border-radius;
    position: relative;
    background-color: $background;
    transition: all $bezier-transition;

    &.disabled {
      background-color: lighten($background, 25%);
    }

    .choose-display {
      display: flex;
      align-items: center;
    }

    &.open {
      border-color: transparent;
    }

    .choose-popup {
      position: absolute;
      padding: 2px;
      background: $background;
      border: $border;
      border-radius: $standard-border-radius;
      z-index: 999;
      @include standard-shadow;

      .option {
        padding: 0.25em 0;
        text-align: center;
      }

      .option:hover {
        background-color: $accent-color;
        color: $background;
      }
    }
  }
</style>
