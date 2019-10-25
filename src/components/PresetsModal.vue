<template>
  <transition name="modal" appear>
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container col" @click.stop>
          <h2>Presets</h2>
          <div class="presets-wrapper">
            <div class="preset-entry py2" v-for="p in presets" :key="p.id">
              <div class="row align-center">
                <div class="preset-img-wrap">
                  <img v-if="p.preset.image" :src="p.preset.image" :alt="p.preset.name">
                  <img v-else src="../styles/default-preset.png" :alt="p.preset.name">
                </div>
                <i class="eq8 mx3" :class="p.preset.icon"></i>
                <div class="grow">{{ p.preset.name }}</div>
                <div class="controls align-center">
                  <i class="eq8 launchopen_in_new mx2" title="Load Preset"></i>
                  <i class="eq8 clearclose mx2" title="Delete Preset" @click="confirm(p.id, true)"></i>
                </div>
              </div>
              <transition name="grow" appear v-if="confirms[p.id]">
                <div class="confirm-container">
                  <div class="confirmation row align-center">
                    <span class="mx3">Are you sure you want to delete this preset?</span>
                    <div class="confirm-controls align-center">
                      <button class="small mx1">Yes</button>
                      <button class="small mx1" @click="confirm(p.id, false)">No</button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'PresetsModal',
  props: ['value'],
  data () {
    return {
      confirms: {}
    };
  },
  methods: {
    loadPreset (presetId) {
      this.$emit('load', presetId);
    },
    confirm (id, bool) {
      Vue.set(this.confirms, id, bool);
    }
  },
  computed: {
    presets () {
      const presets = Object.entries(this.value).reduce((acc, curr) => {
        acc.push({ id: curr[0], preset: curr[1] });
        return acc;
      }, []);
      presets.sort((a, b) => b.preset.name - a.preset.name);
      return presets;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/base';

.presets-wrapper {
  overflow-x: hidden;
  overflow-y: auto;
}

.preset-entry {
  &:not(:last-child) {
    border-bottom: $light-border;
  }
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.preset-img-wrap img {
  border: $border;
  border-radius: $standard-border-radius;
  height: 32px;
  background: $fr-background;
}

.controls {
  .eq8 {
    font-size: 1.75em;
    cursor: pointer;
  }

  .launchopen_in_new:hover {
    color: $accent-color;
  }

  .clearclose:hover {
    color: rgb(252, 54, 52);
  }
}

.confirmation {
  height: 2.25em;
}
.grow-enter {
  height: 0;
}
.grow-enter-active {
  transition: all 0.5s ease;
}
.grow-enter-to {
  height: 2.25em;
}
.grow-enter .confirmation {
  opacity: 0;
}
.grow-enter-active .confirmation {
  transition: all 0.25s ease;
  transition-delay: 0.25s;
}
.grow-enter-to .confirmation {
  opacity: 1;
}
/* todo: leave transition */
</style>
