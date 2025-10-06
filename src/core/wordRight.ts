import type { EntityManager } from 'typeorm';
import { DateTime } from 'luxon';
import { In } from 'typeorm';
import client from '~/client.js';
import config from '~/config.js';
import dataSource, { Word, WordRight, WordRightUser } from '~/entities/index.js';
import { ApplicationError } from '~/utils/index.js';

export function getWordRights(channelId?: string) {
	const options: { channelId?: string } = {};

	if (channelId) {
		options.channelId = channelId;
	}

	return WordRight.where(options);
}

export function tryInsertWordRights(...channelIds: string[]) {
	if (!channelIds.length) {
		return Promise.resolve([]);
	}

	return dataSource.transaction((em) => runTryInsertWordRightsTransaction.call(em, channelIds));
}

export function updateWordRightUsers(...channelIds: string[]) {
	if (!channelIds.length) {
		return Promise.resolve();
	}

	if (!config.wg.wordRightTimeout) {
		throw new ApplicationError('Word right timeout configuration is required.', 'CONFIG_INVALID');
	}

	const to = DateTime
		.now()
		.minus(config.wg.wordRightTimeout);

	return dataSource.transaction((em) => runUpdateWordRightUsersTransaction.call(em, channelIds, to));
}

async function runTryInsertWordRightsTransaction(this: EntityManager, channelIds: string[]) {
	await WordRight.lock(this);

	const words = await Word.countWhereGrouped({ active: true, channelId: In(channelIds) }, this);
	const wordRights = await WordRight.countWhereGrouped({ channelId: In(channelIds) }, this);

	return await WordRight.insertMany(
		channelIds.flatMap((ci) => {
			const available =
				config.wg.wordCountMax -
				(words.get(ci) ?? 0) -
				(wordRights.get(ci) ?? 0);
			const results: { channelId: string }[] = [];

			for (let a = available; a > 0; a--) {
				results.push({ channelId: ci });
			}

			return results;
		}),
		this
	);
}

async function runUpdateWordRightUsersTransaction(this: EntityManager, channelIds: string[], to: DateTime<true>) {
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
		.then((rs) => new Map(rs));

	await WordRightUser.insertMany(
		rights
			.map((r) => {
				const userIdsCandidate = userIds.get(r.wordRight.channelId)?.difference(r.userIds);

				if (!userIdsCandidate?.size) {
					return null;
				}

				return {
					userId: [...userIdsCandidate][Math.floor(Math.random() * userIdsCandidate.size)],
					wordRightId: r.wordRight.id
				};
			})
			.filter((r) => !!r),
		this
	);
}
