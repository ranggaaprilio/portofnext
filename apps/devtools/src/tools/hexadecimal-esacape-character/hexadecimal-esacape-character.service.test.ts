import { describe, expect, it } from 'vitest';
import {
  containsHexEscape,
  convertHexEscapeToJson,
  convertHexEscapeToPrettyJson,
  isValidHexEscapedJson,
} from './hexadecimal-esacape-character.service';

describe('hexadecimal-esacape-character', () => {
  it('converts hexadecimal escape characters inside JSON strings', () => {
    expect(convertHexEscapeToJson('{"value":"Hello\\x20World"}')).toBe('{"value":"Hello World"}');
  });

  it('pretty formats converted JSON', () => {
    expect(convertHexEscapeToPrettyJson('{"value":"Hello\\x20World"}')).toBe('{\n  "value": "Hello World"\n}');
  });

  it('detects hexadecimal escape sequences', () => {
    expect(containsHexEscape('Hello\\x20World')).toBe(true);
    expect(containsHexEscape('Hello World')).toBe(false);
  });

  it('validates converted JSON input', () => {
    expect(isValidHexEscapedJson('')).toBe(true);
    expect(isValidHexEscapedJson('{"value":"Hello\\x20World"}')).toBe(true);
    expect(isValidHexEscapedJson('{"value":')).toBe(false);
  });
});
