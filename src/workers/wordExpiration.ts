import type { App } from '@slack/bolt';
import { tryExpireWords } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: App) {
	let count = 0;
	const errors: unknown[] = [];

	this.logger.info('Starting expiration.');

	for await (const word of tryExpireWords()) {
		try {
			await this.client.chat.postMessage({
				channel: word.channelId,
				text: messages.currentWordExpiredPublic({
					score: word.score.toFixed(),
					userId: word.userIdCreator,
					word: word.word
				})
			});
		} catch (error) {
			errors.push(error);
		} finally {
			count++;
		}
	}

	this.logger.info(`Finished expiration, expired ${count.toFixed()} words.`);

	if (errors.length) {
		throw new ApplicationError('Worker failed to send messages with errors.', { errors });
	}
}
