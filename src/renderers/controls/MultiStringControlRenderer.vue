<template>
  <v-textarea
    :id="control.id + '-input'"
    :data-id="computedLabel.replaceAll(` `, ``)"
    @change.native="beforeChange"
    :maxlength="appliedOptions.restrict ? control.schema.maxLength : undefined"
    :counter="control.schema.maxLength !== undefined
            ? control.schema.maxLength
            : undefined
        "
    :error-messages="control.errors"
    :required="control.required"
    :class="styles.control.textarea"
    :hint="control.description"
    :value="control.data"
    :disabled="!control.enabled"
    :autofocus="appliedOptions.focus"
    :placeholder="placeholder"
    :label="computedLabel"
    persistent-hint
    outlined
    dense
    class="py-3"
  >
    <template v-slot:message>
      <div v-if="control.schema.description" class="text-subtitle-1 text--secondary">
        {{ control.schema.description }}
      </div>
      <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
        {{ cleanedErrors }}
      </div>
    </template>
  </v-textarea>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isStringControl,
  isMultiLineControl,
  and
} from '@jsonforms/core';
import { defineComponent } from '@vue/composition-api'
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue2';
import { useVanillaControl } from "@jsonforms/vue2-vanilla";
import { computeLabel } from '@jsonforms/core';

const controlRenderer = defineComponent({
  name: 'multi-string-control-renderer',
  components: {
    // ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    return useVanillaControl(useJsonFormsControl(props));
  },
  created() {
    // If the value that was loaded is null, turn it into undefined
    if (this.control.data === null) {
      this.handleChange(this.control.path, undefined)
    }

    // If no value loaded but there is a default, populate it
    if (!this.control.data && this.control.schema.default) {
      this.control.data = this.control.schema.default
      this.handleChange(this.control.path, this.control.data)
    }

    // If a value was loaded, check if HTML needs to be stripped
    if (this.control.data && this.stripHTML) {
      this.handleChange(this.control.path, this.strip(this.control.data))
    }
  },
  computed: {
    computedLabel(): string {
      return computeLabel(
        this.control.label as string,
        this.control.required,
        !!this.appliedOptions?.hideRequiredAsterisk
      );
    },
    placeholder(): string {
      // @ts-ignore
      return this.control.schema.options?.placeholder || ''
    },
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    },
    stripHTML(): string {
      // @ts-ignore
      return !!this.control.schema.options?.stripHTML
    }
  },
  methods: {
    // If value changed to an empty string, we need to set the data to undefined in order to trigger validation error
    beforeChange(event) {
      if (event.target.value.trim() === '') {
        this.handleChange(this.control.path, undefined)
      }
      else {
        this.onChange(event)
      }
    },
    strip(html: string) {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      return doc.body.textContent || ''
    }
  }
})

export default controlRenderer;

export const multiStringControlRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, and(isStringControl, isMultiLineControl))
};
</script>
