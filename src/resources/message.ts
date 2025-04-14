import { textReplacement } from '~/utils';
import { default as messages } from './messages.json';

export default {
  ...messages,
  currentWordHolder,
  currentWordSet,
  setWordSuccess
};

function currentWordHolder(values: { displayName: string }) {
  return replace(messages.currentWordHolder, values);
}

function currentWordSet(values: { score: string, word: string }) {
  return replace(messages.currentWordSet, values);
}

function setWordSuccess(values: { word: string }) {
  return replace(messages.setWordSuccess, values);
}

function replace(resource: string, values: Record<string, string>) {
  return resource.replace(
    textReplacement,
    (_, key) => values[key as keyof typeof values]
  );
}
