import { DateTime } from 'luxon';
import client from '~/client.js';
import { getWordExpiration, getWordRights, getWordsActive } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

const dateToday = DateTime
	.now()
	.startOf('day');

export default async function (this: typeof app) {
	this.logger.info('Stating personal report.');

	const errors: unknown[] = [];
	let count = 0;

	const channelIds = await client.getChannelIds();

	if (channelIds.size) {
		const reportsWord = await getWordsActive()
			.then((ws) => ws.reduce<Record<string, Record<'channelId' | 'expiration' | 'score' | 'word', string>[]>>(
				(a, w) => {
					const expiration = getWordExpiration(w);

					if (channelIds.has(w.channelId) && expiration && expiration.startOf('day') <= dateToday) {
						a[w.userIdCreator] ??= [];
						a[w.userIdCreator].push({
							channelId: w.channelId,
							expiration: expiration.toLocaleString(DateTime.DATETIME_SHORT),
							score: w.score.toFixed(),
							word: w.word
						});
					}

					return a;
				},
				{}
			))
			.then((a) => Object
				.entries(a)
				.filter(([, v]) => v.length)
				.map(([k, v]) => ({
					report: messages.reportPrivateActive(v),
					userId: k
				})));

		const reportsRight = await getWordRights()
			.then((wrs) => wrs.reduce<Record<string, Record<string, number>>>(
				(a, wr) => {
					if (channelIds.has(wr.channelId)) {
						for (const { userId } of wr.users) {
							a[userId] ??= {};
							a[userId][wr.channelId] ??= 0;
							a[userId][wr.channelId]++;
						}
					}

					return a;
				},
				{}
			))
			.then((a) => Object
				.entries(a)
				.map(([k1, v1]) => ({
					report: messages.reportPrivateRight(Object
						.entries(v1)
						.filter(([, v2]) => v2)
						.map(([k2, v2]) => ({ channelId: k2, count: v2.toFixed() }))),
					userId: k1
				})));

		const reports = [...reportsWord, ...reportsRight].reduce<Record<string, string[]>>(
			(a, r) => {
				if (r.report) {
					a[r.userId] ??= [];
					a[r.userId].push(r.report);
				}

				return a;
			},
			{}
		);

		for (const [userId, linesReport] of Object.entries(reports)) {
			try {
				await this.client.chat.postMessage({
					channel: userId,
					text: linesReport.join('\n')
				});

				count++;
			} catch (error) {
				errors.push(error);
			}
		}
	}

	if (errors.length) {
		throw new ApplicationError('Failed to notify one or more users about expiration.', { errors });
	}

	this.logger.info(`Finishing personal report, notified ${count.toFixed()} users.`);
}
