import 'reflect-metadata';
import { App, LogLevel } from '@slack/bolt';
import { config } from 'dotenv';
import dataSource from '~/entities';
import registerListeners from '~/listeners';

config({
  path: [
    '.env',
    '.env.local',
    `.env.${process.env.NODE_ENV ?? 'development'}`,
    `.env.${process.env.NODE_ENV ?? 'development'}.local`
  ]
});

const app = new App({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  token: process.env.SLACK_BOT_TOKEN
});

registerListeners(app);

void (async () => {
  try {
    await dataSource.initialize();

    await app.start(process.env.PORT ?? 3000);

    app.logger.info('⚡️ Word game is running! ⚡️');
  } catch (error) {
    app.logger.error('Unable to start word game.', error);
  }
})();
