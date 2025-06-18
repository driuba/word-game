import { DataSource } from 'typeorm';
import config from '~/config';
import { StatisticChannel } from './statisticChannel';
import { StatisticGlobal } from './statisticGlobal';
import { Word } from './word';

export * from './statisticChannel';
export * from './statisticGlobal';
export * from './word';

export default new DataSource({
	database: config.db.database,
	entities: [
		StatisticChannel,
		StatisticGlobal,
		Word
	],
	host: config.db.host,
	migrations: ['src/migrations/**/*'],
	password: config.db.password,
	schema: config.db.schema,
	username: config.db.username,
	type: 'postgres'
});
