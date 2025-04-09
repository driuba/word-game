import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export default async function sampleMessageCallback({
  context,
  say,
  logger
}: { context: { matches: string[] } } & AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>) {
  try {
    const greeting = context.matches[0];
    await say(`${greeting}, how are you?`);
  } catch (error) {
    logger.error(error);
  }
}
