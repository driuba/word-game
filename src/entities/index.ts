import { DataSource } from 'typeorm';
import Channel from './channel';
import User from './user';
import Word from './word';

export default new DataSource({
  database: 'local.sqlite3',
  entities: [
    Channel,
    User,
    Word
  ],
  migrations: ['src/migrations/**/*'],
  type: 'sqlite'
});

export { default as Channel } from './channel';
export { default as User } from './user';
export { default as Word } from './word';
