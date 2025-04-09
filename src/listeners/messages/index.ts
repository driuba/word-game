import type { App } from '@slack/bolt';
import sampleMessageCallback from './sample-message';

export function register(app: App) {
  app.message(/^(hi|hello|hey).*/, sampleMessageCallback);
}
