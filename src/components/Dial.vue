<template>
  <div class="dial" :style="dialStyle" :class="dialClass">
    <div class="dial-grip" :style="gripStyle" @mousedown="mousedown">
      <div class="dial-grip-tick" :style="tickStyle"></div>
    </div>
    <svg class="dial-svg" :viewBox="viewbox" :style="svgStyle">
      <circle :cx="dialCircleAdjustment" :cy="dialCircleAdjustment" :r="dialCircleSize"></circle>
      <path :d="trackPath" fill="none"/>
      <path :d="trackPath" fill="none" class="fill" :style="fillStyle"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Dial',
  props: {
    value: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    size: { type: Number, default: 100 },
    disabled: { type: Boolean, default: false }
  },
  data () {
    return {
      posX: 0,
      posY: 0
    };
  },
  computed: {
    dialClass () {
      return this.disabled ? 'disabled' : null;
    },
    dialCircleSize () {
      return this.size * 0.38;
    },
    dialCircleAdjustment () {
      return this.size * 0.5;
    },
    svgStyle () {
      return {
        strokeDasharray: this.size * 1.84,
        strokeWidth: `${this.size * 0.05}px`
      };
    },
    dialStyle () {
      return { width: `${this.size}px`, height: `${this.size}px` };
    },
    tickStyle () {
      const s = this.size;
      return {
        width: `${s * 0.08}px`,
        height: `${s * 0.08}px`,
        borderRadius: '50%'
      };
    },
    gripStyle () {
      const s = `${this.size * 0.82}px`;
      return {
        width: s,
        height: s,
        transform: `translate(-50%, -50%) rotate(${this.rotation}deg)`
      };
    },
    viewbox () {
      return `0 0 ${this.size} ${this.size}`;
    },
    trackPath () {
      const startx = this.size / 5;
      const starty = this.size - (this.size / 4);
      const rxy = this.size * 0.4;
      return `M${startx},${starty} A ${rxy} ${rxy} 0 1 1 ${this.size - startx} ${starty}`;
    },
    fillStyle () {
      const s = this.size;
      const r = this.rotation;
      const o = s * 1.84;
      const d = o - o * ((r + 132) / 264);
      return {
        strokeDashoffset: d,
        strokeWidth: `${s * 0.06}px`
      };
    },
    rotation () {
      const { min, max } = this;
      const v = this.value;
      const p = 264 * ((v + Math.abs(min)) / (max - min));
      return p - 132;
    }
  },
  methods: {
    mousedown ($event) {
      if (this.disabled) return;
      const { pageX, pageY } = $event;
      [this.posX, this.posY] = [pageX, pageY];
      document.addEventListener('mousemove', this.mousemove);
      document.addEventListener('mouseup', this.mouseup);
    },
    mousemove ($event) {
      const { pageX, pageY } = $event;
      const { min, max } = this;
      const scaleY = (max - min) / 256;
      const scaleX = (max - min) / 256;
      const deltaY = (pageY - this.posY) * scaleY;
      const deltaX = (pageX - this.posX) * scaleX;
      this.posY = pageY;
      this.posX = pageX;
      const d = deltaY - deltaX;
      let nv = this.value - d;
      if (nv < min) {
        nv = min;
      }
      if (nv > max) {
        nv = max;
      }
      if (d !== 0) {
        this.$emit('change', nv);
      }
    },
    mouseup () {
      document.removeEventListener('mousemove', this.mousemove);
      document.removeEventListener('mouseup', this.mouseup);
    }
  }
};
</script>

<style lang="scss" scoped>
  @import '../styles/base';

  .dial {
    position: relative;
    display: block;

    &.disabled {
      .dial-grip {
        .dial-grip-tick {
          background-color: $disabled-color;
        }
      }

      .dial-svg {
        path.fill {
          stroke: $disabled-color;
        }
      }
    }
  }

  .dial-grip {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    z-index: 5;
    transition: 0.3s cubic-bezier(0, 0, 0.24, 1);

    .dial-grip-tick {
      @include no-select;
      pointer-events: none;
      position: absolute;
      top: 15%;
      left: 50%;
      background-color: $accent-color;
    }
  }

  .dial-svg {
    pointer-events: none;
    position: absolute;
    stroke-linecap: round !important;
    transition: 0.3s cubic-bezier(0, 0, 0.24, 1);

    path {
      transition: 0.3s cubic-bezier(0, 0, 0.24, 1);
      stroke: $track-color;

      &.fill {
        stroke: $accent-color;
      }
    }

    circle {
      fill: $background;
    }
  }

</style>
