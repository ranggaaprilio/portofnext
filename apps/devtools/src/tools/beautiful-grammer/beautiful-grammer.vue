<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  ArrowRight as ArrowRightIcon,
  X as ClearIcon,
  Copy as CopyIcon,
  InfoCircle as InfoIcon,
  Wand as WandIcon,
} from '@vicons/tabler';
import {
  type GrammarCorrectionOptions,
  correctGrammarWithOpenAI,
  getTextStatistics,
  validateApiKey,
} from './beautiful-grammer.service';

// Reactive state
const apiKey = ref('');
const inputText = ref('');
const outputText = ref('');
const isProcessing = ref(false);
const error = ref('');
const successMessage = ref('');
const enhancementOptions = ref(['grammar', 'professional', 'formal']);
const tokensUsed = ref<number | undefined>();
const textStats = ref<ReturnType<typeof getTextStatistics> | null>(null);
const outputStats = ref<ReturnType<typeof getTextStatistics> | null>(null);

// Clipboard functionality
const { copy } = useClipboard();

// Computed properties
const canProcess = computed(() => {
  return apiKey.value.trim() && inputText.value.trim() && !isProcessing.value;
});

// Local storage key
const API_KEY_STORAGE_KEY = 'beautiful-grammar-openai-key';

// Load API key from localStorage on mount
onMounted(() => {
  const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (savedApiKey) {
    apiKey.value = savedApiKey;
  }
});

