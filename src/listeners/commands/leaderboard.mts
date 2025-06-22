import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getStatistics, StatisticPeriod } from '~/core/index.mjs';
import type { StatisticChannel, StatisticGlobal } from '~/entities/index.mjs';
import { messages } from '~/resources/index.mjs';
import { ApplicationError } from '~/utils/index.mjs';

enum Format {
	full = 'full',
	short = 'short'
}

enum Scope {
	channel = 'channel',
	global = 'global'
}

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
		.toLowerCase() || Format.short;

	inputPeriod = inputPeriod
		?.trim()
		.toLowerCase() || StatisticPeriod.all;

	inputScope = inputScope
		?.trim()
		.toLowerCase() || Scope.channel;
	/* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

	assertFormat(inputFormat);
	assertScope(inputScope);
	assertStatisticPeriod(inputPeriod);

	let statistics: (StatisticChannel | StatisticGlobal)[];

	switch (inputScope) {
		case Scope.channel: {
			statistics = await getStatistics(inputPeriod, channelId);

			break;
		}
		case Scope.global: {
			statistics = await getStatistics(inputPeriod);

			break;
		}
		default: {
			throw new ApplicationError('Unhandled statistics scope.', { inputScope });
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
		case StatisticPeriod.all: {
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
		case StatisticPeriod.week: {
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
			throw new ApplicationError('Unhandled statistics period.', { inputPeriod });
		}
	}

	switch (inputFormat) {
		case Format.full: {
			data = data.map(d => `- ${d.userId}\n\t- Score: ${d.score}\n\t- Count: ${d.count}\n\t- Average: ${d.average}\n\t- Maximum: ${d.maximum}\n\t- Guesses: ${d.guesses}`);

			break;
		}
		case Format.short: {
			data = data.map(d => `- ${d.score} ${d.userId}`);

			break;
		}
		default: {
			throw new ApplicationError('Unhandled statistics format.', { inputFormat });
		}
	}

	await respond({
		response_type: 'ephemeral',
		text: '```' + data.join('\n') + '```'
	});
}

const formats = new Set(
	Object.values<string>(Format)
);
const scopes = new Set(
	Object.values<string>(Scope)
);
const statisticPeriods = new Set(
	Object.values<string>(StatisticPeriod)
);

function assertFormat(value: unknown): asserts value is Format {
	if (!(typeof value === 'string' && formats.has(value))) {
		throw new ApplicationError('Invalid input format.', 'INPUT_INVALID', { value });
	}
}

function assertScope(value: unknown): asserts value is Scope {
	if (!(typeof value === 'string' && scopes.has(value))) {
		throw new ApplicationError('Invalid input scope.', 'INPUT_INVALID', { value });
	}
}

function assertStatisticPeriod(value: unknown): asserts value is StatisticPeriod {
	if (!(typeof value === 'string' && statisticPeriods.has(value))) {
		throw new ApplicationError('Invalid input period.', 'INPUT_INVALID', { value });
	}
}
