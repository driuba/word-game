import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import type { GenericMessageEvent } from '@slack/types';
import { tryScoreOrGuessWord } from '~/core/index.js';
import { messages } from '~/resources/index.js';

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

		const word = await tryScoreOrGuessWord(channelId, userId, text);

		if (word?.userIdGuesser === userId) {
			await say(messages.currentWordGuessed({
				score: word.score.toFixed(),
				userIdCreator: word.userIdCreator,
				userIdGuesser: word.userIdGuesser,
				word: word.word
			}));
		}
	} catch (error) {
		logger.error(error);
	}
}
