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
			.map((v) => replace(messages.checkWordsActiveOther, v))
			.join('\n');
	},
	checkWordsActivePersonal(values: { expiration?: string; score: string; word: string }[]) {
		return values
			.map((v) => ({
				...v,
				expiration: v.expiration ?? 'su visam'
			}))
			.map((v) => replace(messages.checkWordsActivePersonal, v))
			.join('\n');
	},
	reportActive(values: { channelId: string; count: string; userId: string }[]) {
		return values
			.map((v) => replace(messages.reportActive, v))
			.join('\n');
	},
	reportPrivateActive(values: { channelId: string; expiration: string; score: string; word: string }[]) {
		return values
			.map((v) => replace(messages.reportPrivateActive, v))
			.join('\n');
	},
	reportPrivateRight(values: { channelId: string; count: string }[]) {
		return values
			.map((v) => replace(messages.reportPrivateRight, v))
			.join('\n');
	},
	reportRights(values: { channelId: string; global: string; personal: string; shared: string }[]) {
		return values
			.map((v) => replace(messages.reportRights, v))
			.join('\n');
	},
	setWordSuccess(values: { word: string }) {
		return replace(messages.setWordSuccess, values);
	},
	version(values: { version: string }) {
		return replace(messages.version, values);
	},
	wordExpired(values: { score: string; userId: string; word: string }) {
		return replace(messages.wordExpired, values);
	},
	wordGuessed(values: { score: string; userIdCreator: string; userIdGuesser: string; word: string }) {
		return replace(messages.wordGuessed, values);
	}
} satisfies Partial<Record<ResourceKey, (a: never) => string>>;

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
