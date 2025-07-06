import type { App } from '@slack/bolt';
import config from '~/config.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: App) {
	if (!config.wg.reportingChatId) {
		throw new ApplicationError('Reporting chat ID is required for report worker.', 'CONFIG_INVALID');
	}

	this.logger.info('Stating report.');

	await this.client.chat.postMessage({
		channel: config.wg.reportingChatId,
		text: messages.report
	});

	this.logger.info('Finishing report.');
}
