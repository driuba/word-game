import process from 'node:process';
import { Duration } from 'luxon';
import { ApplicationError } from '~/utils/index.js';

const lazyMetadataKey = Symbol('lazy');

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
abstract class Db {
	/* eslint-disable @typescript-eslint/no-empty-function */

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/* eslint-enable @typescript-eslint/no-empty-function */

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
	static get port() {
		if (!process.env.DB_PORT) {
			return 5432;
		}

		const value = parseInt(process.env.DB_PORT);

		if (value > 0) {
			return value;
		}

		throw new ApplicationError('DB_PORT is invalid.', 'CONFIG_INVALID', { value: process.env.DB_PORT });
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

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
abstract class Slack {
	/* eslint-disable @typescript-eslint/no-empty-function */

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/* eslint-enable @typescript-eslint/no-empty-function */

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

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
abstract class Wg {
	/* eslint-disable @typescript-eslint/no-empty-function */

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/* eslint-enable @typescript-eslint/no-empty-function */

	@lazy
	static get commandPrefix() {
		return process.env.WG_COMMAND_PREFIX ?? 'wg';
	}

	@lazy
	static get reportingChatId() {
		return process.env.WG_REPORTING_CHAT_ID ?? null;
	}

	@lazy
	static get wordCountMax() {
		if (!process.env.WG_WORD_COUNT_MAX) {
			return 1;
		}

		const value = parseInt(process.env.WG_WORD_COUNT_MAX);

		if (value > 0) {
			return value;
		}

		throw new ApplicationError('WG_WORD_COUNT_MAX is invalid.', 'CONFIG_INVALID', { value: process.env.WG_WORD_COUNT_MAX });
	}

	@lazy
	static get wordRightTimeout() {
		if (!process.env.WG_WORD_RIGHT_TIMEOUT) {
			return null;
		}

		const value = Duration.fromISO(process.env.WG_WORD_RIGHT_TIMEOUT);

		if (value.isValid) {
			return value;
		}

		throw new ApplicationError('WG_WORD_RIGHT_TIMEOUT is invalid.', 'CONFIG_INVALID', { value: process.env.WG_WORD_RIGHT_TIMEOUT });
	}

	@lazy
	static get wordScoreMax() {
		if (!process.env.WG_WORD_SCORE_MAX) {
			return 1;
		}

		const value = parseInt(process.env.WG_WORD_SCORE_MAX);

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
		.filter((pn) => Reflect.getOwnMetadata(lazyMetadataKey, target, pn));

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
		enumerable: true,
		get: (function () {
			const get = descriptor.get;
			let value: T | undefined;

			return function () {
				return value ??= get();
			};
		})()
	} satisfies typeof descriptor;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class {
	static db = Db;
	static slack = Slack;
	static wg = Wg;

	/* eslint-disable @typescript-eslint/no-empty-function */

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/* eslint-enable @typescript-eslint/no-empty-function */

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
		return process.env.TZ ?? 'Europe/Vilnius';
	}

	@lazy
	static get version() {
		return process.env.VERSION ?? '0.0.0';
	}

	static assertValid() {
		const errors = [
			...getErrors(this),
			...getErrors(this.db),
			...getErrors(this.slack),
			...getErrors(this.wg)
		];

		if (errors.length) {
			throw new ApplicationError('Environment configuration is invalid.', 'CONFIG_INVALID', { errors });
		}
	}
}
