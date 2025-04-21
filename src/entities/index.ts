import { DataSource } from 'typeorm';
import { Statistic } from './statistic';
import { Word } from './word';

export * from './statistic';
export * from './word';

export default new DataSource({
  database: 'local.sqlite3',
  entities: [
    Statistic,
    Word
  ],
  migrations: ['src/migrations/**/*'],
  type: 'sqlite'
});
