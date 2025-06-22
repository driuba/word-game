import type { FindManyOptions } from 'typeorm';
import { StatisticChannel, StatisticGlobal } from '~/entities/index.mjs';
import { ApplicationError } from '~/utils/index.mjs';

export enum StatisticPeriod {
	all = 'all',
	week = 'week'
}

export function getStatistics(period: StatisticPeriod): Promise<StatisticGlobal[]>;
export function getStatistics(period: StatisticPeriod, channelId: string): Promise<StatisticChannel[]>;
export function getStatistics(period: StatisticPeriod, channelId?: string) {
	const options: FindManyOptions<StatisticChannel | StatisticGlobal> = {
		take: 10
	};

	if (channelId) {
		(options as FindManyOptions<StatisticChannel>).where = { channelId };
	}

	switch (period) {
		case StatisticPeriod.all: {
			break;
		}
		case StatisticPeriod.week: {
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
			throw new ApplicationError('Unhandled statistics period.', { period });
		}
	}

	return (channelId ? StatisticChannel : StatisticGlobal).find(options);
}
