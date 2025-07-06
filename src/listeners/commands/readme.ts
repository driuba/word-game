import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { messages } from '~/resources/index.js';

export default async function (
	{
		ack
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack({
		response_type: 'ephemeral',
		text: messages.readme
	});
}
