import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { setWord } from '~/core/index.js';
import { messages } from '~/resources/index.js';

export default async function (
	{
		ack,
		payload: {
			text,
			channel_id: channelId,
			user_id: userId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack();

	const { word } = await setWord(channelId, userId, text);

	await respond({
		response_type: 'ephemeral',
		text: messages.setWordSuccess({ word })
	});
}
