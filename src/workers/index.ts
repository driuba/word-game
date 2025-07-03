import type { App } from '@slack/bolt';
import type { CronJobParams } from 'cron';
import { CronJob } from 'cron';
import config from '~/config.js';
import reportHandler from './report.js';
import wordExpirationHandler from './wordExpiration.js';

export default function register(app: App) {
	return [...getWorkers(app)];
}

type Params = CronJobParams<null, App>;

function createJob(
	context: App,
	cronTime: Pick<Params, 'cronTime'>['cronTime'],
	errorHandler: (e: unknown) => void,
	onTick: Pick<Params, 'onTick'>['onTick']
) {
	return CronJob.from({
		context,
		cronTime,
		errorHandler,
		onTick,
		start: true,
		timeZone: config.timezone,
		waitForCompletion: true
	});
}

function* getWorkers(app: App) {
	const errorHandler = handleError.bind(app);

	if (config.wg.reportingChatId) {
		app.logger.info('Starting report worker.');

		yield createJob(app, '0 0 9 * * 1-5', errorHandler, reportHandler);
	}

	if (config.wg.wordTimeoutGlobal || config.wg.wordTimeoutUsage) {
		app.logger.info('Starting word expiration worker.');

		yield createJob(app, '0 0 10-17 * * 1-5', errorHandler, wordExpirationHandler);
	}
}

function handleError(this: App, error: unknown) {
	this.logger.error(error);
}
