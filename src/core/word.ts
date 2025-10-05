import type { EntityManager } from 'typeorm';
import { DateTime } from 'luxon';
import client from '~/client.js';
import config from '~/config.js';
import dataSource, { Word, WordRight, WordRightUser, isWordActive, isWordInactive } from '~/entities/index.js';
import { ApplicationError, wordGuessPattern, wordValidationPattern } from '~/utils/index.js';

const dateMax = DateTime.fromISO('9999-12-31T23:59:59.999') as DateTime<true>;

export async function* expireWords() {
	const errors: unknown[] = [];

	const channelIds = await client.getChannelIds();
	const words = await getWordsActive();

	for (const word of words) {
		try {
			await dataSource.transaction((em) => runExpireWordTransaction.call(em, channelIds, word));

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

export function getWordsActive(channelId?: string, userIdCreator?: string) {
	const filter: { active: true; channelId?: string; userIdCreator?: string } = { active: true };

	if (channelId) {
		filter.channelId = channelId;
	}

	if (userIdCreator) {
		filter.userIdCreator = userIdCreator;
	}

	return Word.where(filter);
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

	return dataSource.transaction((em) => runSetWordTransaction.call(em, channelId, text, userId));
}

export async function* tryScoreOrGuessWords(channelId: string, userId: string, text?: string) {
	if (!text) {
		return null;
	}

	for (const word of await getWordsActive(channelId)) {
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
			await dataSource.transaction((em) => runGuessWordTransaction.call(em, userId, word));
		}

		yield word;
	}
}

async function runExpireWordTransaction(this: EntityManager, channelIds: Set<string>, word: Word) {
	await WordRight.lock(this);

	await word.trySetExpired(this);

	if (isWordActive(word)) {
		return;
	}

	if (!channelIds.has(word.channelId)) {
		return;
	}

	const userIds = await client.getUserIds(word.channelId);

	userIds.delete(word.userIdCreator);

	await tryInsertWordRight(this, [...userIds], word);
}

async function runGuessWordTransaction(this: EntityManager, userId: string, word: Word) {
	await WordRight.lock(this);

	await word.trySetUserIdGuesser(userId);

	await tryInsertWordRight(this, [userId], word);
}

async function runSetWordTransaction(this: EntityManager, channelId: string, text: string, userId: string) {
	await WordRight.lock(this);

	const rights = await WordRight.where({ channelId }, this);

	if (!rights.length) {
		throw new ApplicationError('No active word rights.', 'OPERATION_INVALID');
	}

	let right: WordRight | undefined = undefined;

	for (const candidate of rights) {
		if (
			candidate.users.length &&
			!candidate.users.some((u) => u.userId === userId)
		) {
			continue;
		}

		if (
			!right ||
			(candidate.users.length === 1 && right.users.length === 0) ||
			candidate.users.length < right.users.length ||
			(candidate.users.length === right.users.length && candidate.created < right.created)
		) {
			right = candidate;
		}
	}

	if (!right) {
		throw new ApplicationError('User has no right to set a word.', 'USER_INVALID');
	}

	await right.delete(this);

	return await Word.insertOne({
		channelId,
		userIdCreator: userId,
		word: text
	});
}

async function tryInsertWordRight(entityManager: EntityManager, userIds: string[], word: Word) {
	const available =
		config.wg.wordCountMax -
		await Word.countWhere({ active: true, channelId: word.channelId }, entityManager) -
		await WordRight.countWhere({ channelId: word.channelId }, entityManager);

	if (available > 0) {
		const right = await WordRight.insertOne({ channelId: word.channelId }, entityManager);

		await WordRightUser.insertMany(
			userIds.map((ui) => ({
				userId: ui,
				wordRightId: right.id
			})),
			entityManager
		);

		return true;
	}

	return false;
}
