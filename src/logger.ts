import type { Logger } from '@slack/bolt';
import { LogLevel } from '@slack/bolt';
import { createLogger, format, transports } from 'winston';
import config from '~/config.js';

export default {
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
	}
} as const satisfies Logger;

let label: string | undefined;

const logger = createLogger({
	format: format.combine(...getFormats()),
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
