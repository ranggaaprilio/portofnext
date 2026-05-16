function replaceHexEscapes(input: string): string {
  return input.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
}

export function convertHexEscapeToJson(input: string): string {
  const converted = replaceHexEscapes(input);
  JSON.parse(converted);

  return converted;
}

export function convertHexEscapeToPrettyJson(input: string): string {
  const parsed = JSON.parse(replaceHexEscapes(input));

  return JSON.stringify(parsed, null, 2);
}

export function containsHexEscape(input: string): boolean {
  return /\\x[0-9A-Fa-f]{2}/.test(input);
}

export function isValidHexEscapedJson(input: string): boolean {
  if (!input.trim()) {
    return true;
  }

  try {
    JSON.parse(replaceHexEscapes(input));
    return true;
  }
  catch {
    return false;
  }
}
