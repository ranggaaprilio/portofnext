<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import {
  containsHexEscape,
  convertHexEscapeToJson,
  convertHexEscapeToPrettyJson,
  isValidHexEscapedJson,
} from './hexadecimal-esacape-character.service';

const hexInput = ref('{"name": "John\\x27s \\"Test\\"", "value": "Hello\\x20World"}');
const prettyFormat = ref(true);

const jsonOutput = computed(() => {
  if (!hexInput.value.trim()) {
    return '';
  }

  return withDefaultOnError(
    () => (prettyFormat.value ? convertHexEscapeToPrettyJson(hexInput.value) : convertHexEscapeToJson(hexInput.value)),
    '',
  );
});

const hasHexEscapes = computed(() => containsHexEscape(hexInput.value));

const validation = useValidation({
  source: hexInput,
  rules: [
    {
      validator: value => isValidHexEscapedJson(value),
      message: 'Invalid input: cannot be converted to valid JSON',
    },
  ],
});

const { copy: copyOutput } = useCopy({ source: jsonOutput, text: 'JSON copied to the clipboard' });
</script>

<template>
  <c-card title="Hexadecimal Escape to JSON">
    <n-form-item label="Input with hexadecimal escape characters:">
      <c-input-text
        v-model:value="hexInput"
        :validation="validation"
        multiline
        placeholder="Enter string with hex escapes"
        rows="5"
        autosize
        raw-text
        monospace
      />
    </n-form-item>

    <n-space mb-3>
      <n-checkbox v-model:checked="prettyFormat">
        Pretty format output
      </n-checkbox>
      <n-tag v-if="hasHexEscapes" type="info" size="small">
        Contains hex escapes
      </n-tag>
      <n-tag v-else type="warning" size="small">
        No hex escapes found
      </n-tag>
    </n-space>

    <n-form-item label="Converted JSON output:">
      <c-input-text
        :value="jsonOutput"
        multiline
        readonly
        placeholder="Converted JSON will appear here"
        rows="5"
        autosize
        monospace
      />
    </n-form-item>

    <div flex justify-center>
      <c-button :disabled="!jsonOutput" @click="copyOutput()">
        Copy
      </c-button>
    </div>
  </c-card>
</template>
