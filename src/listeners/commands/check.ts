import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { DateTime } from 'luxon';
import { getWordExpiration, getWordLatest } from '~/core/index.js';
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

	const word = await getWordLatest(channelId);

	if (!word) {
		await respond({
			response_type: 'ephemeral',
			text: messages.currentWordUnset
		});

		return;
	}

	if (isWordActive(word)) {
		if (word.userIdCreator === userId) {
			await respond({
				response_type: 'ephemeral',
				text: messages.currentWordStatusPrivate({
					expiration: getWordExpiration(word)?.toLocaleString(DateTime.DATETIME_SHORT),
					score: word.score.toFixed(),
					word: word.word
				})
			});

			return;
		}

		await respond({
			response_type: 'ephemeral',
			text: messages.currentWordHolder({
				userId: word.userIdCreator
			})
		});

		return;
	}

	if (word.expired) {
		if (word.userIdCreator === userId) {
			await respond({
				response_type: 'ephemeral',
				text: messages.currentWordExpiredPrivateMe({
					expired: word.expired.toLocaleString(DateTime.DATETIME_SHORT),
					score: word.score.toFixed(),
					word: word.word
				})
			});

			return;
		}

		await respond({
			response_type: 'ephemeral',
			text: messages.currentWordExpiredPrivate({
				expired: word.expired.toLocaleString(DateTime.DATETIME_SHORT),
				score: word.score.toFixed(),
				userId: word.userIdCreator,
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
		text: messages.currentWordSetter({
			userId: word.userIdGuesser
		})
	});
}
