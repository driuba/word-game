import client from '~/client.js';
import config from '~/config.js';
import { getWordRights, getWordsActive } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: typeof app) {
	if (!config.wg.reportingChatId) {
		throw new ApplicationError('Reporting chat ID is required for report worker.', 'CONFIG_INVALID');
	}

	this.logger.info('Stating report.');

	const channelIds = await client.getChannelIds();

	const reportWords = await getWordsActive()
		.then((ws) => ws.reduce<Record<string, Record<string, number>>>(
			(a, w) => {
				if (channelIds.has(w.channelId)) {
					a[w.channelId] ??= {};
					a[w.channelId][w.userIdCreator] ??= 0;
					a[w.channelId][w.userIdCreator]++;
				}

				return a;
			},
			{}
		))
		.then((a) => Object
			.entries(a)
			.flatMap(([k1, v1]) => Object
				.entries(v1)
				.map(([k2, v2]) => ({
					channelId: k1,
					count: v2.toFixed(),
					userId: k2
				}))
			)
		)
		.then(messages.reportActive.bind(undefined));

	const reportRights = await getWordRights(reportWords)
		.then((wrs) => wrs.reduce<Record<string, number>>(
			(a, wr) => {
				if (channelIds.has(wr.channelId)) {
					a[wr.channelId] ??= 0;
					a[wr.channelId]++;
				}

				return a;
			},
			{}
		))
		.then((a) => Object
			.entries(a)
			.map(([k, v]) => ({
				channelId: k,
				count: v.toFixed()
			})))
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
		text: linesReport.join('\n') || messages.reportEmpty
	});

	this.logger.info('Finishing report.');
}
