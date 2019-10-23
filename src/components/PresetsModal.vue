<template>
  <transition name="modal" appear>
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container col" @click.stop>
          <h2>Presets</h2>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PresetsModal'
};
</script>

<style lang="scss" scoped>
</style>
