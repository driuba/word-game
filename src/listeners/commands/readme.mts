import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { messages } from '~/resources/index.mjs';

export default async function handleReadme(
	{
		ack
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack({
		response_type: 'ephemeral',
		text: messages.readme
	});
}
