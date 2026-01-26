import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import config from '~/config.js';
import { messages } from '~/resources/index.js';

export default function (
	{
		ack
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	return ack({
		response_type: 'ephemeral',
		text: messages.version({
			version: config.version
		})
	});
}
