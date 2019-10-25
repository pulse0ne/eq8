<template>
  <transition name="modal" appear>
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container col" @click.stop>
          <h2>Presets</h2>
          <div class="presets-wrapper grow">
            <div class="preset-entry py2" v-for="p in presets" :key="p.id">
              <div class="row align-center" @click="loadPreset(p.id)">
                <div class="preset-img-wrap mx2">
                  <img v-if="p.preset.image" :src="p.preset.image" :alt="p.preset.name">
                  <img v-else src="../styles/default-preset.png" :alt="p.preset.name">
                </div>
                <i class="eq8 mx2" :class="p.preset.icon"></i>
                <div class="grow">{{ p.preset.name }}</div>
                <i class="eq8 clearclose mx2" title="Delete Preset" @click.stop="confirm(p.id, true)" v-if="!p.preset.locked"></i>
              </div>
              <transition name="grow" appear v-if="confirmId === p.id">
                <div class="confirm-container">
                  <div class="confirmation row align-center">
                    <span class="mx3">Are you sure you want to delete this preset?</span>
                    <div class="confirm-controls align-center">
                      <button class="small mx1" @click.stop="deletePreset(p.id)">Yes</button>
                      <button class="small mx1" @click.stop="confirm(p.id, false)">No</button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
          <div class="row justify-center">
            <button @click="$emit('close')">Close</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PresetsModal',
  props: ['value'],
  data () {
    return {
      confirmId: null,
      confirms: {}
    };
  },
  methods: {
    loadPreset (presetId) {
      this.$emit('load', presetId);
    },
    confirm (id, bool) {
      this.confirmId = bool ? id : null;
    },
    deletePreset (id) {
      this.$emit('delete', id);
      this.confirm(id, false);
    }
  },
  computed: {
    presets () {
      const presets = Object.entries(this.value).reduce((acc, curr) => {
        acc.push({ id: curr[0], preset: curr[1] });
        return acc;
      }, []);
      presets.sort((a, b) => {
        if (a.preset.name === 'Default') return -1;
        if (b.preset.name === 'Default') return 1;
        return b.preset.name - a.preset.name;
      });
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
  cursor: pointer;

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

.preset-entry {
  .eq8 {
    font-size: 1.75em;
    cursor: pointer;
  }

  .clearclose:hover {
    color: rgb(252, 54, 52);
  }
}

.confirmation {
  height: 2.25em;
}
.grow-enter,
.grow-leave-to {
  height: 0;
}
.grow-enter-active {
  transition: all 0.5s ease;
}
.grow-leave-active {
  transition: all 0.25s ease;
  transition-delay: 0.25s;
}
.grow-enter-to,
.grow-leave {
  height: 2.25em;
}
.grow-enter .confirmation,
.grow-leave-to .confirmation {
  opacity: 0;
}
.grow-enter-active .confirmation {
  transition: all 0.25s ease;
  transition-delay: 0.25s;
}
.grow-leave-active .confirmation {
  transition: all 0.25s ease;
}
.grow-enter-to .confirmation,
.grow-leave .confirmation {
  opacity: 1;
}
</style>
