import { IsNull } from 'typeorm';
import { Word } from '~/entities';
import { wordValidationPattern, ApplicationError } from '~/utils';

export function getCurrentWord(channelId: string) {
  return Word.findOneBy({
    channelId,
    userIdGuesser: IsNull()
  });
}

export async function setWord(channelId: string, userId: string, word: string) {
  if (wordValidationPattern.test(word)) {
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

  if (!latestWord || latestWord.userIdGuesser !== userId) {
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
