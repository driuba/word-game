import 'reflect-metadata';
import { App, LogLevel } from '@slack/bolt';
import config from '~/config.js';
import dataSource from '~/entities/index.js';
import registerListeners from '~/listeners/index.js';

const app = new App({
	appToken: config.slack.appToken,
	clientId: config.slack.clientId,
	clientSecret: config.slack.clientSecret,
	logLevel: config.nodeEnv === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
	signingSecret: config.slack.signingSecret,
	socketMode: true,
	token: config.slack.botToken
});

registerListeners(app);

try {
	await dataSource.initialize();

	await app.start(config.port);

	app.logger.info('⚡️ Word game is running! ⚡️');
} catch (error) {
	app.logger.error('Unable to start word game.', error);
}
