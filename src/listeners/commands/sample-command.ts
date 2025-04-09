import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';

export default async function sampleCommandCallback({ ack, respond, logger }: AllMiddlewareArgs & SlackCommandMiddlewareArgs) {
  try {
    await ack();
    await respond('Responding to the sample command!');
  } catch (error) {
    logger.error(error);
  }
}
