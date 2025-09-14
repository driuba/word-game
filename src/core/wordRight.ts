import { WordRight } from '~/entities/index.js';

export function getWordRights(channelId?: string) {
	const options: { channelId?: string } = {};

	if (channelId) {
		options.channelId = channelId;
	}

	return WordRight.where(options);
}
