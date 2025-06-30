import resources from './errorMessages.json' with { type: 'json' };

type ResourceKey = keyof typeof resources;
type ResourceRecord = Record<ResourceKey, string>;

export default Object
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
