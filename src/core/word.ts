/** TODO:
 * [ ] word guess and right setting
 * [ ] word expiration and right setting
 * [x] word set and right usage
 * [ ] Word guess and word right insert should be one transaction.
 * [ ] Word set and word right removal should be one transactions.
 *   Select locks should be enough for to solve race conditions.
 */

import { DateTime } from 'luxon';
import type { EntityManager } from 'typeorm';
import config from '~/config.js';
import type { WordActive } from '~/entities/index.js';
import dataSource, { assertWord, isWordActive, Word, WordRight } from '~/entities/index.js';
import { ApplicationError, wordGuessPattern, wordValidationPattern } from '~/utils/index.js';

const dateMax = DateTime.fromISO('9999-12-31T23:59:59.999') as DateTime<true>;

export async function getWordsActive(channelId?: string) {
	const filter = { active: true } as { channelId?: string, active: true };

	if (channelId) {
		filter.channelId = channelId;
	}

	return await Word.findBy(filter) as WordActive[];
}

export function getWordExpiration(word: Word) {
	assertWord(word);

	if (isWordActive(word)) {
		const expiration = DateTime.min(
			config.wg.wordTimeoutGlobal ? word.created.plus(config.wg.wordTimeoutGlobal) : dateMax,
			config.wg.wordTimeoutUsage ? (word.modified ?? word.created).plus(config.wg.wordTimeoutUsage) : dateMax
		);

		return expiration.equals(dateMax) ? null : expiration;
	}

	return word.expired ?? word.modified;
}

export async function* tryExpireWords() {
	const words = await Word.findBy({
		active: true
	});

	for (const word of words) {
		assertWord(word);

		await word.trySetExpired();

		if (!isWordActive(word)) {
			yield word;
		}
	}
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

		yield word as Word;
	}
}

export function trySetWord(channelId: string, userId: string, text: string) {
	text = text.trim();

	if (!text.match(wordValidationPattern)?.length) {
		throw new ApplicationError('Word must consist of only letters.', 'WORD_INVALID', { text });
	}

	return dataSource.transaction(em => runSetWordTransaction.call(em, channelId, userId, text));
}

async function runSetWordTransaction(this: EntityManager, channelId: string, userId: string, text: string) {
	await WordRight.lock(this);

	const rights = await WordRight.where(channelId, this);

	if (!rights.length) {
		throw new ApplicationError('No active word rights.', 'OPERATION_INVALID');
	}

	let right: WordRight | undefined;

	for (const rightCandidate of rights) {
		if (!rightCandidate.users.some(u => u.userId === userId)) {
			continue;
		}

		if (
			!right ||
			rightCandidate.users.length < right.users.length ||
			rightCandidate.users.length === right.users.length && rightCandidate.created < right.created
		) {
			right = rightCandidate;
		}
	}

	if (!right) {
		throw new ApplicationError('User has no right to set a word.', 'USER_INVALID');
	}

	await right.delete(this);

	const newWord = Word.create({
		channelId,
		userIdCreator: userId,
		word: text
	});

	await newWord.insert(this);

	assertWord(newWord);

	return newWord;
}
