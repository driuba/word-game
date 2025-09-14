import { DateTime } from 'luxon';
import client from '~/client.js';
import { getWordExpiration, getWordsActive } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

const dateToday = DateTime
	.now()
	.startOf('day');

export default async function (this: typeof app) {
	this.logger.info('Stating personal report.');

	const channelIds = await client.getChannelIds();

	let count = 0;

	if (channelIds.size) {
		const errors: unknown[] = [];

		const words = await getWordsActive().then(
			(ws) => ws.map((w) => ({
				channelId: w.channelId,
				expiration: getWordExpiration(w),
				score: w.score.toFixed(),
				userId: w.userIdCreator,
				word: w.word
			}))
		);

		for (const word of words) {
			try {
				if (!channelIds.has(word.channelId)) {
					continue;
				}

				if (!word.expiration || word.expiration.startOf('day') > dateToday) {
					continue;
				}

				await this.client.chat.postMessage({
					channel: word.userId,
					text: messages.reportPrivate({
						...word,
						expiration: word.expiration.toLocaleString(DateTime.DATETIME_SHORT)
					})
				});

				count++;
			} catch (error) {
				errors.push(error);
			}
		}

		if (errors.length) {
			throw new ApplicationError('Failed to notify one or more users about expiration.', { errors });
		}
	}

	this.logger.info(`Finishing personal report, notified ${count.toFixed()} users.`);
}
