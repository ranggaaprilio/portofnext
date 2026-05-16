<script setup lang="ts">
import { type RemovableRef, useStorage } from '@vueuse/core';
import { formatJson } from './json.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const inputElement = ref<HTMLElement>();

const rawParams = useStorage('search-params:raw-params', 'id=1&name=John&age=30&city=New+York&desc=lorem+ipsum');
const indentSize = useStorage('search-params:indent-size', 3);
const sortKeys = useStorage('search-params:sort-keys', true);
const cleanJson = computed(() => withDefaultOnError(() => formatToJson(rawParams, indentSize, sortKeys), ''));

const rawJsonValidation = useValidation({
  source: rawParams,
  rules: [
    {
      validator: v => v === '' || new URLSearchParams(v),
      message: 'Provided search param is not valid.',
    },
  ],
});

function formatToJson(rawParams: RemovableRef<string>, indentSize: RemovableRef<number>, sortKeys: RemovableRef<boolean>) {
  const url = new URLSearchParams(rawParams.value);

  interface IObject {
    [key: string]: any
  }
  const obj: IObject = {};

  for (const [key, value] of url) {
    obj[key] = value;
  }

  return formatJson({ rawJson: JSON.stringify(obj), indentSize, sortKeys });
}
</script>

<template>
  <div style="flex: 0 0 100%">
    <div style="margin: 0 auto; max-width: 600px" flex justify-center gap-3>
      <n-form-item label="Sort keys :" label-placement="left" label-width="100">
        <n-switch v-model:value="sortKeys" />
      </n-form-item>
      <n-form-item label="Indent size :" label-placement="left" label-width="100" :show-feedback="false">
        <n-input-number v-model:value="indentSize" min="0" max="10" style="width: 100px" />
      </n-form-item>
    </div>
  </div>

  <n-form-item
    label="Your raw search param"
    :feedback="rawJsonValidation.message"
    :validation-status="rawJsonValidation.status"
  >
    <c-input-text
      ref="inputElement"
      v-model:value="rawParams"
      placeholder="Paste your raw search Param..."
      rows="20"
      multiline
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
    />
  </n-form-item>
  <n-form-item label="Prettified version of your JSON">
    <TextareaCopyable :value="cleanJson" language="json" :follow-height-of="inputElement" />
  </n-form-item>
</template>

<style lang="less" scoped>
.result-card {
  position: relative;
  .copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
