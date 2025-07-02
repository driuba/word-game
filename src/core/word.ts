import { DateTime } from 'luxon';
import config from '~/config.js';
import { assertWord, isWordActive, Word } from '~/entities/index.js';
import { ApplicationError, wordGuessPattern, wordValidationPattern } from '~/utils/index.js';

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

export async function getLatestWord(channelId: string) {
	const word = await Word.findOne({
		order: {
			created: 'ASC'
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

		if (latestWord.expired && latestWord.userIdCreator === userId) {
			throw new ApplicationError('Word has already expired.', 'USER_INVALID', { expired: latestWord.expired });
		}

		if (latestWord.userIdGuesser !== userId) {
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
	const now = DateTime.now();

	const words = await Word.findBy({
		active: true
	});

	for (const word of words) {
		assertWord(word);

		if (
			config.wg.wordTimeoutGlobal && now.diff(word.created, 'days') > config.wg.wordTimeoutGlobal ||
			config.wg.wordTimeoutUsage && now.diff(word.modified ?? word.created, 'hours') > config.wg.wordTimeoutUsage
		) {
			word.expired = now;

			await word.update();
		}

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
		if (
			word.modified &&
			config.wg.wordTimeoutScore &&
			DateTime.now().diff(word.modified, 'seconds') < config.wg.wordTimeoutScore
		) {
			return null;
		}

		word.score += Math.min(score, config.wg.wordScoreMax);
	} else {
		word.userIdGuesser = userId;
	}

	await word.update();

	return word;
}
