import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getErrorMessage } from '~/utils/index.mjs';

export default async function handleError(
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
