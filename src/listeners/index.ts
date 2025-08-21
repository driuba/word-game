import config from '~/config.js';
import registerCommands from './commands/index.js';
import registerMessages from './messages/index.js';

export default function () {
	registerCommands(config.wg.commandPrefix);
	registerMessages();
}

