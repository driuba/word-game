import { DateTime } from 'luxon';
import client from '~/client.js';
import config from '~/config.js';
import { getWordRights } from '~/core/index.js';
import { ApplicationError } from '~/utils/index.js';

export default async function (this: typeof app) {
	if (!config.wg.wordRightTimeout) {
		throw new ApplicationError('Word right timeout is required for word right user worker.', 'CONFIG_INVALID');
	}

	this.logger.info('Starting word right user update.');

	const errors: unknown[] = [];
	const count = 0;

	const to = DateTime
		.now()
		.minus(config.wg.wordRightTimeout);

	const channelIds = await client.getChannelIds();

	// TODO: move actual logic to core layer
	const rights = await getWordRights().then((wrs) => wrs
		.map((wr) => ({
			...wr.users.reduce<{ modified?: DateTime<true>; userIds: Set<string> }>(
				(a, wru) => {
					a.modified ??= wru.created;
					a.modified = DateTime.max(a.modified, wru.created);

					a.userIds.add(wru.userId);

					return a;
				},
				{ userIds: new Set<string>() }
			),
			right: wr
		}))
		.filter((wr) =>
			channelIds.has(wr.right.channelId) &&
			wr.modified &&
			wr.modified < to
		));

	for (const right of rights) {
		try {} catch (e) {
			errors.push(e);
		}
	}

	this.logger.info(`Finished word right user update. Updated ${count.toFixed()} word rights.`);
}
