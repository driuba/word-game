import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import type { GenericMessageEvent } from '@slack/types';
import { tryScoreOrGuessWords } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (
	{
		logger,
		message,
		say
	}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>
) {
	try {
		const {
			channel: channelId,
			text,
			user: userId
		} = message as GenericMessageEvent;

		const errors = [];

		for await (const word of tryScoreOrGuessWords(channelId, userId, text)) {
			try {
				if (word.userIdGuesser === userId) {
					await say(messages.currentWordGuessed({
						score: word.score.toFixed(),
						userIdCreator: word.userIdCreator,
						userIdGuesser: word.userIdGuesser,
						word: word.word
					}));
				}
			} catch (error) {
				errors.push(error);
			}
		}

		if (errors.length) {
			throw new ApplicationError('Failed to notify guessed words.', { errors });
		}
	} catch (error) {
		logger.error(error);
	}
}
