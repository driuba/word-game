/** TODO:
 * [ ] word guess and right setting
 * [x] word expiration and right setting
 * [x] word set and right usage
 * [ ] Word guess and word right insert should be one transaction.
 * [x] Word expiration and word right insert should be one transaction.
 * [x] Word set and word right removal should be one transaction.
 * [ ] Select locks should be enough to solve race conditions.
 */

import { DateTime } from 'luxon';
import type { EntityManager } from 'typeorm';
import client from '~/client.js';
import config from '~/config.js';
import type { WordActive, WordInactive } from '~/entities/index.js';
import dataSource, { isWordInactive, Word, WordRight, WordRightUser } from '~/entities/index.js';
import { ApplicationError, wordGuessPattern, wordValidationPattern } from '~/utils/index.js';

const dateMax = DateTime.fromISO('9999-12-31T23:59:59.999') as DateTime<true>;

export async function* expireWords() {
	const errors: unknown[] = [];

	const words = await getWordsActive();

	for (const word of words) {
		try {
			await dataSource.transaction(em => runExpireWordTransaction.call(em, word));

			if (isWordInactive(word)) {
				yield word;
			}
		} catch (error) {
			errors.push(error);
		}
	}

	if (errors.length) {
		throw new ApplicationError('Failed to expire some words.', { errors });
	}
}

export async function getWordsActive(channelId?: string) {
	const filter: { active: true, channelId?: string } = { active: true };

	if (channelId) {
		filter.channelId = channelId;
	}

	return await Word.where(filter) as WordActive[];
}

export function getWordExpiration(word: Word) {
	if (isWordInactive(word)) {
		return word.expired ?? word.modified;
	}

	const expiration = DateTime.min(
		config.wg.wordTimeoutGlobal ? word.created.plus(config.wg.wordTimeoutGlobal) : dateMax,
		config.wg.wordTimeoutUsage ? (word.modified ?? word.created).plus(config.wg.wordTimeoutUsage) : dateMax
	);

	return expiration.equals(dateMax) ? null : expiration;
}

export function setWord(channelId: string, userId: string, text: string) {
	text = text.trim();

	if (!text.match(wordValidationPattern)?.length) {
		throw new ApplicationError('Word must consist of only letters.', 'WORD_INVALID', { text });
	}

	return dataSource.transaction(em => runSetWordTransaction.call(em, channelId, userId, text));
}

export async function* tryScoreOrGuessWords(channelId: string, userId: string, text?: string) {
	if (!text) {
		return null;
	}

	const wordsActive = await getWordsActive(channelId);

	for (const word of wordsActive) {
		const pattern = wordGuessPattern(word.word);

		const score = text.match(pattern)?.length ?? 0;

		if (!score) {
			continue;
		}

		if (word.userIdCreator === userId) {
			await word.tryAddScore(
				Math.min(score, config.wg.wordScoreMax)
			);
		} else {
			await word.trySetUserIdGuesser(userId);
		}

		yield word;
	}
}

async function runExpireWordTransaction(this: EntityManager, word: Word) {
	await WordRight.lock(this);

	// TODO: remove after testing synchronization
	await new Promise<void>(r => setTimeout(() => {
		r();
	}, 30_000));

	await word.trySetExpired(this);

	if (isWordInactive(word)) {
		const userIds = await client.getUserIds(word.channelId);

		userIds.delete(word.userIdCreator);

		await runInsertWordRightsTransaction.call(this, word, [...userIds]);
	}
}

async function runInsertWordRightsTransaction(this: EntityManager, word: WordInactive, userIds: string[]) {
	const available =
		config.wg.wordCountMax -
		await Word.countWhere({ active: true, channelId: word.channelId }, this) -
		await WordRight.countWhere({ channelId: word.channelId }, this);

	for (let a = available; a > 0; a--) {
		const right = WordRight.create({
			channelId: word.channelId
		});

		await right.insert(this);

		await WordRightUser.insertMany(
			userIds.map(ui => WordRightUser.create({
				userId: ui,
				wordRightId: right.id
			})),
			this
		);
	}
}

async function runSetWordTransaction(this: EntityManager, channelId: string, userId: string, text: string) {
	await WordRight.lock(this);

	// TODO: remove after testing synchronization
	await new Promise<void>(r => setTimeout(() => {
		r();
	}, 30_000));

	const rights = await WordRight.where({ channelId }, this);

	if (!rights.length) {
		throw new ApplicationError('No active word rights.', 'OPERATION_INVALID');
	}

	let right: WordRight | undefined;

	for (const candidate of rights) {
		if (
			candidate.users.length &&
			!candidate.users.some(u => u.userId === userId)
		) {
			continue;
		}

		if (
			!right ||
			candidate.users.length < right.users.length ||
			candidate.users.length === right.users.length && candidate.created < right.created
		) {
			right = candidate;
		}
	}

	if (!right) {
		throw new ApplicationError('User has no right to set a word.', 'USER_INVALID');
	}

	await right.delete(this);

	const word = Word.create({
		channelId,
		userIdCreator: userId,
		word: text
	});

	await word.insert(this);

	return word as WordActive;
}
