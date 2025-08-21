import bragHandler from './brag.js';
import checkHandler from './check.js';
import leaderboardHandler from './leaderboard.js';
import leaveHandler from './leave.js';
import readmeHandler from './readme.js';
import setWordHandler from './setWord.js';
import { channelFilterHandler, errorHandler } from './utils/index.js';

export default function (prefix: string) {
	app.command(`/${prefix}-brag`, errorHandler, channelFilterHandler, bragHandler);
	app.command(`/${prefix}-check`, errorHandler, channelFilterHandler, checkHandler);
	app.command(`/${prefix}-leaderboard`, errorHandler, channelFilterHandler, leaderboardHandler);
	app.command(`/${prefix}-leave`, errorHandler, channelFilterHandler, leaveHandler);
	app.command(`/${prefix}-readme`, errorHandler, readmeHandler);
	app.command(`/${prefix}-set-word`, errorHandler, channelFilterHandler, setWordHandler);
}
