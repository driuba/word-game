import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getLatestWord } from '~/core/index.mjs';
import { messages } from '~/resources/index.mjs';

export default async function handleCheck(
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

	if (!word) {
		await respond({
			response_type: 'ephemeral',
			text: messages.currentWordUnset
		});

		return;
	}

	if (!word.userIdGuesser && userId === word.userIdCreator) {
		await respond({
			response_type: 'ephemeral',
			text: messages.currentWordStatusPrivate({
				score: word.score.toString(),
				word: word.word
			})
		});

		return;
	}

	if (userId === word.userIdGuesser) {
		await respond({
			response_type: 'ephemeral',
			text: messages.currentWordSetterMe
		});

		return;
	}

	await respond({
		response_type: 'ephemeral',
		text: (word.userIdGuesser ? messages.currentWordSetter : messages.currentWordHolder)({
			userId: word.userIdGuesser ?? word.userIdCreator
		})
	});
}
