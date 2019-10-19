<template>
  <div class="edit-label">
    <div class="edit-label-text" v-if="!edit" @click="labelClicked">{{ label }}</div>
    <input type="text" class="edit-label-input" v-if="edit" :value="valInternal" @blur="blur" @input="key"
           @keypress.enter="blur" ref="textinput">
  </div>
</template>

<script>
export default {
  name: 'EditLabel',
  props: ['value', 'label', 'min', 'max', 'disabled'],
  data () {
    return {
      edit: false,
      valInternal: 0
    };
  },
  mounted () {
    this.valInternal = this.value;
  },
  methods: {
    labelClicked () {
      if (this.disabled) return;
      this.valInternal = this.value;
      this.edit = true;
      this.$nextTick(() => {
        const textinput = this.$refs.textinput;
        if (textinput) {
          textinput.focus();
          textinput.select();
        }
      });
    },
    blur () {
      let f = this.valInternal;
      if (this.min !== undefined && f < this.min) {
        f = this.min;
      }
      if (this.max !== undefined && f > this.max) {
        f = this.max;
      }
      this.valInternal = f;
      this.edit = false;
      this.$emit('change', this.valInternal);
    },
    key ($event) {
      let f = parseFloat($event.target.value);
      if (!isNaN(f)) {
        this.valInternal = f;
      }
    }
  },
  watch: {
    value (nv) {
      this.valInternal = nv;
    }
  }
};
</script>

<style lang="scss" scoped>
  @import '../styles/base';

  .edit-label-text,
  .edit-label-input {
    padding: 4px 2px;
    font-size: 11px;
    font-family: inherit;
  }

  .edit-label-text {
    @include no-select;
    overflow: visible;
  }

  .edit-label-input {
    width: 4em;
    border: none;
    background: rgba(255, 255, 255, 0.8);
    @include standard-shadow;
  }
</style>
