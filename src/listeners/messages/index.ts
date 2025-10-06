import messageHandler from './message.js';
import { messageFilterHandler } from './utils/index.js';

export default function () {
	app.message(messageFilterHandler, messageHandler);
}
