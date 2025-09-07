import { WordRight } from '~/entities/wordRight.js';

export function getWordRights(channelId: string) {
	return WordRight.where({ channelId });
}
