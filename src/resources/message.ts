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
	brag(values: { count: string; score: string; userId: string }) {
		return replace(messages.brag, values);
	},
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
	reportActive(values: { channelId: string; count: string; userId: string }[]) {
		return values
			.map(replace.bind(undefined, messages.reportActive))
			.join('\n');
	},
	reportPrivateActive(values: { channelId: string; expiration: string; score: string; word: string }[]) {
		return values
			.map(replace.bind(undefined, messages.reportPrivateActive))
			.join('\n');
	},
	reportPrivateRight(values: { channelId: string; count: string }[]) {
		return values
			.map(replace.bind(undefined, messages.reportPrivateRight))
			.join('\n');
	},
	reportRights(values: { channelId: string; count: string }[]) {
		return values
			.map(replace.bind(undefined, messages.reportRights))
			.join('\n');
	},
	setWordSuccess(values: { word: string }) {
		return replace(messages.setWordSuccess, values);
	},
	wordExpired(values: { score: string; userId: string; word: string }) {
		return replace(messages.wordExpired, values);
	},
	wordGuessed(values: { score: string; userIdCreator: string; userIdGuesser: string; word: string }) {
		return replace(messages.wordGuessed, values);
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
