import { DateTime } from 'luxon';
import {
  BaseEntity,
  DataSource,
  ViewColumn,
  ViewEntity
} from 'typeorm';
import { Word } from './word';

@ViewEntity({
  expression: (ds: DataSource) => ,
  name: 'Statistics'
})
export default class Statistic extends BaseEntity {
}

function getGuessesAll(datasource: DataSource) {
  return datasource
    .createQueryBuilder()
    .select('w.UserIdGuesser', 'UserId')
    .addSelect('COUNT(1)', 'GuessesAll')
    .from(Word, 'w')
    .where('w.UserIdGuesser IS NOT NULL')
    .groupBy('w.UserIdGuesser');
}

function getGuessesWeek(datasource: DataSource) {
  const weekStart = DateTime
    .now()
    .startOf('week')
    .toISODate();

  return datasource
    .createQueryBuilder()
    .select('w.UserIdGuesser', 'UserId')
    .addSelect('COUNT(1)', 'GuessesWeek')
    .from(Word, 'w')
    .where('w.UserIdGuesser IS NOT NULL')
    .andWhere(`w.Created >= '${weekStart}'`)
    .groupBy('w.UserIdGuesser');
}

function getScoreAll(datasource: DataSource) {
  return datasource
    .createQueryBuilder()
    .select('w.UserIdCreator', 'UserId')
    .addSelect('SUM(w.Score)', 'ScoreAll')
    .addSelect('AVG(w.Score)', 'ScoreAllAverage')
    .addSelect('MAX(w.Score)', 'ScoreAllMaximum')
    .from(Word, 'w')
    .where('w.UserIdGuesser IS NOT NULL')
    .groupBy('w.UserIdCreator');
}

function getScoreWeek(datasource: DataSource) {
  const weekStart = DateTime
    .now()
    .startOf('week')
    .toISODate();

  return datasource
    .createQueryBuilder()
    .select('w.UserIdCreator', 'UserId')
    .addSelect('SUM(w.Score)', 'ScoreWeek')
    .addSelect('AVG(w.Score)', 'ScoreWeekAverage')
    .addSelect('MAX(w.Score)', 'ScoreWeekMaximum')
    .from(Word, 'w')
    .where('w.UserIdGuesser IS NOT NULL')
    .andWhere(`w.Created >= '${weekStart}'`)
    .groupBy('w.UserIdCreator');
}
