import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { readme } from '~/resources/index.js';

export default function (
	{
		ack
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	return ack({
		response_type: 'ephemeral',
		text: readme
	});
}
