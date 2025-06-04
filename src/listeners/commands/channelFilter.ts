import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { messages } from '~/resources';

export default async function handleFilter(
	{
		ack,
		client,
		next,
		payload: {
			channel_id: channelId
		}
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	const { channels } = await client.users.conversations({
		exclude_archived: true,
		types: 'public_channel,private_channel'
	});

	if (channels?.some(c => c.id === channelId)) {
		await next();

		return;
	}

	await ack({
		response_type: 'ephemeral',
		text: messages.botNotInChat
	});
}
