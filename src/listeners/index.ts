import type { App } from '@slack/bolt';
import config from '~/config.js';
import registerCommands from './commands/index.js';
import registerMessages from './messages/index.js';

export default function (app: App) {
	registerCommands(app, config.wg.commandPrefix);
	registerMessages(app);
}

