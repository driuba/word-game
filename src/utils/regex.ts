export const textReplacement = /\$\{([\w-]+)}/gi;

export const wordValidationPattern = /^\p{L}+$/giu;

export function wordGuessPattern(word: string) {
  return new RegExp(String.raw`(?<![\p{L}\p{N}])${word}(?![\p{L}\p{N}])`, 'giu');
}
