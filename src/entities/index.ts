import { DataSource } from 'typeorm';
import { Statistic } from './statistic';
import { Word } from './word';

export * from './statistic';
export * from './word';

export default new DataSource({
	database: process.env.DB_DATABASE,
	entities: [
		Statistic,
		Word
	],
	host: process.env.DB_HOST,
	migrations: ['src/migrations/**/*'],
	password: process.env.DB_PASSWORD,
	schema: process.env.DB_SCHEMA,
	username: process.env.DB_USERNAME,
	type: 'postgres'
});
