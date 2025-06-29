/* eslint-disable @typescript-eslint/no-extraneous-class,@typescript-eslint/no-empty-function */
// noinspection JSUnusedLocalSymbols

import { Duration } from 'luxon';
import { ApplicationError } from '~/utils/index.js';
import process from 'node:process';

const lazyMetadataKey = Symbol('lazy');

abstract class Db {
	private constructor() {
	}

	@lazy
	static get database() {
		if (process.env.DB_DATABASE) {
			return process.env.DB_DATABASE;
		}

		throw new ApplicationError('DB_DATABASE is not defined.', 'CONFIG_INVALID');
	}

	@lazy
	static get host() {
		if (process.env.DB_HOST) {
			return process.env.DB_HOST;
		}

		throw new ApplicationError('DB_HOST is not defined.', 'CONFIG_INVALID');
	}

	@lazy
	static get password() {
		if (process.env.DB_PASSWORD) {
			return process.env.DB_PASSWORD;
		}

		throw new ApplicationError('DB_PASSWORD is not defined.', 'CONFIG_INVALID');
	}

	@lazy
	static get schema() {
		if (process.env.DB_SCHEMA) {
			return process.env.DB_SCHEMA;
		}

		throw new ApplicationError('DB_SCHEMA is not defined.', 'CONFIG_INVALID');
	}

	@lazy
	static get username() {
		if (process.env.DB_USERNAME) {
			return process.env.DB_USERNAME;
		}

		throw new ApplicationError('DB_USERNAME is not defined.', 'CONFIG_INVALID');
	}
}

abstract class Slack {
	private constructor() {
	}

	@lazy
	static get appToken() {
		if (process.env.SLACK_APP_TOKEN) {
			return process.env.SLACK_APP_TOKEN;
		}

		throw new ApplicationError('SLACK_APP_TOKEN is not defined.', 'CONFIG_INVALID');
	}

	@lazy
	static get botToken() {
		if (process.env.SLACK_BOT_TOKEN) {
			return process.env.SLACK_BOT_TOKEN;
		}

		throw new ApplicationError('SLACK_BOT_TOKEN is not defined.', 'CONFIG_INVALID');
	}

	@lazy
	static get clientId() {
		if (process.env.SLACK_CLIENT_ID) {
			return process.env.SLACK_CLIENT_ID;
		}

		throw new ApplicationError('SLACK_CLIENT_ID is not defined.', 'CONFIG_INVALID');
	}

	@lazy
	static get clientSecret() {
		if (process.env.SLACK_CLIENT_SECRET) {
			return process.env.SLACK_CLIENT_SECRET;
		}

		throw new ApplicationError('SLACK_CLIENT_SECRET is not defined.', 'CONFIG_INVALID');
	}

	@lazy
	static get signingSecret() {
		if (process.env.SLACK_SIGNING_SECRET) {
			return process.env.SLACK_SIGNING_SECRET;
		}

		throw new ApplicationError('SLACK_SIGNING_SECRET is not defined.', 'CONFIG_INVALID');
	}
}

abstract class Wg {
	private constructor() {
	}

	@lazy
	static get commandPrefix() {
		return process.env.WG_COMMAND_PREFIX ?? 'wg';
	}

	@lazy
	static get wordScoreMax() {
		if (!process.env.WG_WORD_SCORE_MAX) {
			return 1;
		}

		const value = parseInt(process.env.WG_WORD_SCORE_MAX, 10);

		if (value > 0) {
			return value;
		}

		throw new ApplicationError('WG_WORD_SCORE_MAX is invalid.', 'CONFIG_INVALID', { value: process.env.WG_WORD_SCORE_MAX });
	}

	@lazy
	static get wordTimeoutGlobal() {
		if (!process.env.WG_WORD_TIMEOUT_GLOBAL) {
			return null;
		}

		const value = Duration.fromISO(process.env.WG_WORD_TIMEOUT_GLOBAL);

		if (value.isValid) {
			return value;
		}

		throw new ApplicationError('WG_WORD_TIMEOUT_GLOBAL is invalid.', 'CONFIG_INVALID', { value: process.env.WG_WORD_TIMEOUT_GLOBAL });
	}

	@lazy
	static get wordTimeoutScore() {
		if (!process.env.WG_WORD_TIMEOUT_SCORE) {
			return null;
		}

		const value = Duration.fromISO(process.env.WG_WORD_TIMEOUT_SCORE);

		if (value.isValid) {
			return value;
		}

		throw new ApplicationError('WG_WORD_TIMEOUT_SCORE is invalid.', 'CONFIG_INVALID', { value: process.env.WG_WORD_TIMEOUT_SCORE });
	}

	@lazy
	static get wordTimeoutUsage() {
		if (!process.env.WG_WORD_TIMEOUT_USAGE) {
			return null;
		}

		const value = Duration.fromISO(process.env.WG_WORD_TIMEOUT_USAGE);

		if (value.isValid) {
			return value;
		}

		throw new ApplicationError('WG_WORD_TIMEOUT_USAGE is invalid.', 'CONFIG_INVALID', { value: process.env.WG_WORD_TIMEOUT_USAGE });
	}
}

function* getErrors(target: object) {
	const propertyNames = Object
		.getOwnPropertyNames(target)
		.filter(pn => Reflect.getOwnMetadata(lazyMetadataKey, target, pn));

	for (const propertyName of propertyNames) {
		try {
			Reflect.get(target, propertyName);
		} catch (error) {
			yield error;
		}
	}
}

function lazy<T>(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
	if (typeof descriptor.get === 'undefined') {
		return;
	}

	if (typeof descriptor.value !== 'undefined') {
		return;
	}

	Reflect.defineMetadata(lazyMetadataKey, true, target, propertyKey);

	return {
		get: (function () {
			let value: T;

			return function () {
				if (typeof descriptor.get !== 'undefined') {
					value ??= descriptor.get();
				}

				return value;
			};
		})()
	} satisfies TypedPropertyDescriptor<T>;
}

export default abstract class Config {
	static db = Db;
	static slack = Slack;
	static wg = Wg;

	private constructor() {
	}

	@lazy
	static get locale() {
		return process.env.LOCALE ?? 'lt-LT';
	}

	@lazy
	static get nodeEnv() {
		return process.env.NODE_ENV === 'production' ? 'production' : 'development';
	}

	@lazy
	static get port() {
		if (!process.env.PORT) {
			return 3000;
		}

		const value = parseInt(process.env.PORT);

		if (value > 0) {
			return value;
		}

		throw new ApplicationError('PORT is invalid.', 'CONFIG_INVALID', { value: process.env.PORT });
	}

	@lazy
	static get timezone() {
		return process.env.TIMEZONE ?? 'Europe/Vilnius';
	}

	static assertValid() {
		const errors = [
			...getErrors(this),
			...getErrors(Config.db),
			...getErrors(Config.slack),
			...getErrors(Config.wg)
		];

		if (errors.length) {
			throw new ApplicationError('Environment configuration is invalid.', 'CONFIG_INVALID', { errors });
		}
	}
}
