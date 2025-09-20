import client from '~/client.js';
import config from '~/config.js';
import { updateWordRights } from '~/core/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: typeof app) {
	if (!config.wg.wordRightTimeout) {
		throw new ApplicationError('Word right timeout is required for word right user worker.', 'CONFIG_INVALID');
	}

	this.logger.info('Starting word right user update.');

	let error: unknown;

	try {
		await updateWordRights(...await client.getChannelIds());
	} catch (e) {
		error = e;
	}

	this.logger.info('Finished word right user update.');

	if (error) {
		throw new ApplicationError('Worker failed to update word right users.', { error });
	}
}
