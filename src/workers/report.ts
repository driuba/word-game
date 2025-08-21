import config from '~/config.js';
import { getWordsActive } from '~/core/index.js';
import { messages } from '~/resources/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: typeof app) {
	if (!config.wg.reportingChatId) {
		throw new ApplicationError('Reporting chat ID is required for report worker.', 'CONFIG_INVALID');
	}

	this.logger.info('Stating report.');

	const words = await getWordsActive();

	await this.client.chat.postMessage({
		channel: config.wg.reportingChatId,
		text: messages.report(
			words.map(w => ({
				channelId: w.channelId,
				userId: w.userIdCreator
			}))
		)
	});

	this.logger.info('Finishing report.');
}
