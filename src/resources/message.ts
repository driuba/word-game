import { textReplacement } from '~/utils';
import messages from './messages.json';

export default {
  ...messages,
  currentWordGuessed,
  currentWordHolder,
  currentWordSet,
  currentWordSetter,
  setWordSuccess
};

function currentWordGuessed(values: { score: string, userIdGuesser: string, userIdCreator: string, word: string }) {
  return replace(messages.currentWordGuessed, values);
}

function currentWordHolder(values: { userId: string }) {
  return replace(messages.currentWordHolder, values);
}

function currentWordSet(values: { score: string, word: string }) {
  return replace(messages.currentWordSet, values);
}

function currentWordSetter(values: { userId: string }) {
  return replace(messages.currentWordSetter, values);
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
