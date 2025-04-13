export const wordValidationPattern = /^\p{L}+$/giu;

export function wordGuessPattern(word: string) {
  return new RegExp(`\\b${word}\\b`, 'giu');
}
