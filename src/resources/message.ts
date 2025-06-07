import { textReplacement } from '~/utils';
import resources from './messages.json';
import readme from './readme.md';

type ResourceKey = keyof typeof resources;
type ResourceRecord = Record<ResourceKey, string>;

const messages = Object
	.keys(resources)
	.reduce(
		(a, k) => ({
			...a,
			get [k]() {
				const values = resources[k as ResourceKey];

				return values[Math.floor(Math.random() * values.length)];
			}
		}),
		{} as ResourceRecord
	);

function currentWordGuessed(values: { score: string, userIdGuesser: string, userIdCreator: string, word: string }) {
	return replace(messages.currentWordGuessed, values);
}

function currentWordHolder(values: { userId: string }) {
	return replace(messages.currentWordHolder, values);
}

function currentWordSetter(values: { userId: string }) {
	return replace(messages.currentWordSetter, values);
}

function currentWordStatusPrivate(values: { score: string, word: string }) {
	return replace(messages.currentWordStatusPrivate, values);
}

function currentWordStatusPublic(values: { score: string, userId: string }) {
	return replace(messages.currentWordStatusPublic, values);
}

function setWordSuccess(values: { word: string }) {
	return replace(messages.setWordSuccess, values);
}

function replace(resource: string, values: Record<string, string>) {
	return resource.replace(
		textReplacement,
		(_, key) => values[key as keyof typeof values]
	);
}

export default {
	...messages,
	readme,
	currentWordGuessed,
	currentWordHolder,
	currentWordSetter,
	currentWordStatusPrivate,
	currentWordStatusPublic,
	setWordSuccess
};
