import type { App } from '@slack/bolt';
import { DateTime } from 'luxon';
import { getActiveWords, getWordExpiration } from '~/core/index.js';
import { messages } from '~/resources/index.js';

const dateToday = DateTime.now().startOf('day');

export default async function (this: App) {
	this.logger.info('Stating personal report.');

	const channelIds = await this.client.users
		.conversations({
			exclude_archived: true,
			types: 'public_channel,private_channel'
		})
		.then(r => new Set(r.channels?.map(c => c.id)));

	if (channelIds.size) {
		const words = await getActiveWords().then(
			ws => ws.map(w => ({
				channelId: w.channelId,
				expiration: getWordExpiration(w),
				score: w.score.toFixed(),
				userId: w.userIdCreator,
				word: w.word
			}))
		);

		for (const word of words) {
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
		}
	}

	this.logger.info('Finishing personal report.');
}
