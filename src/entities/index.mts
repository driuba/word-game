import { DataSource } from 'typeorm';
import config from '~/config.mjs';
import { StatisticChannel } from './statisticChannel.mjs';
import { StatisticGlobal } from './statisticGlobal.mjs';
import { Word } from './word.mjs';

export * from './statisticChannel.mjs';
export * from './statisticGlobal.mjs';
export * from './word.mjs';

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
