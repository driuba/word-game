import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

const subtypes = new Set(['file_share', 'me_message', 'message_replied', 'thread_broadcast']);

export default async function handleMessageFilter(
	{
		message,
		next
	}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>
) {
	if (!message.subtype || subtypes.has(message.subtype)) {
		await next();
	}
}
