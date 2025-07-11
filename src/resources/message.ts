import { textReplacement } from '~/utils/index.js';
import resources from './messages.json' with { type: 'json' };
import readme from './readme.md';

type ResourceKey = keyof typeof resources;
type ResourceRecord = Record<ResourceKey, string>;

const messages = Object
	.keys(resources)
	.reduce(
		(a, k) => {
			Object.defineProperty(a, k, {
				enumerable: true,
				get() {
					const values = resources[k as ResourceKey];

					return values[Math.floor(Math.random() * values.length)];
				}
			});

			return a;
		},
		{} as ResourceRecord
	) satisfies ResourceRecord;

function currentWordExpiredPrivate(values: { expired: string, score: string, userId: string, word: string }) {
	return replace(messages.currentWordExpiredPrivate, values);
}

function currentWordExpiredPrivateMe(values: { expired: string, score: string, word: string }) {
	return replace(messages.currentWordExpiredPrivateMe, values);
}

function currentWordExpiredPublic(values: { score: string, userId: string, word: string }) {
	return replace(messages.currentWordExpiredPublic, values);
}

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
	currentWordExpiredPrivate,
	currentWordExpiredPrivateMe,
	currentWordExpiredPublic,
	currentWordGuessed,
	currentWordHolder,
	currentWordSetter,
	currentWordStatusPrivate,
	currentWordStatusPublic,
	setWordSuccess
};
