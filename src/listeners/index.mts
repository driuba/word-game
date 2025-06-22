import type { App } from '@slack/bolt';
import config from '~/config.mjs';
import registerCommands from './commands/index.mjs';
import registerMessages from './messages/index.mjs';

export default function registerListeners(app: App) {
	registerCommands(app, config.wg.commandPrefix);
	registerMessages(app);
}

