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
			.then((ws) => ws.reduce(
				(a, w) => {
					const expiration = getWordExpiration(w);

					if (channelIds.has(w.channelId) && expiration && expiration.startOf('day') <= dateToday) {
						const user = a.get(w.userIdCreator) ?? [];

						if (!a.has(w.userIdCreator)) {
							a.set(w.userIdCreator, user);
						}

						user.push({
							channelId: w.channelId,
							expiration: expiration.toLocaleString(DateTime.DATETIME_SHORT),
							score: w.score.toFixed(),
							word: w.word
						});
					}

					return a;
				},
				new Map<string, Record<'channelId' | 'expiration' | 'score' | 'word', string>[]>()
			))
			.then((a) => a
				.entries()
				.filter(([, v]) => v.length)
				.map(([k, v]) => ({
					report: messages.reportPrivateActive(v),
					userId: k
				})));

		const reportsRight = await getWordRights()
			.then((wrs) => wrs.reduce(
				(a, wr) => {
					if (channelIds.has(wr.channelId)) {
						for (const { userId } of wr.users) {
							const user = a.get(userId) ?? new Map<string, number>();

							if (!a.has(userId)) {
								a.set(userId, user);
							}

							user.set(wr.channelId, (user.get(wr.channelId) ?? 0) + 1);
						}
					}

					return a;
				},
				new Map<string, Map<string, number>>()
			))
			.then((a) => a
				.entries()
				.map(([k1, v1]) => ({
					report: messages.reportPrivateRight(v1
						.entries()
						.filter(([, v2]) => v2)
						.map(([k2, v2]) => ({ channelId: k2, count: v2.toFixed() }))
						.toArray()),
					userId: k1
				})));

		const reports = [...reportsWord, ...reportsRight].reduce(
			(a, r) => {
				if (r.report) {
					const lines = a.get(r.userId) ?? [];

					if (!a.has(r.userId)) {
						a.set(r.userId, lines);
					}

					lines.push(r.report);
				}

				return a;
			},
			new Map<string, string[]>()
		);

		for (const [userId, linesReport] of reports) {
			try {
				await this.client.chat.postMessage({
					channel: userId,
					text: linesReport.join('\n\n')
				});

				count++;
			} catch (error) {
				errors.push(error);
			}
		}
	}

	this.logger.info(`Finishing personal report, notified ${count.toFixed()} users.`);

	if (errors.length) {
		throw new ApplicationError('Failed to notify one or more users about expiration.', { errors });
	}
}
