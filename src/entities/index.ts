import { DataSource } from 'typeorm';
import config from '~/config.js';
import logger from '~/logger.js';
import { StatisticChannel } from './statisticChannel.js';
import { StatisticGlobal } from './statisticGlobal.js';
import { Word } from './word.js';
import { WordRight } from './wordRight.js';
import { WordRightUser } from './wordRightUser.js';

export * from './statisticChannel.js';
export * from './statisticGlobal.js';
export * from './word.js';
export * from './wordRight.js';
export * from './wordRightUser.js';

export default new DataSource({
	database: config.db.database,
	entities: [
		StatisticChannel,
		StatisticGlobal,
		Word,
		WordRight,
		WordRightUser
	],
	host: config.db.host,
	logger,
	logging: 'all',
	migrations: ['src/migrations/**/*'],
	password: config.db.password,
	port: config.db.port,
	schema: config.db.schema,
	type: 'postgres',
	username: config.db.username
});
