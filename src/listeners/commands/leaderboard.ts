import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getStatistics } from '~/core';
import { getErrorMessage } from '~/utils';

export default async function handleLeaderboard(
  {
    ack,
    logger,
    payload: {
      channel_id: channelId
    },
    respond
  }: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
  try {
    await ack();

    await respond({
      response_type: 'ephemeral',
      text: await getStatistics(channelId).then(
        ss => ss
          .map(
            s => `- <@${s.userId}>\n\t- ${s.guessesAll.toFixed()}\n\t- ${s.scoreAll.toFixed()}\n\t- ${s.averageAll.toFixed(2)}\n\t- ${s.maximumAll.toFixed()}`
          )
          .join('\n')
      )
    });
  } catch (error) {
    await respond({
      response_type: 'ephemeral',
      text: getErrorMessage(error)
    });

    logger.error(error);
  }
}
