import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { setWord } from '~/core';
import { getErrorMessage } from '~/utils';
import { messages } from '~/resources';

export default async function handleSetWord(
	{
		ack,
		logger,
		payload: {
			text,
			channel_id: channelId,
			user_id: userId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	try {
		await ack();

		const { word } = await setWord(channelId, userId, text);

		await respond({
			response_type: 'ephemeral',
			text: messages.setWordSuccess({ word })
		});
	} catch (error) {
		await respond({
			response_type: 'ephemeral',
			text: getErrorMessage(error)
		});

		logger.error(error);
	}
}
