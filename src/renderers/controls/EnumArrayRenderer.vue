<template>
  <v-hover v-slot="{ hover }">
    <v-select
      @change="beforeChange"
      :id="control.id + '-input'"
      :data-id="computedLabel.replaceAll(` `, ``)"
      :class="styles.control.input"
      :disabled="!control.enabled || control.schema.readOnly"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :hint="control.description"
      :required="control.required"
      :error-messages="control.errors"
      :clearable="hover && !control.schema.readOnly"
      :value="control.data"
      :items="control.options"
      :readonly="control.schema.readOnly"
      hide-details="auto"
      dense
      chips
      small-chips
      deletable-chips
      persistent-hint
      class="py-3"
      item-text="label"
      item-value="value"
      outlined
      multiple
    >
      <template v-slot:message>
        <div v-if="control.schema.description" class="text-subtitle-1 text--secondary">
          {{ control.schema.description }}
        </div>
        <div v-if="cleanedErrors" class="ml-2 v-messages error--text">
          {{ cleanedErrors }}
        </div>
      </template>
    </v-select>
  </v-hover>
</template>

<script lang="ts">
import {
  and,
  ControlElement,
  hasType,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  mapDispatchToMultiEnumProps,
  mapStateToMultiEnumControlProps,
  rankWith,
  schemaMatches,
  schemaSubPathMatches,
  uiTypeIs,
  composePaths,
} from '@jsonforms/core';
import { VCheckbox, VContainer, VRow, VCol } from 'vuetify/lib';
import {
  DispatchRenderer,
  rendererProps,
  RendererProps,
  useControl,
  ControlProps,
  useJsonFormsControl,
} from '@jsonforms/vue2';
import { defineComponent } from "@vue/composition-api"
import { useVuetifyBasicControl } from '@jsonforms/vue2-vuetify'
import { computeLabel } from '@jsonforms/core'

//TODO: move into JsonForm Vue project under src/components/jsonFormsCompositions.ts
const useJsonFormsMultiEnumControl = (props: ControlProps) => {
  return useControl(
    props,
    mapStateToMultiEnumControlProps,
    mapDispatchToMultiEnumProps
  );
};

import { useVuetifyControl } from '@jsonforms/vue2-vuetify'

const controlRenderer = defineComponent({
  name: 'enum-array-renderer',
  components: {
    DispatchRenderer,
    VCheckbox,
    VContainer,
    VRow,
    VCol,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return {
      ...useVuetifyControl(
        useJsonFormsControl(props),
        (value) => value || undefined
      ),  // Needed for handleChange function
      ...useVuetifyBasicControl(
        useJsonFormsMultiEnumControl(props)
      )
    }
  },
  created() {
    // console.log(this.control)
  },
  computed: {
    cleanedErrors() {
      // @ts-ignore
      return this.control.errors.replaceAll(`is a required property`, ``)
    }
  },
  methods: {
    dataHasEnum(value: any) {
      return !!this.control.data?.includes(value);
    },
    composePaths,
    // If value changed to an empty array, we need to set the data to undefined in order to trigger validation errors
    beforeChange(items) {
      if (!items.length) {
        this.handleChange(this.control.path, undefined)
      }
      else {
        this.onChange(items)
      }
    }
  },
});

export default controlRenderer;

const hasOneOfItems = (schema: JsonSchema): boolean =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema: JsonSchema): boolean =>
  schema.type === 'string' && schema.enum !== undefined;

export const enumArrayRenderer: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(
    5,
    and(
      uiTypeIs('Control'),
      and(
        schemaMatches(
          (schema) =>
            hasType(schema, 'array') &&
            !Array.isArray(schema.items) &&
            schema.uniqueItems === true
        ),
        schemaSubPathMatches('items', (schema) => {
          return hasOneOfItems(schema) || hasEnumItems(schema);
        })
      )
    )
  ),
};
</script>