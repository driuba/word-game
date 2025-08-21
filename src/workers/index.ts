import type { CronJobParams, CronOnCompleteCommand } from 'cron';
import { CronJob } from 'cron';
import config from '~/config.js';
import reportHandler from './report.js';
import reportPrivateHandler from '~/workers/reportPrivate.js';
import wordExpirationHandler from './wordExpiration.js';

export default function () {
	return Array.from(getWorkers());
}

type Params = CronJobParams<CronOnCompleteCommand, typeof app>;

function createJob(
	context: typeof app,
	cronTime: Params['cronTime'],
	errorHandler: (e: unknown) => void,
	onComplete: Params['onComplete'],
	onTick: Params['onTick']
) {
	return CronJob.from({
		context,
		cronTime,
		errorHandler,
		onComplete,
		onTick,
		start: true,
		timeZone: config.timezone,
		waitForCompletion: true
	});
}

function* getWorkers() {
	const errorHandler = handleError.bind(app);

	if (config.wg.reportingChatId) {
		app.logger.info('Starting report worker.');

		yield createJob(
			app,
			'0 0 9 * * 1-5',
			errorHandler,
			() => {
				app.logger.info('Stopping report worker.');
			},
			reportHandler
		);
	}

	app.logger.info('Starting personal report worker.');

	yield createJob(
		app,
		'0 0 9 * * 1-5',
		errorHandler,
		() => {
			app.logger.info('Stopping personal report worker.');
		},
		reportPrivateHandler
	);

	if (config.wg.wordTimeoutGlobal || config.wg.wordTimeoutUsage) {
		app.logger.info('Starting word expiration worker.');

		yield createJob(
			app,
			'0 0 10-17 * * 1-5',
			errorHandler,
			() => {
				app.logger.info('Stopping word expiration worker.');
			},
			wordExpirationHandler
		);
	}
}

function handleError(this: typeof app, error: unknown) {
	this.logger.error(error);
}
