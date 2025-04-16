export const textReplacement = /\$\{([\w-]+)}/gi;

export const wordValidationPattern = /^\p{L}+$/giu;

export function wordGuessPattern(word: string) {
  return new RegExp(String.raw`[\P{L}\P{N}]?${word}[\P{L}\P{N}]?`, 'giu');
}
