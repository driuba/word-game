import type { App } from '@slack/bolt';
import { register as registerCommands } from './commands';
import { register as registerMessages } from './messages';

export default function registerListeners(app: App) {
  registerCommands(app);
  registerMessages(app);
}
