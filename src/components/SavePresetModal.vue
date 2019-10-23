<template>
    <transition name="modal" appear>
      <div class="modal-mask" @click="$emit('close')">
        <div class="modal-wrapper">
          <div class="modal-container col" @click.stop>
            <h2>Save Preset</h2>
            <div class="mx4 my2 row align-center justify-space-evenly">
              <div>
                <img :src="img" alt="Preset Screenshot" v-if="img">
              </div>
              <div class="grow px2">
                <input v-model="name" placeholder="Preset name">
              </div>
              <div>
                <Choose :options="iconOpts" :selected="selectedIcon" direction="up" @change="handleIcon" />
              </div>
            </div>
            <div class="row justify-center align-center">
              <button class="mx2" @click="$emit('save', { name, icon: selectedIcon.value, image: img })" :disabled="!name">Save</button>
              <button class="mx2" @click="$emit('close')">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
</template>

<script>
import Choose from './Choose';

const opts = [
  { iconClass: ['eq8', 'audiotrack'], value: 'audiotrack', title: '' },
  { iconClass: ['eq8', 'favorite'], value: 'favorite', title: '' },
  { iconClass: ['eq8', 'headset'], value: 'headset', title: '' },
  { iconClass: ['eq8', 'speaker'], value: 'speaker', title: '' },
  { iconClass: ['eq8', 'mic'], value: 'mic', title: '' },
  { iconClass: ['eq8', 'volume_up'], value: 'volume_up', title: '' }
];

export default {
  name: 'SavePresetModal',
  props: ['value', 'img'],
  components: {
    Choose
  },
  data () {
    return {
      name: '',
      iconOpts: opts,
      selectedIcon: opts[0]
    };
  },
  methods: {
    handleIcon (selected) {
      this.selectedIcon = selected;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/base';

.modal-container h2 {
  text-align: center;
}

.modal-container {
  width: unset;
  height: unset;
  max-width: 80%;
  max-height: 80%;
}

img {
  border: $border;
  border-radius: $standard-border-radius;
  height: 32px;
  background: $fr-background;
}

input {
  width: 100%;
  border: $border;
  padding: 0.3em 0 0.3em 0.75em;
  border-radius: $standard-border-radius;
  background-color: $background;
  color: white;

  &:not(:disabled):focus,
  &:not(:disabled):active {
    border-color: $line-color;
    outline: none;
  }
}
</style>
