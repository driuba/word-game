import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import type { GenericMessageEvent } from '@slack/types';
import { checkCurrentWord } from '~/core';
import { messages } from '~/resources';

export default async function handleMessage(
  {
    logger,
    message,
    say
  }: AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>
) {
  try {
    const {
      channel: channelId,
      text,
      user: userId
    } = message as GenericMessageEvent;

    const word = await checkCurrentWord(channelId, userId, text);

    if (word?.userIdGuesser !== userId) {
      return;
    }

    await say(messages.currentWordGuessed({
      score: word.score.toString(),
      userIdCreator: word.userIdCreator,
      userIdGuesser: word.userIdGuesser,
      word: word.word
    }));
  } catch (error) {
    logger.error(error);
  }
}
