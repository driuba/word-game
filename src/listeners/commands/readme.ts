import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { readme } from '~/resources/index.js';

export default async function (
	{
		ack
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	await ack({
		response_type: 'ephemeral',
		text: readme
	});
}
