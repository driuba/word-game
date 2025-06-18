import type { App } from '@slack/bolt';
import messageHandler from './message';
import { messageFilterHandler } from './utils';

export default function register(app: App) {
	app.message(messageFilterHandler, messageHandler);
}
