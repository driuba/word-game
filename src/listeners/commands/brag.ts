import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getLatestWord } from '~/core/index.js';
import { isWordActive } from '~/entities/index.js';
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

	const word = await getLatestWord(channelId);

	if (word && isWordActive(word) && word.userIdCreator === userId) {
		await respond({
			response_type: 'in_channel',
			text: messages.currentWordStatusPublic({
				score: word.score.toFixed(),
				userId: word.userIdCreator
			})
		});

		return;
	}

	await respond({
		response_type: 'ephemeral',
		text: messages.nothingToBrag
	});
}
