import { IsNull } from 'typeorm';
import { Word } from '~/entities';
import { ApplicationError, wordGuessPattern, wordValidationPattern } from '~/utils';

export async function checkCurrentWord(channelId: string, userId: string, text?: string) {
	if (!text) {
		return;
	}

	const word = await getCurrentWord(channelId);

	if (!word) {
		return;
	}

	const pattern = wordGuessPattern(word.word);

	if (!text.match(pattern)?.length) {
		return;
	}

	if (word.userIdCreator === userId) {
		word.score++;
	} else {
		word.userIdGuesser = userId;
	}

	await word.save();

	return word;
}

export function getCurrentWord(channelId: string) {
	return Word.findOneBy({
		channelId,
		userIdGuesser: IsNull()
	});
}

export function getLatestWord(channelId: string) {
	return Word.findOne({
		order: {
			created: 'desc'
		},
		where: {
			channelId
		}
	});
}

export async function setWord(channelId: string, userId: string, text: string) {
	text = text.trim();

	if (!text.match(wordValidationPattern)?.length) {
		throw new ApplicationError('Word must consist of only letters.', 'WORD_INVALID', { text });
	}

	const latestWord = await getLatestWord(channelId);

	if (latestWord && latestWord.userIdGuesser !== userId) {
		throw new ApplicationError('Only the user that guessed the last word can set the next one.', 'USER_INVALID');
	}

	const newWord = Word.create({
		channelId,
		userIdCreator: userId,
		word: text
	});

	await newWord.save();

	return newWord;
}
