import type { EntityManager } from 'typeorm';
import { In } from 'typeorm';
import { DateTime } from 'luxon';
import client from '~/client.js';
import config from '~/config.js';
import dataSource, { WordRight, WordRightUser } from '~/entities/index.js';
import { ApplicationError } from '~/utils/index.js';

export function getWordRights(channelId?: string) {
	const options: { channelId?: string } = {};

	if (channelId) {
		options.channelId = channelId;
	}

	return WordRight.where(options);
}

export function updateWordRights(...channelIds: string[]) {
	if (!channelIds.length) {
		return;
	}

	if (!config.wg.wordRightTimeout) {
		throw new ApplicationError('Word right timeout configuration is required.', 'CONFIG_INVALID');
	}

	const to = DateTime
		.now()
		.minus(config.wg.wordRightTimeout);

	return dataSource.transaction((em) => runUpdateWordRightsTransaction.call(em, channelIds, to));
}

async function runUpdateWordRightsTransaction(this: EntityManager, channelIds: string[], to: DateTime<true>) {
	await WordRight.lock(this);

	const rights = await WordRight
		.where({ channelId: In(channelIds) })
		.then((wrs) => wrs
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
				wordRight: wr
			}))
			.filter((r) => r.modified && r.modified < to));

	channelIds = [...rights.reduce((a, r) => {
		a.add(r.wordRight.channelId);

		return a;
	}, new Set<string>())];

	const userIds = await Promise
		.all(channelIds.map<Promise<[string, Set<string>]>>(async (c) => [c, await client.getUserIds(c)]))
		.then((rs) => Object.fromEntries(rs));

	for (const right of rights) {
		const userIdsCandidate = userIds[right.wordRight.channelId].difference(right.userIds);

		if (!userIdsCandidate.size) {
			continue;
		}

		await WordRightUser.insertMany([{
			userId: [...userIdsCandidate][Math.floor(Math.random() * userIdsCandidate.size)],
			wordRightId: right.wordRight.id
		}], this);
	}
}
