import { DateTime } from 'luxon';

const cacheMetadataKey = Symbol('cache');

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class {
	/* eslint-disable @typescript-eslint/no-empty-function */

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/* eslint-enable @typescript-eslint/no-empty-function */

	@cache
	static async getChannelIds() {
		const channelIds = new Set<string>();
		let cursor: string | undefined = undefined;

		do {
			const { channels = [], response_metadata: { next_cursor: cursorNext } = {} } = await app.client.users.conversations({
				cursor,
				exclude_archived: true,
				limit: 200,
				types: 'public_channel,private_channel'
			});

			for (const channel of channels) {
				if (channel.id) {
					channelIds.add(channel.id);
				}
			}

			cursor = cursorNext;
		} while (cursor);

		return channelIds;
	}
}

interface Cache<T> {
	expiration?: DateTime<true>,
	value: T
}

type Method<T> = (...args: unknown[]) => Promise<T>;

// This is more of a proof of concept, actual caching is not currently required
function cache<T>(
	target: object,
	propertyKey: string,
	descriptor: TypedPropertyDescriptor<Method<T>>
) {
	if (!descriptor.value) {
		return;
	}

	Reflect.defineMetadata(cacheMetadataKey, {}, target, propertyKey);

	return {
		value: (function () {
			const method = descriptor.value;

			return async function (...args: unknown[]) {
				const cache = Reflect.getMetadata(cacheMetadataKey, target, propertyKey) as Cache<T>;

				if (!cache.expiration || DateTime.now() > cache.expiration) {
					cache.value = await method.call(target, ...args);

					cache.expiration = DateTime
						.now()
						.plus({ seconds: 1 });
				}

				return cache.value;
			};
		})()
	} satisfies TypedPropertyDescriptor<Method<T>>;
}
