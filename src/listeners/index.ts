import type { App } from '@slack/bolt';
import config from '~/config';
import registerCommands from './commands';
import registerMessages from './messages';

export default function registerListeners(app: App) {
	registerCommands(app, config.wgPrefixCommand);
	registerMessages(app);
}

