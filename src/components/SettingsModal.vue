<template>
  <transition name="modal">
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>
          <h2>Settings</h2>
          <Slider :min="0" :max="9" :step="1" v-model="sensitivity" orient="vertical"/>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Slider from './Slider';

export default {
  name: 'SettingsModal',
  data () {
    return {
      sensitivity: 0
    };
  },
  components: {
    Slider
  },
  watch: {
    sensitivity (nv) {
      console.log(nv);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
