import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getLatestWord } from '~/core';
import { messages } from '~/resources';
import { getErrorMessage } from '~/utils';

export default async function handleBrag(
	{
		ack,
		logger,
		payload: {
			channel_id: channelId,
			user_id: userId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	try {
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
	} catch (error) {
		await respond({
			response_type: 'ephemeral',
			text: getErrorMessage(error)
		});

		logger.error(error);
	}
}
