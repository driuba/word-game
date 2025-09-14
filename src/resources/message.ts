import { textReplacement } from '~/utils/index.js';
import resources from './messages.json' with { type: 'json' };

type ResourceKey = keyof typeof resources;
type ResourceRecord = Record<ResourceKey, string>;

const messages = new Proxy(resources, {
	get(target, key: ResourceKey) {
		const values = target[key];

		return values[Math.floor(Math.random() * values.length)];
	}
}) as unknown as ResourceRecord;

const overrides = {
	checkWordRights(values: { personal: string; shared: string; total: string }) {
		return replace(messages.checkWordRights, values);
	},
	checkWordsActiveOther(values: { count: string; userId: string }[]) {
		return values
			.map(replace.bind(undefined, messages.checkWordsActiveOther))
			.join('\n');
	},
	checkWordsActivePersonal(values: { expiration?: string; score: string; word: string }[]) {
		return values
			.map((v) => ({
				...v,
				expiration: v.expiration ?? 'su visam'
			}))
			.map(replace.bind(undefined, messages.checkWordsActivePersonal))
			.join('\n');
	},
	currentWordExpiredPrivate(values: { expired: string; score: string; userId: string; word: string }) {
		return replace(messages.currentWordExpiredPrivate, values);
	},
	currentWordExpiredPrivateMe(values: { expired: string; score: string; word: string }) {
		return replace(messages.currentWordExpiredPrivateMe, values);
	},
	currentWordExpiredPublic(values: { score: string; userId: string; word: string }) {
		return replace(messages.currentWordExpiredPublic, values);
	},
	currentWordGuessed(values: { score: string; userIdGuesser: string; userIdCreator: string; word: string }) {
		return replace(messages.currentWordGuessed, values);
	},
	currentWordHolder(values: { userId: string }) {
		return replace(messages.currentWordHolder, values);
	},
	currentWordSetter(values: { userId: string }) {
		return replace(messages.currentWordSetter, values);
	},
	currentWordStatusPrivate(values: { expiration?: string; score: string; word: string }) {
		return replace(
			messages.currentWordStatusPrivate,
			{
				...values,
				expiration: values.expiration ?? 'amžinai'
			}
		);
	},
	currentWordStatusPublic(values: { count: string; score: string; userId: string }) {
		return replace(messages.currentWordStatusPublic, values);
	},
	reportActive(values: { channelId: string; count: string; userId: string }[]) {
		return values
			.map(replace.bind(undefined, messages.reportActive))
			.join('\n');
	},
	reportRights(values: { channelId: string; count: string }[]) {
		return values
			.map(replace.bind(undefined, messages.reportRights))
			.join('\n');
	},
	reportPrivate(values: { channelId: string; expiration: string; score: string; word: string }) {
		return replace(messages.reportPrivate, values);
	},
	setWordSuccess(values: { word: string }) {
		return replace(messages.setWordSuccess, values);
	}
} satisfies Partial<Record<ResourceKey, (a: never) => string>>;

// TODO: review usages, cleanup resources, update naming
export default new Proxy(messages, {
	get(target, key: ResourceKey) {
		if (key in overrides) {
			return overrides[key as keyof typeof overrides];
		}

		return target[key];
	}
}) as ResourceRecord & typeof overrides;

function replace(resource: string, values: Record<string, string>) {
	return resource.replace(
		textReplacement,
		(_, key) => values[key as keyof typeof values]
	);
}
