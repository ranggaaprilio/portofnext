export interface GrammarCorrectionOptions {
  grammar: boolean;
  professional: boolean;
  formal: boolean;
  clarity: boolean;
  concise: boolean;
  casual: boolean;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GrammarCorrectionResult {
  originalText: string;
  correctedText: string;
  changes: number;
  tokensUsed?: number;
}

/**
 * Build a prompt for grammar correction based on selected options
 */
export function buildEnhancementPrompt(text: string, options: GrammarCorrectionOptions): string {
  const enhancements: string[] = [];

  if (options.grammar) {
    enhancements.push('correcting grammar, spelling, and punctuation errors');
  }

  if (options.professional) {
    enhancements.push('making the tone more professional and polished');
  }

  if (options.formal) {
    enhancements.push('converting to formal language and structure');
  }

  if (options.clarity) {
    enhancements.push('improving clarity, readability, and flow');
  }

  if (options.concise) {
    enhancements.push('making the text more concise while preserving meaning');
  }

  if (options.casual) {
    enhancements.push('making the tone more casual, conversational, and relaxed');
  }

  // Default to grammar correction if no options selected
  if (enhancements.length === 0) {
    enhancements.push('correcting grammar, spelling, and punctuation errors');
  }

  const prompt = `Please enhance the following text by:
${enhancements.map((enhancement) => `• ${enhancement}`).join('\n')}

Requirements:
- Maintain the original meaning and intent
- Keep the same general structure unless clarity improvements require changes
- Return only the enhanced text without explanations or comments
- If the text is already well-written, make minimal improvements

Original text:
${text}`;

  return prompt;
}

/**
 * Call OpenAI API to correct grammar and enhance text
 */
export async function correctGrammarWithOpenAI(
  text: string,
  apiKey: string,
  options: GrammarCorrectionOptions,
): Promise<GrammarCorrectionResult> {
  if (!text.trim()) {
    throw new Error('Text cannot be empty');
  }

  if (!apiKey.trim()) {
    throw new Error('OpenAI API key is required');
  }

  const prompt = buildEnhancementPrompt(text, options);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content:
              "You are a professional writing assistant and editor. Your task is to enhance text according to the user's specifications while preserving the original meaning and intent. Always respond with only the enhanced text, no explanations or additional comments.",
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: Math.min(2000, text.length * 2), // Dynamic token limit based on input length
        temperature: 0.3, // Low temperature for consistent corrections
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;

      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 402) {
        throw new Error('API quota exceeded. Please check your OpenAI account billing.');
      } else {
        throw new Error(errorMessage);
      }
    }

    const data: OpenAIResponse = await response.json();

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const correctedText = data.choices[0].message.content.trim();

    if (!correctedText) {
      throw new Error('OpenAI returned empty response');
    }

    return {
      originalText: text,
      correctedText,
      changes: calculateTextChanges(text, correctedText),
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while processing your text');
  }
}

/**
 * Calculate the number of changes between original and corrected text
 */
export function calculateTextChanges(original: string, corrected: string): number {
  const originalWords = original.toLowerCase().split(/\s+/);
  const correctedWords = corrected.toLowerCase().split(/\s+/);

  let changes = 0;
  const maxLength = Math.max(originalWords.length, correctedWords.length);

  for (let i = 0; i < maxLength; i++) {
    if (originalWords[i] !== correctedWords[i]) {
      changes++;
    }
  }

  return changes;
}

/**
 * Calculate readability score (simple version of Flesch reading ease)
 */
export function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Simplified Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  return Math.max(0, Math.min(100, score));
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) {
    return 1;
  }

  const vowels = 'aeiouy';
  let syllableCount = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    previousWasVowel = isVowel;
  }

  // Handle silent e
  if (word.endsWith('e')) {
    syllableCount--;
  }

  return Math.max(1, syllableCount);
}

/**
 * Get text statistics
 */
export function getTextStatistics(text: string) {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readabilityScore = calculateReadabilityScore(text);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readabilityScore,
    avgWordsPerSentence: sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0,
  };
}

/**
 * Validate OpenAI API key format
 */
export function validateApiKey(apiKey: string): boolean {
  // OpenAI API keys can have different formats:
  // - Legacy: sk-... (48+ characters)
  // - Project-based: sk-proj-... (longer)
  // - Other formats: sk-svcacct-..., etc.
  const trimmedKey = apiKey.trim();

  // Check if it starts with sk- and has reasonable length
  return /^sk-[a-zA-Z0-9_-]{20,}$/.test(trimmedKey);
}

/**
 * Get estimated cost for API call (approximate)
 */
export function estimateApiCost(text: string): number {
  // Rough estimation: ~4 characters per token for GPT-3.5-turbo
  const estimatedTokens = Math.ceil(text.length / 4) * 2; // Input + output estimation
  const costPer1000Tokens = 0.002; // GPT-3.5-turbo cost (as of last update)

  return (estimatedTokens / 1000) * costPer1000Tokens;
}
