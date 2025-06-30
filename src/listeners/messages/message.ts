import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import type { GenericMessageEvent } from '@slack/types';
import { tryScoreOrGuessWord } from '~/core/index.js';
import { messages } from '~/resources/index.js';

export default async function handleMessage(
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
		// TODO: if implemented via a job this will be unnecessary
		// else if (word?.expired) {
		// 	await say(messages.currentWordExpired({
		// 		score: word.score.toFixed(),
		// 		userIdCreator: word.userIdCreator,
		// 		word: word.word
		// 	}));
		// }
	} catch (error) {
		logger.error(error);
	}
}
