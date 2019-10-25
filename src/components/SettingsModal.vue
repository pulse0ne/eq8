<template>
  <transition name="modal" appear>
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container col" @click.stop>
          <h2>Settings</h2>
          <div class="settings-wrap">
            <div class="row align-start settings-section">
              <span class="mr3">Mousewheel Sensitivity:</span>
              <div class="col">
                <Slider :min="0" :max="9" :step="1" v-model="sensitivity" orient="horizontal" />
                <div class="row grow justify-space-between mt1">
                  <small>Less</small>
                  <small>More</small>
                </div>
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
  props: ['value'],
  data () {
    const dataValues = [];
    for (let x = 0; x < 10; ++x) {
      dataValues.push(x === 0 ? 64 : dataValues[x - 1] * 2);
    }
    dataValues.reverse();
    return {
      dataValues
    };
  },
  components: {
    Slider
  },
  computed: {
    sensitivity: {
      get () { return this.dataValues.indexOf(this.value.sensitivity); },
      set (nv) { this.$emit('input', { ...this.value, sensitivity: this.dataValues[nv] }); }
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
