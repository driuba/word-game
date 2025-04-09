import type { App } from '@slack/bolt';
import sampleCommandCallback from './sample-command';

export function register(app: App) {
  app.command('/sample-command', sampleCommandCallback);
}
