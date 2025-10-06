import resources from './errorMessages.json' with { type: 'json' };

type ResourceKey = keyof typeof resources;
type ResourceRecord = Record<ResourceKey, string>;

export default new Proxy(resources, {
	get(target, key: ResourceKey) {
		const values = target[key];

		return values[Math.floor(Math.random() * values.length)];
	}
}) as unknown as ResourceRecord;
