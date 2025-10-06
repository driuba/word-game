import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import client from '~/client.js';
import { messages } from '~/resources/index.js';

export default async function (
	{
		ack,
		next,
		payload: {
			channel_id: channelId
		}
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	const channelIds = await client.getChannelIds();

	if (channelIds.has(channelId)) {
		await next();

		return;
	}

	await ack({
		response_type: 'ephemeral',
		text: messages.botNotInChat
	});
}
