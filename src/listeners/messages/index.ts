import type { App } from '@slack/bolt';
import messageHandler from './message.js';
import { messageFilterHandler } from './utils/index.js';

export default function (app: App) {
	app.message(messageFilterHandler, messageHandler);
}
