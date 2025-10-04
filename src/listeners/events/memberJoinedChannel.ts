import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import { tryInsertWordRights } from '~/core/index.js';

export default async function (
	{
		context,
		logger,
		event: {
			channel: channelId,
			user: userId
		}
	}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'member_joined_channel'>
) {
	try {
		if (userId === context.botUserId) {
			await tryInsertWordRights(channelId);
		}
	} catch (error) {
		logger.error(error);
	}
}
