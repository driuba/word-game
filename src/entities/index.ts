import { DataSource } from 'typeorm';
import { StatisticChannel } from './statisticChannel';
import { StatisticGlobal } from './statisticGlobal';
import { Word } from './word';

export * from './statisticChannel';
export * from './statisticGlobal';
export * from './word';

export default new DataSource({
	database: process.env.DB_DATABASE,
	entities: [
		StatisticChannel,
		StatisticGlobal,
		Word
	],
	host: process.env.DB_HOST,
	migrations: ['src/migrations/**/*'],
	password: process.env.DB_PASSWORD,
	schema: process.env.DB_SCHEMA,
	username: process.env.DB_USERNAME,
	type: 'postgres'
});
