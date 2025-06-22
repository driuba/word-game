import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getLatestWord } from '~/core/index.js';
import { messages } from '~/resources/index.js';

export default async function handleBrag(
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

	if (word && !word.userIdGuesser && userId === word.userIdCreator) {
		await respond({
			response_type: 'in_channel',
			text: messages.currentWordStatusPublic({
				score: word.score.toString(),
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
