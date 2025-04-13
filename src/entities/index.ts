import { DataSource } from 'typeorm';
import { Word } from './word';

export * from './word';

export default new DataSource({
  database: 'local.sqlite3',
  entities: [
    Word
  ],
  migrations: ['src/migrations/**/*'],
  type: 'sqlite'
});
