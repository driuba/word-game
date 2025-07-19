import { DateTime } from 'luxon';
import config from '~/config.js';
import { assertWord, assertWords, isWordActive, Word } from '~/entities/index.js';
import { ApplicationError, wordGuessPattern, wordValidationPattern } from '~/utils/index.js';

const dateMax = DateTime.fromISO('9999-12-31T23:59:59.999');

// TODO: rename methods -- reorder specifiers
export async function getActiveWords() {
	const words = await Word.findBy({ active: true });

	assertWords(words);

	return words.filter(isWordActive);
}

export async function getCurrentWord(channelId: string) {
	const word = await Word.findOneBy({
		channelId,
		active: true
	});

	if (word) {
		assertWord(word);
	}

	return word;
}

export function getWordExpiration(word: Word) {
	assertWord(word);

	if (isWordActive(word)) {
		const expiration = DateTime.min(
			config.wg.wordTimeoutGlobal ? word.created.plus(config.wg.wordTimeoutGlobal) : dateMax,
			config.wg.wordTimeoutUsage ? (word.modified ?? word.created).plus(config.wg.wordTimeoutUsage) : dateMax
		);

		if (expiration.isValid) {
			return expiration.equals(dateMax) ? null : expiration;
		}

		return null;
	}

	return word.expired ?? word.modified;
}

export async function getLatestWord(channelId: string) {
	const word = await Word.findOne({
		order: {
			created: 'DESC'
		},
		where: {
			channelId
		}
	});

	if (word) {
		assertWord(word);
	}

	return word;
}

export async function setWord(channelId: string, userId: string, text: string) {
	text = text.trim();

	if (!text.match(wordValidationPattern)?.length) {
		throw new ApplicationError('Word must consist of only letters.', 'WORD_INVALID', { text });
	}

	const latestWord = await getLatestWord(channelId);

	if (latestWord) {
		if (isWordActive(latestWord)) {
			throw new ApplicationError('Word is already set.', 'OPERATION_INVALID');
		}

		if (latestWord.expired) {
			if (latestWord.userIdCreator === userId) {
				throw new ApplicationError('Word has already expired.', 'USER_INVALID', { expired: latestWord.expired });
			}
		} else if (latestWord.userIdGuesser !== userId) {
			throw new ApplicationError('Only the user that guessed the last word can set the next one.', 'USER_INVALID');
		}
	}

	const newWord = Word.create({
		channelId,
		userIdCreator: userId,
		word: text
	});

	await newWord.insert();

	assertWord(newWord);

	return newWord;
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

export async function tryScoreOrGuessWord(channelId: string, userId: string, text?: string) {
	if (!text) {
		return null;
	}

	const word = await getCurrentWord(channelId);

	if (!word) {
		return null;
	}

	const pattern = wordGuessPattern(word.word);

	const score = text.match(pattern)?.length ?? 0;

	if (!score) {
		return null;
	}

	if (word.userIdCreator === userId) {
		await word.tryAddScore(
			Math.min(score, config.wg.wordScoreMax)
		);
	} else {
		await word.trySetUserIdGuesser(userId);
	}

	return word;
}
