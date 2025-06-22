import type { DataSource } from 'typeorm';
import {
	BaseEntity,
	Index,
	ViewColumn,
	ViewEntity
} from 'typeorm';
import { FloatValueTransformer, IntValueTransformer } from './utils.js';
import { Word } from './word.js';

@ViewEntity({
	expression(dataSource) {
		return dataSource
			.createQueryBuilder()
			.addCommonTableExpression(selectWordsGuessedAll(dataSource), wordsGuessedAll)
			.addCommonTableExpression(selectWordsGuessedWeek(dataSource), wordsGuessedWeek)
			.addCommonTableExpression(selectChannelUsers(dataSource), channelUsers)
			.addCommonTableExpression(groupGuesses(dataSource, wordsGuessedAll), guessesAll)
			.addCommonTableExpression(groupGuesses(dataSource, wordsGuessedWeek), guessesWeek)
			.addCommonTableExpression(groupScores(dataSource, wordsGuessedAll), scoresAll)
			.addCommonTableExpression(groupScores(dataSource, wordsGuessedWeek), scoresWeek)
			.from(channelUsers, 'cu')
			.select('"cu"."ChannelId"')
			.addSelect('"cu"."UserId"')
			.addSelect('COALESCE("sw"."Count", 0)', 'CountWeek')
			.addSelect('COALESCE("sw"."Score", 0)', 'ScoreWeek')
			.addSelect('COALESCE("sw"."Average", 0)', 'AverageWeek')
			.addSelect('COALESCE("sw"."Maximum", 0)', 'MaximumWeek')
			.addSelect('COALESCE("gw"."Guesses", 0)', 'GuessesWeek')
			.addSelect('COALESCE("sa"."Count", 0)', 'CountAll')
			.addSelect('COALESCE("sa"."Score", 0)', 'ScoreAll')
			.addSelect('COALESCE("sa"."Average", 0)', 'AverageAll')
			.addSelect('COALESCE("sa"."Maximum", 0)', 'MaximumAll')
			.addSelect('COALESCE("ga"."Guesses", 0)', 'GuessesAll')
			.leftJoin(guessesAll, 'ga', '"ga"."ChannelId" = "cu"."ChannelId" AND "ga"."UserId" = "cu"."UserId"')
			.leftJoin(guessesWeek, 'gw', '"gw"."ChannelId" = "cu"."ChannelId" AND "gw"."UserId" = "cu"."UserId"')
			.leftJoin(scoresAll, 'sa', '"sa"."ChannelId" = "cu"."ChannelId" AND "sa"."UserId" = "cu"."UserId"')
			.leftJoin(scoresWeek, 'sw', '"sw"."ChannelId" = "cu"."ChannelId" AND "sw"."UserId" = "cu"."UserId"')
			.orderBy('"sa"."Score"', 'DESC', 'NULLS LAST')
			.addOrderBy('"ga"."Guesses"', 'DESC', 'NULLS LAST');
	},
	name: 'StatisticsChannel'
})
export class StatisticChannel extends BaseEntity {
	@ViewColumn({
		name: 'AverageAll',
		transformer: new FloatValueTransformer()
	})
	readonly averageAll!: number;

	@ViewColumn({
		name: 'AverageWeek',
		transformer: new FloatValueTransformer()
	})
	readonly averageWeek!: number;

	@Index()
	@ViewColumn({ name: 'ChannelId' })
	readonly channelId!: string;

	@ViewColumn({
		name: 'CountAll',
		transformer: new IntValueTransformer()
	})
	readonly countAll!: number;

	@ViewColumn({
		name: 'CountWeek',
		transformer: new IntValueTransformer()
	})
	readonly countWeek!: number;

	@ViewColumn({
		name: 'GuessesAll',
		transformer: new IntValueTransformer()
	})
	readonly guessesAll!: number;

	@ViewColumn({
		name: 'GuessesWeek',
		transformer: new IntValueTransformer()
	})
	readonly guessesWeek!: number;

	@ViewColumn({ name: 'MaximumAll' })
	readonly maximumAll!: number;

	@ViewColumn({ name: 'MaximumWeek' })
	readonly maximumWeek!: number;

	@ViewColumn({
		name: 'ScoreAll',
		transformer: new IntValueTransformer()
	})
	readonly scoreAll!: number;

	@ViewColumn({
		name: 'ScoreWeek',
		transformer: new IntValueTransformer()
	})
	readonly scoreWeek!: number;

	@ViewColumn({ name: 'UserId' })
	readonly userId!: string;
}

const channelUsers = 'ChannelUsers';
const guessesAll = 'GuessesAll';
const guessesWeek = 'GuessesWeek';
const scoresAll = 'ScoresAll';
const scoresWeek = 'ScoresWeek';
const wordsGuessedAll = 'WordsGuessedAll';
const wordsGuessedWeek = 'WordsGuessedWeek';

function groupGuesses(dataSource: DataSource, from: string) {
	return dataSource
		.createQueryBuilder()
		.select('"w"."ChannelId"')
		.addSelect('"w"."UserIdGuesser"', 'UserId')
		.addSelect('COUNT(1)', 'Guesses')
		.from(from, 'w')
		.groupBy('"w"."ChannelId"')
		.addGroupBy('"w"."UserIdGuesser"');
}

function groupScores(dataSource: DataSource, from: string) {
	return dataSource
		.createQueryBuilder()
		.select('"w"."ChannelId"')
		.addSelect('"w"."UserIdCreator"', 'UserId')
		.addSelect('COUNT(1)', 'Count')
		.addSelect('SUM("w"."Score")', 'Score')
		.addSelect('AVG("w"."Score")', 'Average')
		.addSelect('MAX("w"."Score")', 'Maximum')
		.from(from, 'w')
		.groupBy('"w"."ChannelId"')
		.addGroupBy('"w"."UserIdCreator"');
}

function selectChannelUsers(dataSource: DataSource) {
	const userIdsCreator = dataSource
		.createQueryBuilder()
		.select('"wga"."ChannelId"')
		.addSelect('"wga"."UserIdCreator"', 'UserId')
		.from(wordsGuessedAll, 'wga')
		.getQuery();

	const userIdsGuesser = dataSource
		.createQueryBuilder()
		.select('"wga"."ChannelId"')
		.addSelect('"wga"."UserIdGuesser"', 'UserId')
		.from(wordsGuessedAll, 'wga')
		.getQuery();

	return `${userIdsCreator} UNION ${userIdsGuesser}`;
}

function selectWordsGuessedAll(dataSource: DataSource) {
	return dataSource
		.createQueryBuilder()
		.from(Word, 'w')
		.where('"w"."UserIdGuesser" IS NOT NULL');
}

function selectWordsGuessedWeek(dataSource: DataSource) {
	return dataSource
		.createQueryBuilder()
		.from(wordsGuessedAll, 'wga')
		.where(`"wga"."Created" >= date_trunc('week', CURRENT_TIMESTAMP)`);
}
