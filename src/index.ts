import 'reflect-metadata';
import { App, LogLevel } from '@slack/bolt';
import * as dotenv from 'dotenv';
import dataSource from '~/entities';
import registerListeners from '~/listeners';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO
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
