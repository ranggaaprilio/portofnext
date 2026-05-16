import { describe, expect, it } from 'vitest';
import {
  type GrammarCorrectionOptions,
  buildEnhancementPrompt,
  calculateReadabilityScore,
  calculateTextChanges,
  estimateApiCost,
  getTextStatistics,
  validateApiKey,
} from './beautiful-grammer.service';

describe('beautiful-grammar service', () => {
  describe('buildEnhancementPrompt', () => {
    it('should build prompt with grammar correction option', () => {
      const text = 'This are a test sentence.';
      const options: GrammarCorrectionOptions = {
        grammar: true,
        professional: false,
        formal: false,
        clarity: false,
        concise: false,
        casual: false,
      };

      const prompt = buildEnhancementPrompt(text, options);

      expect(prompt).toContain('correcting grammar, spelling, and punctuation errors');
      expect(prompt).toContain(text);
      expect(prompt).toContain('Return only the enhanced text');
    });

    it('should build prompt with all enhancement options', () => {
      const text = 'This is a test.';
      const options: GrammarCorrectionOptions = {
        grammar: true,
        professional: true,
        formal: true,
        clarity: true,
        concise: true,
        casual: false,
      };

      const prompt = buildEnhancementPrompt(text, options);

      expect(prompt).toContain('correcting grammar');
      expect(prompt).toContain('more professional');
      expect(prompt).toContain('formal language');
      expect(prompt).toContain('improving clarity');
      expect(prompt).toContain('more concise');
    });

    it('should default to grammar correction when no options selected', () => {
      const text = 'This is a test.';
      const options: GrammarCorrectionOptions = {
        grammar: false,
        professional: false,
        formal: false,
        clarity: false,
        concise: false,
        casual: false,
      };

      const prompt = buildEnhancementPrompt(text, options);

      expect(prompt).toContain('correcting grammar, spelling, and punctuation errors');
    });

    it('should include requirements and formatting instructions', () => {
      const text = 'Test text.';
      const options: GrammarCorrectionOptions = {
        grammar: true,
        professional: false,
        formal: false,
        clarity: false,
        concise: false,
        casual: false,
      };

      const prompt = buildEnhancementPrompt(text, options);

      expect(prompt).toContain('Maintain the original meaning');
      expect(prompt).toContain('Return only the enhanced text');
      expect(prompt).toContain('Original text:');
    });
  });

  describe('calculateTextChanges', () => {
    it('should return 0 for identical texts', () => {
      const original = 'This is a test sentence.';
      const corrected = 'This is a test sentence.';

      const changes = calculateTextChanges(original, corrected);

      expect(changes).toBe(0);
    });

    it('should count word-level changes', () => {
      const original = 'This are a test sentence.';
      const corrected = 'This is a test sentence.';

      const changes = calculateTextChanges(original, corrected);

      expect(changes).toBe(1); // "are" -> "is"
    });

    it('should count multiple changes', () => {
      const original = 'This are bad grammer.';
      const corrected = 'This is proper grammar.';

      const changes = calculateTextChanges(original, corrected);

      expect(changes).toBe(3); // "are" -> "is", "bad" -> "proper", "grammer" -> "grammar"
    });

    it('should handle case differences', () => {
      const original = 'Hello World';
      const corrected = 'hello world';

      const changes = calculateTextChanges(original, corrected);

      expect(changes).toBe(0); // Case differences shouldn't count
    });

    it('should handle different text lengths', () => {
      const original = 'Short text.';
      const corrected = 'This is a much longer and more detailed text.';

      const changes = calculateTextChanges(original, corrected);

      expect(changes).toBeGreaterThan(0);
    });

    it('should handle empty strings', () => {
      const original = '';
      const corrected = 'Some text';

      const changes = calculateTextChanges(original, corrected);

      expect(changes).toBe(2); // Two words added
    });
  });

  describe('calculateReadabilityScore', () => {
    it('should return a score between 0 and 100', () => {
      const text = 'This is a simple sentence. It is easy to read.';

      const score = calculateReadabilityScore(text);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return higher score for simpler text', () => {
      const simpleText = 'The cat sat on the mat. It was warm.';
      const complexText =
        'The feline positioned itself upon the textile floor covering in a manner that suggested comfort and relaxation.';

      const simpleScore = calculateReadabilityScore(simpleText);
      const complexScore = calculateReadabilityScore(complexText);

      expect(simpleScore).toBeGreaterThan(complexScore);
    });

    it('should handle empty text', () => {
      const score = calculateReadabilityScore('');

      expect(score).toBe(0);
    });

    it('should handle single word', () => {
      const score = calculateReadabilityScore('Hello');

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('getTextStatistics', () => {
    it('should calculate basic text statistics', () => {
      const text = 'Hello world! This is a test.\n\nNew paragraph here.';

      const stats = getTextStatistics(text);

      expect(stats.characters).toBe(text.length);
      expect(stats.charactersNoSpaces).toBe(text.replace(/\s/g, '').length);
      expect(stats.words).toBe(9);
      expect(stats.sentences).toBe(3);
      expect(stats.paragraphs).toBe(2);
      expect(stats.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(stats.avgWordsPerSentence).toBe(3);
    });

    it('should handle empty text', () => {
      const stats = getTextStatistics('');

      expect(stats.characters).toBe(0);
      expect(stats.charactersNoSpaces).toBe(0);
      expect(stats.words).toBe(0);
      expect(stats.sentences).toBe(0);
      expect(stats.paragraphs).toBe(0);
      expect(stats.avgWordsPerSentence).toBe(0);
    });

    it('should handle text with only spaces', () => {
      const stats = getTextStatistics('   \n\n   ');

      expect(stats.words).toBe(0);
      expect(stats.sentences).toBe(0);
      expect(stats.paragraphs).toBe(0);
    });

    it('should count sentences correctly', () => {
      const text = 'First sentence. Second sentence! Third sentence? Not a sentence';

      const stats = getTextStatistics(text);

      expect(stats.sentences).toBe(4);
    });

    it('should count paragraphs correctly', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\n\nThird paragraph.';

      const stats = getTextStatistics(text);

      expect(stats.paragraphs).toBe(3);
    });
  });

  describe('validateApiKey', () => {
    it('should validate correct OpenAI API key format', () => {
      const validKey = 'sk-1234567890abcdef1234567890abcdef1234567890abcdef12';

      const isValid = validateApiKey(validKey);

      expect(isValid).toBe(true);
    });

    it('should reject keys without sk- prefix', () => {
      const invalidKey = '1234567890abcdef1234567890abcdef1234567890abcdef12';

      const isValid = validateApiKey(invalidKey);

      expect(isValid).toBe(false);
    });

    it('should reject keys that are too short', () => {
      const shortKey = 'sk-short';

      const isValid = validateApiKey(shortKey);

      expect(isValid).toBe(false);
    });

    it('should reject empty or whitespace keys', () => {
      expect(validateApiKey('')).toBe(false);
      expect(validateApiKey('   ')).toBe(false);
      expect(validateApiKey('\n\t')).toBe(false);
    });

    it('should handle keys with special characters', () => {
      const keyWithSpecialChars = 'sk-1234567890abcdef1234567890abcdef1234567890abcdef!@';

      const isValid = validateApiKey(keyWithSpecialChars);

      expect(isValid).toBe(false);
    });

    it('should trim whitespace from keys', () => {
      const keyWithSpaces = '  sk-1234567890abcdef1234567890abcdef1234567890abcdef12  ';

      const isValid = validateApiKey(keyWithSpaces);

      expect(isValid).toBe(true);
    });
  });

  describe('estimateApiCost', () => {
    it('should return a positive cost for non-empty text', () => {
      const text = 'This is a sample text for cost estimation.';

      const cost = estimateApiCost(text);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should return 0 for empty text', () => {
      const cost = estimateApiCost('');

      expect(cost).toBe(0);
    });

    it('should estimate higher cost for longer text', () => {
      const shortText = 'Short text.';
      const longText =
        'This is a much longer text that contains many more words and characters, which should result in a higher estimated cost for the API call.';

      const shortCost = estimateApiCost(shortText);
      const longCost = estimateApiCost(longText);

      expect(longCost).toBeGreaterThan(shortCost);
    });

    it('should return reasonable cost estimates', () => {
      const mediumText = 'This is a medium-length text that should have a reasonable cost estimate for API usage.';

      const cost = estimateApiCost(mediumText);

      // Cost should be reasonable (less than $0.01 for medium text)
      expect(cost).toBeLessThan(0.01);
      expect(cost).toBeGreaterThan(0);
    });
  });
});
