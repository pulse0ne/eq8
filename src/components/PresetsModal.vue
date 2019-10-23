<template>
  <transition name="modal" appear>
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container col" @click.stop>
          <h2>Presets</h2>
          <div class="presets-wrapper">
            <div class="preset-entry" v-for="(preset, name) in value" :key="name">
              {{ name }}
              {{ preset }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PresetsModal',
  props: ['value']
};
</script>

<style lang="scss" scoped>
</style>
