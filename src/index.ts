import 'reflect-metadata';
import process from 'node:process';
import { App, LogLevel } from '@slack/bolt';
import { Settings } from 'luxon';
import config from '~/config.js';

config.assertValid();

Settings.defaultLocale = config.locale;
Settings.defaultZone = config.timezone;

const { default: dataSource } = await import('~/entities/index.js');
const { default: registerListeners } = await import('~/listeners/index.js');
const { default: logger } = await import('~/logger.js');
const { default: registerWorkers } = await import('~/workers/index.js');

globalThis.app = new App({
	appToken: config.slack.appToken,
	clientId: config.slack.clientId,
	clientSecret: config.slack.clientSecret,
	logLevel: config.nodeEnv === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
	logger,
	signingSecret: config.slack.signingSecret,
	socketMode: true,
	token: config.slack.botToken
});

registerListeners();

try {
	await dataSource.initialize();

	await app.start(config.port);

	const workers = registerWorkers();

	process.on('SIGINT', terminate);
	process.on('SIGTERM', terminate);

	app.logger.info('⚡️ Word game is running! ⚡️');

	function terminate() {
		Promise
			.all([
				app.stop(),
				...workers.map((w) => w.stop())
			])
			.then(() => {
				app.logger.info('🪦 Word game has been terminated! 🪦');

				process.exit(0);
			})
			.catch(() => {
				app.logger.warn('☠️ Word game has been killed! ☠️');

				process.exit(1);
			});
	}
} catch (error) {
	app.logger.error('Unable to start word game.', error);
}
