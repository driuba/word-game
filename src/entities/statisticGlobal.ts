import type { DataSource } from 'typeorm';
import {
	BaseEntity,
	ViewColumn,
	ViewEntity
} from 'typeorm';
import { StatisticChannel } from './statisticChannel';
import { FloatValueTransformer, IntValueTransformer } from './utils';

@ViewEntity({
	expression(dataSource) {
		return dataSource
			.createQueryBuilder()
			.addCommonTableExpression(group(dataSource), statistic)
			.from(statistic, 's')
			.select('"s"."UserId"')
			.addSelect('"s"."CountWeek"')
			.addSelect('"s"."ScoreWeek"')
			.addSelect('"s"."ScoreWeek" / "s"."CountWeek"', 'AverageWeek')
			.addSelect('"s"."MaximumWeek"')
			.addSelect('"s"."GuessesWeek"')
			.addSelect('"s"."CountAll"')
			.addSelect('"s"."ScoreAll"')
			.addSelect('"s"."ScoreAll" / "s"."CountAll"', 'AverageAll')
			.addSelect('"s"."MaximumAll"')
			.addSelect('"s"."GuessesAll"')
			.orderBy('"s"."ScoreAll"', 'DESC', 'NULLS LAST')
			.addOrderBy('"s"."GuessesAll"', 'DESC', 'NULLS LAST');
	},
	name: 'StatisticsGlobal'
})
export class StatisticGlobal extends BaseEntity {
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

const statistic = 'Statistic';

function group(dataSource: DataSource) {
	return dataSource
		.createQueryBuilder()
		.from(StatisticChannel, 's')
		.select('"s"."UserId"')
		.addSelect('SUM("s"."CountWeek")', 'CountWeek')
		.addSelect('SUM("s"."ScoreWeek")', 'ScoreWeek')
		.addSelect('MAX("s"."MaximumWeek")', 'MaximumWeek')
		.addSelect('SUM("s"."GuessesWeek")', 'GuessesWeek')
		.addSelect('SUM("s"."CountAll")', 'CountAll')
		.addSelect('SUM("s"."ScoreAll")', 'ScoreAll')
		.addSelect('MAX("s"."MaximumAll")', 'MaximumAll')
		.addSelect('SUM("s"."GuessesAll")', 'GuessesAll')
		.groupBy('"s"."UserId"');
}
