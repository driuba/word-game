import { tryExpireWords } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: typeof app) {
	let count = 0;
	const errors: unknown[] = [];

	this.logger.info('Starting expiration.');

	const channelIds = await this.client.users
		.conversations({
			exclude_archived: true,
			types: 'public_channel,private_channel'
		})
		.then(r => new Set(r.channels?.map(c => c.id)));

	for await (const word of tryExpireWords()) {
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

	this.logger.info(`Finished expiration, expired ${count.toFixed()} words.`);

	if (errors.length) {
		throw new ApplicationError('Worker failed to send messages with errors.', { errors });
	}
}
