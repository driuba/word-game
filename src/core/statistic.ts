import type { FindManyOptions } from 'typeorm';
import { StatisticChannel, StatisticGlobal } from '~/entities';
import { ApplicationError } from '~/utils';

export type StatisticPeriod = typeof statisticPeriod[keyof typeof statisticPeriod];

export const statisticPeriod = {
	all: 'all',
	week: 'week'
} as const;

export function getStatistics(period: StatisticPeriod): Promise<StatisticGlobal[]>;
export function getStatistics(period: StatisticPeriod, channelId: string): Promise<StatisticChannel[]>;
export function getStatistics(period: StatisticPeriod, channelId?: string): Promise<(StatisticChannel | StatisticGlobal)[]> {
	const options: FindManyOptions<StatisticChannel | StatisticGlobal> = {
		take: 10
	};

	if (channelId) {
		(options as FindManyOptions<StatisticChannel>).where = { channelId };
	}

	switch (period) {
		case statisticPeriod.all: {
			break;
		}
		case statisticPeriod.week: {
			options.order = {
				scoreWeek: {
					direction: 'DESC',
					nulls: 'LAST'
				},
				guessesWeek: {
					direction: 'DESC',
					nulls: 'LAST'
				}
			};

			break;
		}
		default: {
			throw new ApplicationError('Invalid statistics period.', 'INPUT_INVALID');
		}
	}

	return (channelId ? StatisticChannel : StatisticGlobal).find(options);
}
