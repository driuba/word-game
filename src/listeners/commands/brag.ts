import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getWordsActive } from '~/core/index.js';
import { messages } from '~/resources/index.js';

export default async function (
	{
		ack,
		payload: {
			channel_id: channelId,
			user_id: userId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack();

	const words = await getWordsActive(channelId, userId);

	if (words.length) {
		await respond({
			response_type: 'in_channel',
			// TODO: rename
			text: messages.currentWordStatusPublic({
				userId,
				count: words.length.toFixed(),
				score: words
					.reduce((a, w) => a + w.score, 0)
					.toFixed()
			})
		});

		return;
	}

	await respond({
		response_type: 'ephemeral',
		text: messages.nothingToBrag
	});
}
