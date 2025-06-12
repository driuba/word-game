import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import type { StatisticPeriod } from '~/core';
import { getStatistics, statisticPeriod } from '~/core';
import type { StatisticChannel, StatisticGlobal } from '~/entities';
import { messages } from '~/resources';
import { ApplicationError } from '~/utils';

const format = {
	full: 'full',
	short: 'short'
} as const;

const scope = {
	channel: 'channel',
	global: 'global'
} as const;

export default async function handleLeaderboard(
	{
		ack,
		payload: {
			text,
			channel_id: channelId
		},
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack();

	let [inputPeriod, inputFormat, inputScope] = text
		.trim()
		.split(' ', 3) as [string?, string?, string?];

	/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
	inputFormat = inputFormat
		?.trim()
		.toLowerCase() || format.short;

	inputPeriod = inputPeriod
		?.trim()
		.toLowerCase() || statisticPeriod.all;

	inputScope = inputScope
		?.trim()
		.toLowerCase() || scope.channel;
	/* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

	let statistics: (StatisticChannel | StatisticGlobal)[];

	switch (inputScope) {
		case scope.channel: {
			statistics = await getStatistics(inputPeriod as StatisticPeriod, channelId);

			break;
		}
		case scope.global: {
			statistics = await getStatistics(inputPeriod as StatisticPeriod);

			break;
		}
		default: {
			throw new ApplicationError('Invalid statistics scope.', 'INPUT_INVALID');
		}
	}

	if (!statistics.length) {
		await respond({
			response_type: 'ephemeral',
			text: messages.nothingInStatistics
		});

		return;
	}

	let data;

	switch (inputPeriod) {
		case statisticPeriod.all: {
			data = statistics.map(s => ({
				average: s.averageAll.toFixed(2),
				count: s.countAll.toFixed(),
				guesses: s.guessesAll.toFixed(),
				maximum: s.maximumAll.toFixed(),
				score: s.scoreAll.toFixed(),
				userId: `<@${s.userId}>`
			}));

			break;
		}
		case statisticPeriod.week: {
			data = statistics.map(s => ({
				average: s.averageWeek.toFixed(2),
				count: s.countWeek.toFixed(),
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
			data = data.map(d => `- ${d.userId}\n\t- Score: ${d.score}\n\t- Count: ${d.count}\n\t- Average: ${d.average}\n\t- Maximum: ${d.maximum}\n\t- Guesses: ${d.guesses}`);

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
}
