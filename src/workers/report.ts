import client from '~/client.js';
import config from '~/config.js';
import { getWordRights, getWordsActive } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: typeof app) {
	if (!config.wg.reportingChatId) {
		throw new ApplicationError('Reporting chat ID is required for report worker.', 'CONFIG_INVALID');
	}

	this.logger.info('Starting report.');

	const channelIds = await client.getChannelIds();

	const reportWords = await getWordsActive()
		.then((ws) => ws.reduce(
			(a, w) => {
				if (channelIds.has(w.channelId)) {
					const channel = a.get(w.channelId) ?? new Map<string, number>();

					if (!a.has(w.channelId)) {
						a.set(w.channelId, channel);
					}

					channel.set(w.userIdCreator, (channel.get(w.userIdCreator) ?? 0) + 1);
				}

				return a;
			},
			new Map<string, Map<string, number>>()
		))
		.then((a) => a
			.entries()
			.flatMap(([k1, v1]) => v1
				.entries()
				.map(([k2, v2]) => ({
					channelId: k1,
					count: v2.toFixed(),
					userId: k2
				}))
			)
			.toArray()
		)
		.then(messages.reportActive.bind(undefined));

	const reportRights = await getWordRights()
		.then((wrs) => wrs.reduce(
			(a, wr) => {
				if (channelIds.has(wr.channelId)) {
					a.set(wr.channelId, (a.get(wr.channelId) ?? 0) + 1);
				}

				return a;
			},
			new Map<string, number>()
		))
		.then((a) => a
			.entries()
			.map(([k, v]) => ({
				channelId: k,
				count: v.toFixed()
			}))
			.toArray())
		.then(messages.reportRights.bind(undefined));

	const linesReport: string[] = [];

	if (reportWords) {
		linesReport.push(reportWords);
	}

	if (reportRights) {
		linesReport.push(reportRights);
	}

	await this.client.chat.postMessage({
		channel: config.wg.reportingChatId,
		text: linesReport.join('\n\n') || messages.reportEmpty
	});

	this.logger.info('Finishing report.');
}
