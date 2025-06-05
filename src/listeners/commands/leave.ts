import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getErrorMessage } from '~/utils';

export default async function handleLeave(
	{
		ack,
		client,
		logger,
		payload: {
			channel_id: channelId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	try {
		await ack();

		await client.conversations.leave({
			channel: channelId
		});
	} catch (error) {
		await respond({
			response_type: 'ephemeral',
			text: getErrorMessage(error)
		});

		logger.error(error);
	}
}
