import client from '~/client.js';
import config from '~/config.js';
import { updateWordRightUsers } from '~/core/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: typeof app) {
	if (!config.wg.wordRightTimeout) {
		throw new ApplicationError('Word right timeout is required for word right user worker.', 'CONFIG_INVALID');
	}

	this.logger.info('Starting word right user update.');

	try {
		await updateWordRightUsers(...await client.getChannelIds());
	} catch (error) {
		throw new ApplicationError('Worker failed to update word right users.', { error });
	} finally {
		this.logger.info('Finished word right user update.');
	}
}
