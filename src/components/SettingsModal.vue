<template>
  <transition name="modal" appear>
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container col" @click.stop>
          <h2>Settings</h2>
          <div class="row align-center settings-section">
            <span class="mr3">Mousewheel Sensitivity:</span>
            <div class="col">
              <Slider :min="0" :max="9" :step="1" v-model="sensitivity" orient="horizontal" />
              <div class="row grow justify-space-between mt1">
                <small>Less</small>
                <small>More</small>
              </div>
            </div>
          </div>
          <div class="col grow justify-flex-end align-center">
            <button @click="$emit('close')">Close</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Slider from './Slider';

export default {
  name: 'SettingsModal',
  props: ['settings'],
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
    },
    settings (nv) {
      this.sensitivity = nv.sensitivity;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/base';

.settings-section {
  padding: 12px 24px;
  &:not(:last-child) {
    border-bottom: $light-border;
  }
}
</style>
