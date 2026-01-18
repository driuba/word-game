import type { FindManyOptions } from 'typeorm';
import { MoreThan } from 'typeorm';
import { StatisticChannel, StatisticGlobal } from '~/entities/index.js';
import { ApplicationError } from '~/utils/index.js';

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

	const filter = channelId ? { channelId } : undefined;

	switch (period) {
		case StatisticPeriod.all: {
			break;
		}
		case StatisticPeriod.week: {
			options.order = {
				/* eslint-disable sort-keys */
				scoreWeek: 'DESC',
				guessesWeek: 'DESC',
				countWeek: 'ASC',
				countExpiredWeek: 'ASC'
				/* eslint-enable sort-keys */
			};
			options.where = [
				{
					...filter,
					guessesWeek: MoreThan(0)
				},
				{
					...filter,
					countWeek: MoreThan(0)
				}
			];

			break;
		}
		default: {
			throw new ApplicationError('Unhandled statistics period.', { period });
		}
	}

	options.where ??= filter;

	return (channelId ? StatisticChannel : StatisticGlobal).find(options);
}
