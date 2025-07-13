import { DataSource } from 'typeorm';
import config from '~/config.js';
import logger from '~/logger.js';
import { StatisticChannel } from './statisticChannel.js';
import { StatisticGlobal } from './statisticGlobal.js';
import { Word } from './word.js';

export * from './statisticChannel.js';
export * from './statisticGlobal.js';
export * from './word.js';

export default new DataSource({
	logger,
	database: config.db.database,
	entities: [
		StatisticChannel,
		StatisticGlobal,
		Word
	],
	host: config.db.host,
	logging: 'all',
	migrations: ['src/migrations/**/*'],
	password: config.db.password,
	schema: config.db.schema,
	username: config.db.username,
	type: 'postgres'
});
