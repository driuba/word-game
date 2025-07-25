import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getErrorMessage } from '~/utils/index.js';

export default async function (
	{
		logger,
		next,
		respond
	}: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
	try {
		await next();
	} catch (error) {
		logger.error(error);

		await respond({
			response_type: 'ephemeral',
			text: getErrorMessage(error)
		});
	}
}
