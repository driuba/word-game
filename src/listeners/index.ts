import type { App } from '@slack/bolt';
import registerCommands from './commands';
import registerMessages from './messages';

export default function registerListeners(app: App) {
  registerCommands(app);
  registerMessages(app);
}
