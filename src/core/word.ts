import { IsNull } from 'typeorm';
import { Word } from '~/entities';
import {
  wordGuessPattern,
  wordValidationPattern,
  ApplicationError
} from '~/utils';

export async function checkCurrent(channelId: string, userId: string, text?: string) {
  if (!text) {
    return;
  }

  const word = await getCurrent(channelId);

  if (!word) {
    return;
  }

  const pattern = wordGuessPattern(word.word);

  if (!text.match(pattern)?.length) {
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

export function getLatest(channelId: string) {
  return Word.findOne({
    order: {
      created: 'desc'
    },
    where: {
      channelId
    }
  });
}

export async function set(channelId: string, userId: string, text: string) {
  text = text.trim();

  if (!text.match(wordValidationPattern)?.length) {
    throw new ApplicationError('Word must consist of only letters.', 'WORD_INVALID');
  }

  const latestWord = await getLatest(channelId);

  if (latestWord && latestWord.userIdGuesser !== userId) {
    throw new ApplicationError('Only the user that guessed the last word can set the next one.', 'USER_INVALID');
  }

  const newWord = Word.create({
    channelId,
    userIdCreator: userId,
    word: text
  });

  await newWord.save();

  return newWord;
}
