import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { DateTime } from 'luxon';
import { getWordExpiration, getWordRights, getWordsActive } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (
	{
		ack,
		payload: {
			channel_id: channelId,
			user_id: userId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack();

	const reportWords = await getWordsActive(channelId)
		.then(
			(ws) => ws.reduce(
				(a, w) => {
					if (w.userIdCreator === userId) {
						a.personal.push({
							expiration: getWordExpiration(w)?.toLocaleString(DateTime.DATETIME_SHORT),
							score: w.score.toFixed(),
							word: w.word
						});
					} else {
						a.other[w.userIdCreator] ??= 0;
						a.other[w.userIdCreator]++;
					}

					return a;
				},
				{
					other: {} as Record<string, number>,
					personal: [] as { expiration?: string; score: string; word: string }[]
				}
			)
		)
		.then((a) => ({
			...a,
			other: Object
				.entries(a.other)
				.map(([k, v]) => ({
					count: v.toFixed(),
					userId: k
				}))
		}))
		.then((a) => ({
			other: messages.checkWordsActiveOther(a.other) || false as string | false,
			personal: messages.checkWordsActivePersonal(a.personal) || false as string | false
		}));

	const reportRights = await getWordRights(channelId)
		.then((wrs) => wrs.reduce(
			(a, wr) => {
				if (wr.users.some((u) => u.userId === userId)) {
					if (wr.users.length === 1) {
						a.personal++;
					} else {
						a.shared++;
					}
				}

				a.total++;

				return a;
			},
			{
				personal: 0,
				shared: 0,
				total: 0
			}
		))
		.then((a) => ({
			personal: a.personal.toFixed(),
			shared: a.shared.toFixed(),
			show: a.total > 0,
			total: a.total.toFixed()
		}))
		.then((a) => a.show && messages.checkWordRights(a));

	const linesReport: string[] = [];

	if (reportWords.personal) {
		linesReport.push(reportWords.personal);
	}

	if (reportWords.other) {
		linesReport.push(reportWords.other);
	}

	if (reportRights) {
		linesReport.push(reportRights);
	}

	if (linesReport.length) {
		await respond({
			response_type: 'ephemeral',
			text: linesReport.join('\n')
		});
	} else {
		throw new ApplicationError(`Something's not right... I can feel i-i-i-i-it!`);
	}
}
