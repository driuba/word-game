import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';

export default async function filterChannel(
  {
    ack,
    client,
    next,
    payload: {
      channel_id: channelId
    }
  }: AllMiddlewareArgs & SlackCommandMiddlewareArgs
) {
  const { channels } = await client.users.conversations({
    exclude_archived: true,
    types: 'public_channel,private_channel'
  });

  if (channels?.some(c => c.id === channelId)) {
    await next();

    return;
  }

  await ack();
}
