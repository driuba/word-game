import client from '~/client.js';
import { expireWords } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: typeof app) {
	const errors: unknown[] = [];
	let count = 0;

	this.logger.info('Starting expiration.');

	const channelIds = await client.getChannelIds();

	try {
		for await (const word of expireWords()) {
			try {
				if (!channelIds.has(word.channelId)) {
					continue;
				}

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
	} catch (error) {
		errors.push(error);
	}

	this.logger.info(`Finished expiration, expired ${count.toFixed()} words.`);

	if (errors.length) {
		throw new ApplicationError('Worker failed expire words or notify users with errors.', { errors });
	}
}
