import type { App } from '@slack/bolt';
import filterMessageHandler from './filterMessage';
import messageHandler from './message';

export default function register(app: App) {
	app.message(filterMessageHandler, messageHandler);
}
