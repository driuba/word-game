import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getCurrent as getCurrentWord } from '~/core';
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

    const word = await getCurrentWord(channelId);

    if (!word) {
      await respond({
        response_type: 'ephemeral',
        text: messages.currentWordUnset
      });

      return;
    }

    if (userId === word.userIdCreator) {
      await respond({
        response_type: 'ephemeral',
        text: messages.currentWordSet({
          score: word.score.toString(),
          word: word.word
        })
      });

      return;
    }

    const { profile } = await client.users.profile.get({ user: word.userIdCreator });

    if (profile) {
      await respond({
        response_type: 'ephemeral',
        text: messages.currentWordHolder({
          displayName: profile.display_name ?? profile.real_name ?? ''
        })
      });

      return;
    }

    await respond({
      response_type: 'ephemeral',
      text: getErrorMessage()
    });

    logger.error('Profile not found', userId, profile);
  } catch (error) {
    await respond({
      response_type: 'ephemeral',
      text: getErrorMessage(error)
    });

    logger.error(error);
  }
}