// Save API key to localStorage
function saveApiKey() {
  if (apiKey.value.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.value);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

// Build options object from selected enhancements
function buildOptions(): GrammarCorrectionOptions {
  return {
    grammar: enhancementOptions.value.includes('grammar'),
    professional: enhancementOptions.value.includes('professional'),
    formal: enhancementOptions.value.includes('formal'),
    clarity: enhancementOptions.value.includes('clarity'),
    concise: enhancementOptions.value.includes('concise'),
    casual: enhancementOptions.value.includes('casual'),
  };
}

// Main grammar correction function
async function correctGrammar() {
  if (!canProcess.value) {
    return;
  }
  // Validate API key format
  if (!validateApiKey(apiKey.value)) {
    console.error('Invalid API key format. OpenAI API keys should start with "sk-"');
    error.value = 'Invalid API key format. OpenAI API keys should start with "sk-"';
    return;
  }

  isProcessing.value = true;
  error.value = '';
  outputText.value = '';
  tokensUsed.value = undefined;

  try {
    const options = buildOptions();
    const result = await correctGrammarWithOpenAI(inputText.value, apiKey.value, options);

    outputText.value = result.correctedText;
    tokensUsed.value = result.tokensUsed;

    // Calculate statistics for both texts
    textStats.value = getTextStatistics(inputText.value);
    outputStats.value = getTextStatistics(result.correctedText);

    successMessage.value = `Text enhanced successfully! ${result.changes} change(s) detected.`;

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err: any) {
    console.error('Grammar correction error:', err);
    error.value = err.message || 'Failed to enhance text. Please try again.';
  } finally {
    isProcessing.value = false;
  }
}

// Copy output to clipboard
async function copyOutput() {
  if (outputText.value) {
    try {
      await copy(outputText.value);
      successMessage.value = 'Enhanced text copied to clipboard!';
      setTimeout(() => {
        successMessage.value = '';
      }, 2000);
    } catch (err) {
      error.value = 'Failed to copy text to clipboard';
    }
  }
}

// Use output as new input
function useAsInput() {
  if (outputText.value) {
    inputText.value = outputText.value;
    outputText.value = '';
    textStats.value = null;
    outputStats.value = null;
    tokensUsed.value = undefined;
    successMessage.value = 'Text moved to input for further enhancement!';
    setTimeout(() => {
      successMessage.value = '';
    }, 2000);
  }
}

// Clear all text
function clearText() {
  inputText.value = '';
  outputText.value = '';
  error.value = '';
  successMessage.value = '';
  textStats.value = null;
  outputStats.value = null;
  tokensUsed.value = undefined;
}

// Calculate change percentage
function getChangePercentage(): number {
  if (!textStats.value || !outputStats.value) {
    return 0;
  }
  const diff = Math.abs(outputStats.value.characters - textStats.value.characters);
  return (diff / textStats.value.characters) * 100;
}

// Get readability improvement
function getReadabilityImprovement(): number {
  if (!textStats.value || !outputStats.value) {
    return 0;
  }
  return outputStats.value.readabilityScore - textStats.value.readabilityScore;
}
</script>

<template>
  <div class="beautiful-grammar-container">
    <!-- API Key Configuration -->
    <c-card title="OpenAI Configuration" class="config-card" mb-6>
      <div class="api-key-section">
        <c-input-text
          v-model:value="apiKey"
          label="OpenAI API Key"
          placeholder="Enter your OpenAI API key (sk-...)"
          type="password"
          clearable
          @input="saveApiKey"
        >
          <template #suffix>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-icon :component="InfoIcon" />
              </template>
              Your API key is stored locally and never shared
            </n-tooltip>
          </template>
        </c-input-text>
        <div class="api-key-info">
          <n-text depth="3" size="small">
            Get your API key from
            <c-link href="https://platform.openai.com/api-keys" target="_blank"> OpenAI Platform </c-link>
          </n-text>
        </div>
      </div>
    </c-card>

    <!-- Grammar Correction Tool -->
    <div class="grammar-tool">
      <div class="input-section">
        <c-card title="Input Text" class="input-card">
          <c-input-text
            v-model:value="inputText"
            placeholder="Enter the text you want to improve..."
            :rows="8"
            :maxlength="2000"
            multiline
            clearable
            show-count
          />
          <div class="action-buttons" mt-4>
            <c-button type="primary" :loading="isProcessing" :disabled="!canProcess" @click="correctGrammar">
              <template #icon>
                <n-icon :component="WandIcon" />
              </template>
              Enhance Text
            </c-button>
            <c-button v-if="inputText" secondary @click="clearText">
              <template #icon>
                <n-icon :component="ClearIcon" />
              </template>
              Clear
            </c-button>
          </div>
        </c-card>
      </div>

      <div class="output-section">
        <c-card title="Enhanced Text" class="output-card">
          <div v-if="!outputText && !isProcessing" class="empty-state">
            <n-icon :component="WandIcon" size="48" class="empty-icon" />
            <n-text depth="3"> Enhanced text will appear here </n-text>
          </div>

          <div v-else-if="isProcessing" class="loading-state">
            <n-spin size="large">
              <template #description>
                <n-text>Enhancing your text with AI...</n-text>
              </template>
            </n-spin>
          </div>

          <div v-else class="output-content">
            <c-input-text
              :value="outputText"
              multiline
              readonly
              :rows="8"
              placeholder="Enhanced text will appear here..."
            />
            <div class="output-actions" mt-4>
              <c-button type="primary" @click="copyOutput">
                <template #icon>
                  <n-icon :component="CopyIcon" />
                </template>
                Copy Enhanced Text
              </c-button>
              <c-button secondary @click="useAsInput">
                <template #icon>
                  <n-icon :component="ArrowRightIcon" />
                </template>
                Use as Input
              </c-button>
            </div>

            <!-- Statistics -->
            <div class="text-stats" mt-4>
              <n-statistic label="Original Words" :value="textStats?.words || 0" />
              <n-statistic label="Enhanced Words" :value="outputStats?.words || 0" />
              <n-statistic label="Change" :value="getChangePercentage().toFixed(1)" suffix="%" />
              <n-statistic
                v-if="textStats && outputStats"
                label="Readability"
                :value="outputStats.readabilityScore.toFixed(1)"
                suffix="/100"
              >
                <template #prefix>
                  <span :style="{ color: getReadabilityImprovement() >= 0 ? 'green' : 'red' }">
                    {{ getReadabilityImprovement() >= 0 ? '↑' : '↓' }}
                  </span>
                </template>
              </n-statistic>
              <n-statistic v-if="tokensUsed" label="Tokens Used" :value="tokensUsed" />
            </div>
          </div>
        </c-card>
      </div>
    </div>

    <!-- Enhancement Options -->
    <c-card title="Enhancement Options" class="options-card" mt-6>
      <div class="enhancement-options">
        <n-checkbox-group v-model:value="enhancementOptions">
          <n-space>
            <n-checkbox value="grammar" label="Fix Grammar" />
            <n-checkbox value="professional" label="Make Professional" />
            <n-checkbox value="formal" label="Make Formal" />
            <n-checkbox value="casual" label="Make Casual" />
            <n-checkbox value="clarity" label="Improve Clarity" />
            <n-checkbox value="concise" label="Make Concise" />
          </n-space>
        </n-checkbox-group>
      </div>
    </c-card>

    <!-- Error Display -->
    <c-alert v-if="error" type="warning" mt-4>
      <div flex items-center justify-between>
        <span>{{ error }}</span>
        <c-button size="small" variant="text" @click="error = ''">
          <n-icon :component="ClearIcon" />
        </c-button>
      </div>
    </c-alert>

    <!-- Success Message -->
    <c-alert v-if="successMessage" mt-4>
      <div flex items-center justify-between>
        <span>{{ successMessage }}</span>
        <c-button size="small" variant="text" @click="successMessage = ''">
          <n-icon :component="ClearIcon" />
        </c-button>
      </div>
    </c-alert>
  </div>
</template>

<style lang="less" scoped>
.beautiful-grammar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.config-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  :deep(.c-card__header) {
    color: white;
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

.api-key-section {
  .api-key-info {
    margin-top: 8px;
    opacity: 0.8;
  }
}

.grammar-tool {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.input-card,
.output-card {
  height: fit-content;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  .empty-icon {
    margin-bottom: 12px;
    opacity: 0.3;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.output-content {
  .output-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .text-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }
}

.options-card {
  .enhancement-options {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
}

// Dark mode adjustments
@media (prefers-color-scheme: dark) {
  .config-card {
    background: linear-gradient(135deg, #4c63d2 0%, #5a4fcf 100%);
  }
}

// Responsive design
@media (max-width: 768px) {
  .beautiful-grammar-container {
    padding: 16px;
  }

  .action-buttons,
  .output-actions {
    flex-direction: column;

    > * {
      width: 100%;
    }
  }
}

// Animation for state changes
.output-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Enhanced button hover effects
:deep(.c-button) {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

// Card hover effects
.input-card,
.output-card,
.options-card {
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
