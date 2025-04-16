import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getLatest as getLatestWord } from '~/core';
import { messages } from '~/resources';
import { getErrorMessage } from '~/utils';

export default async function handleCheck(
  {
    ack,
    client,
    logger,
    payload: {
      channel_id: channelId,
      user_id: userId
    },
    respond
  }: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
  try {
    await ack();

    const word = await getLatestWord(channelId);

    if (!word) {
      await respond({
        response_type: 'ephemeral',
        text: messages.currentWordUnset
      });

      return;
    }

    if (!word.userIdGuesser && userId === word.userIdCreator) {
      await respond({
        response_type: 'ephemeral',
        text: messages.currentWordSet({
          score: word.score.toString(),
          word: word.word
        })
      });

      return;
    }

    if (userId === word.userIdGuesser) {
      await respond({
        response_type: 'ephemeral',
        text: messages.currentWordSetterMe
      });

      return;
    }

    const { profile } = await client.users.profile.get({ user: word.userIdGuesser ?? word.userIdCreator });

    if (profile) {
      const message = word.userIdGuesser ? messages.currentWordSetter : messages.currentWordHolder;

      await respond({
        response_type: 'ephemeral',
        text: message({
          displayName: profile.display_name ?? profile.real_name ?? '*_insert user name?_*'
        })
      });

      return;
    }

    await respond({
      response_type: 'ephemeral',
      text: getErrorMessage()
    });

    logger.error(
      'Profile not found',
      profile,
      {
        creator: word.userIdCreator,
        guesser: word.userIdGuesser
      }
    );
  } catch (error) {
    await respond({
      response_type: 'ephemeral',
      text: getErrorMessage(error)
    });

    logger.error(error);
  }
}
