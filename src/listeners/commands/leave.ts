import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';

export default async function handleLeave(
	{
		ack,
		client,
		payload: {
			channel_id: channelId
		}
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack();

	await client.conversations.leave({
		channel: channelId
	});
}
