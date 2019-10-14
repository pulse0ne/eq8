<template>
  <div class="choose" :class="{'open': show }">
    <div @click="openOptions">
      <i v-if="selected.icon" :class="selected.icon"></i>
      <span v-if="selected.text">{{ selected.text }}</span>
      <i class="eq8-arrow_drop_down bigger-icon"></i>
    </div>
    <div class="choose-popup" :style="popupStyle" ref="popup" v-if="show">
      <div v-for="opt in options" :key="opt.value" class="option" @click="optionSelected(opt)" :title="opt.title">
        <i v-if="opt.icon" :class="opt.icon"></i>
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
    direction: { type: String, default: 'down' }
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

    &.open {
      border-color: transparent;
    }

    .choose-popup {
      position: absolute;
      padding: 2px;
      background: $background;
      z-index: 999;
      @include standard-shadow;

      .option {
        padding: 0.25em 0;
      }

      .option:hover {
        background-color: $accent-color;
        color: white;
      }
    }
  }
</style>
