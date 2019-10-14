<template>
    <div class="checkbox-wrapper">
      <div class="checkbox" @click="handler" :class="klass"></div>
    </div>
</template>

<script>
export default {
  name: 'Checkbox',
  props: { value: Boolean },
  data () {
    return {
      internalVal: this.value
    };
  },
  methods: {
    handler () {
      this.internalVal = !this.internalVal;
      this.$emit('input', this.internalVal);
    }
  },
  computed: {
    klass () {
      return this.internalVal ? 'checked' : null;
    }
  },
  watch: {
    value (nv) {
      this.internalVal = nv;
    }
  }
};
</script>

<style lang="scss" scoped>
  @import '../styles/base';

  .checkbox-wrapper {
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
    display: inline-flex;
    justify-content: center;
    align-items: center;

    .checkbox {
      border: $border;
      background: transparent;
      min-width: 0.9em;
      max-width: 0.9em;
      min-height: 0.9em;
      max-height: 0.9em;

      &.checked {
        background: $accent-color;
      }
    }
  }
</style>
