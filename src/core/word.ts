import { IsNull } from 'typeorm';
import { Word } from '~/entities';
import {
  wordGuessPattern,
  wordValidationPattern,
  ApplicationError
} from '~/utils';
import type { Logger } from "@slack/logger";


export async function checkCurrent(logger: Logger, channelId: string, userId: string, text?: string) {
  logger.info(text);

  if (!text) {
    return;
  }

  const word = await getCurrent(channelId);

  logger.info(word);

  if (!word) {
    return;
  }

  const pattern = wordGuessPattern(word.word);

  logger.info(pattern);

  if (!pattern.test(text)) {
    return;
  }

  if (word.userIdCreator === userId) {
    word.score++;
  } else {
    word.userIdGuesser = userId;
  }

  await word.save();

  return word;
}

export function getCurrent(channelId: string) {
  return Word.findOneBy({
    channelId,
    userIdGuesser: IsNull()
  });
}

export async function set(channelId: string, userId: string, word: string) {
  if (!wordValidationPattern.test(word)) {
    throw new ApplicationError('Word must consist of only letters.', 'WORD_INVALID');
  }

  const latestWord = await Word.findOne({
    order: {
      modified: 'desc'
    },
    where: {
      channelId
    }
  });

  if (latestWord && latestWord.userIdGuesser !== userId) {
    throw new ApplicationError('Only the user that guessed the last word can set the next one.', 'USER_INVALID');
  }

  const newWord = Word.create({
    channelId,
    word,
    userIdCreator: userId
  });

  await newWord.save();

  return newWord;
}
