import type { App } from '@slack/bolt';
import { tryExpireWords } from '~/core/index.js';
import { messages } from '~/resources/index.js';

export default async function handleWordExpiration(this: App) {
	for await (const word of tryExpireWords()) {
		await this.client.chat.postMessage({
			channel: word.channelId,
			text: messages.currentWordExpiredPublic({
				score: word.score.toFixed(),
				userId: word.userIdCreator,
				word: word.word
			})
		});
	}
}
