<template>
  <div v-if="visible" :class="styles.control.root" :id="id" :data-id="computedLabel.replaceAll(` `, ``)">
    <!-- <label :for="id + '-input'" :class="styles.control.label">
      {{ computedLabel }}
    </label> -->
    <div :class="styles.control.wrapper">
      <slot></slot>
    </div>
    <!-- <div :class="errors ? styles.control.error : styles.control.description">
      {{ errors ? errors : showDescription ? description : null }}
    </div> -->
  </div>
</template>

<script lang="ts">
declare type CompType<_S, V> = V
import { isDescriptionHidden, computeLabel } from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api';
import { Styles } from "@jsonforms/vue2-vanilla"
import { Options } from "@jsonforms/vue2-vanilla";

export default defineComponent({
  name: 'control-wrapper',
  props: {
    id: {
      required: true as true,
      type: String
    },
    description: {
      required: false as false,
      type: String,
      default: undefined
    },
    errors: {
      required: false as false,
      type: String,
      default: undefined
    },
    label: {
      required: false as false,
      type: String,
      default: undefined
    },
    appliedOptions: {
      required: false as false,
      type: Object as CompType<Options, ObjectConstructor>,
      default: undefined
    },
    visible: {
      required: false as false,
      type: Boolean,
      default: true
    },
    required: {
      required: false as false,
      type: Boolean,
      default: false
    },
    isFocused: {
      required: false as false,
      type: Boolean,
      default: false
    },
    styles: {
      required: true,
      type: Object as CompType<Styles, ObjectConstructor>
    }
  },
  computed: {
    showDescription(): boolean {
      return !isDescriptionHidden(
        this.visible,
        this.description,
        this.isFocused,
        !!this.appliedOptions?.showUnfocusedDescription
      );
    },
    computedLabel(): string {
      return computeLabel(
        this.label,
        this.required,
        !!this.appliedOptions?.hideRequiredAsterisk
      );
    }
  }
});
</script>
