import { textReplacement } from '~/utils';
import { default as messages } from './messages.json';

export default {
  ...messages,
  setWordSuccess
};

function setWordSuccess(values: { word: string }) {
  return messages.setWordSuccess.replace(
    textReplacement,
    (_, key) => values[key as keyof typeof values]
  );
}
