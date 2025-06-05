import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getStatistics } from '~/core';
import { getErrorMessage, ApplicationError } from '~/utils';

const format = {
	full: 'full',
	short: 'short'
} as const;

const period = {
	all: 'all',
	week: 'week'
} as const;

export default async function handleLeaderboard(
	{
		ack,
		logger,
		payload: {
			text,
			channel_id: channelId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	try {
		await ack();

		let [inputPeriod, inputFormat] = text
			.trim()
			.split(' ', 2) as [string?, string?];

		/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
		inputFormat = inputFormat
			?.trim()
			.toLowerCase() || format.short;

		inputPeriod = inputPeriod
			?.trim()
			.toLowerCase() || period.all;
		/* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

		const statistics = await getStatistics(channelId);

		let data;

		switch (inputPeriod) {
			case period.all: {
				data = statistics.map(s => ({
					average: s.averageAll.toFixed(2),
					guesses: s.guessesAll.toFixed(),
					maximum: s.maximumAll.toFixed(),
					score: s.scoreAll.toFixed(),
					userId: `<@${s.userId}>`
				}));

				break;
			}
			case period.week: {
				data = statistics.map(s => ({
					average: s.averageWeek.toFixed(2),
					guesses: s.guessesWeek.toFixed(),
					maximum: s.maximumWeek.toFixed(),
					score: s.scoreWeek.toFixed(),
					userId: `<@${s.userId}>`
				}));

				break;
			}
			default: {
				throw new ApplicationError('Invalid statistics period.', 'INPUT_INVALID');
			}
		}

		switch (inputFormat) {
			case format.full: {
				data = data.map(d => `- ${d.userId}\n\t- Score: ${d.score}\n\t- Average: ${d.average}\n\t- Maximum: ${d.maximum}\n\t- Guesses: ${d.guesses}`);

				break;
			}
			case format.short: {
				data = data.map(d => `- ${d.score} ${d.userId}`);

				break;
			}
			default: {
				throw new ApplicationError('Invalid statistics format.', 'INPUT_INVALID');
			}
		}

		await respond({
			response_type: 'ephemeral',
			text: '```' + data.join('\n') + '```'
		});
	} catch (error) {
		await respond({
			response_type: 'ephemeral',
			text: getErrorMessage(error)
		});

		logger.error(error);
	}
}
