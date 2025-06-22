import type { App } from '@slack/bolt';
import messageHandler from './message.mjs';
import { messageFilterHandler } from './utils/index.mjs';

export default function register(app: App) {
	app.message(messageFilterHandler, messageHandler);
}
