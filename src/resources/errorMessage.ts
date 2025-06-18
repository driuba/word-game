import resources from './errorMessages.json';

type ResourceKey = keyof typeof resources;
type ResourceRecord = Record<ResourceKey, string>;

export default Object
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
	) satisfies ResourceRecord;

