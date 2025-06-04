import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { messages } from '~/resources';
import { getErrorMessage } from '~/utils';

export default async function handleReadme(
	{
		ack,
		logger,
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	try {
		await ack();

		await respond({
			response_type: 'ephemeral',
			text: messages.readme
		});
	} catch (error) {
		await respond({
			response_type: 'ephemeral',
			text: getErrorMessage(error)
		});

		logger.error(error);
	}
}
