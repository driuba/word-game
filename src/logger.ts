import type { Logger as LoggerSlack } from '@slack/bolt';
import type { Logger as LoggerTypeorm } from 'typeorm';
import { LogLevel } from '@slack/bolt';
import { createLogger, format, transports } from 'winston';
import config from '~/config.js';

// noinspection JSUnusedGlobalSymbols
export default {
	// Slack
	debug(...messages) {
		for (const message of messages) {
			logger.debug(message);
		}
	},
	error(...messages) {
		for (const message of messages) {
			logger.error(message);
		}
	},
	getLevel() {
		return logger.level as LogLevel;
	},
	info(...messages) {
		for (const message of messages) {
			logger.info(message);
		}
	},
	setLevel(level: LogLevel) {
		logger.level = level;
	},
	setName(name: string) {
		label = name;
	},
	warn(...messages) {
		for (const message of messages) {
			logger.warn(message);
		}
	},
	// TypeORM
	// eslint-disable-next-line sort-keys
	log(level, message) {
		switch (level) {
			case 'info': {
				logger.info(message);

				break;
			}
			case 'log': {
				logger.debug(message);

				break;
			}
			case 'warn': {
				logger.warn(message);

				break;
			}
			default: {
				break;
			}
		}
	},
	logMigration(message) {
		logger.info(message);
	},
	logQuery(query) {
		logger.debug(query);
	},
	logQueryError(error) {
		logger.error(error);
	},
	logQuerySlow() {
		// ignore
	},
	logSchemaBuild(message) {
		logger.debug(message);
	}
} as const satisfies LoggerSlack & LoggerTypeorm;

let label: string | undefined;

const logger = createLogger({
	format: format.combine(...getFormats()),
	level: config.nodeEnv === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
	levels: Object.fromEntries(
		Object
			.values(LogLevel)
			.map((l, i) => [l, i])
	),
	transports: [
		new transports.Console()
	]
});

function* getFormats() {
	yield format.errors({ stack: true });

	yield format.label({
		get label() {
			return label;
		}
	});

	if (config.nodeEnv === 'production') {
		yield format.timestamp();

		yield format.json();
	} else {
		yield format.colorize();

		yield format.simple();
	}
}
