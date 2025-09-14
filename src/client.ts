import type { DurationLike } from 'luxon';
import { DateTime } from 'luxon';

const cacheMetadataKey = Symbol('cache');

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class {
	/* eslint-disable @typescript-eslint/no-empty-function */

	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/* eslint-enable @typescript-eslint/no-empty-function */

	@cache()
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

	@cache()
	static async getUserIds(channelId: string) {
		const userIds = new Set<string>();
		let cursor: string | undefined = undefined;

		do {
			const { members: users = [], response_metadata: { next_cursor: cursorNext } = {} } = await app.client.conversations.members({
				cursor,
				channel: channelId,
				limit: 200
			});

			for (const user of users) {
				if (!await this.getIsBot(user)) {
					userIds.add(user);
				}
			}

			cursor = cursorNext;
		} while (cursor);

		return userIds;
	}

	@cache({ hours: 1 })
	private static async getIsBot(userId: string) {
		const { user: { is_bot } = { is_bot: true } } = await app.client.users.info({ user: userId });

		return is_bot;
	}
}

type Cache<T> = Record<symbol, { expiration?: DateTime<true>; value: T } | undefined>;

// This is more of a proof of concept, actual caching is not currently required as the app doesn't seem hit API rate limits
function cache(duration: DurationLike = { seconds: 1 }) {
	return function <TArguments extends unknown[], TReturn>(
		target: object,
		propertyKey: string,
		descriptor: TypedPropertyDescriptor<(...args: TArguments) => Promise<TReturn>>
	) {
		if (!descriptor.value) {
			return;
		}

		Reflect.defineMetadata(cacheMetadataKey, {}, target, propertyKey);

		return {
			value: (function () {
				const method = descriptor.value;

				return async function (...args) {
					const cache = Reflect.getMetadata(cacheMetadataKey, target, propertyKey) as Cache<TReturn>;
					const key = Symbol.for(`client#${propertyKey}#${args.join('|')}`);

					cache[key] ??= {} as { value: TReturn };

					if (!cache[key].expiration || DateTime.now() > cache[key].expiration) {
						cache[key].value = await method.call(target, ...args);

						cache[key].expiration = DateTime
							.now()
							.plus(duration);
					}

					return cache[key].value;
				};
			})()
		} satisfies typeof descriptor;
	};
}
