import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import type { GenericMessageEvent } from '@slack/types';
import client from '~/client.js';

const subtypes = new Set(['file_share', 'me_message', 'message_replied', 'thread_broadcast']);

export default async function (
	{
		message,
		next
	}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>
) {
	const {
		bot_id: botId,
		user: userId
	} = message as GenericMessageEvent;

	if (message.subtype && !subtypes.has(message.subtype)) {
		return;
	}

	if (botId || await client.getIsBot(userId)) {
		return;
	}

	await next();
}
