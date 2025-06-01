import type { App } from '@slack/bolt';
import registerCommands from './commands';
import registerMessages from './messages';

export default function registerListeners(app: App, prefixCommand: string) {
	registerCommands(app, prefixCommand);
	registerMessages(app);
}
