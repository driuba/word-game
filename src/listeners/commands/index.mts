import type { App } from '@slack/bolt';
import bragHandler from './brag.mjs';
import checkHandler from './check.mjs';
import leaderboardHandler from './leaderboard.mjs';
import leaveHandler from './leave.mjs';
import readmeHandler from './readme.mjs';
import setWordHandler from './setWord.mjs';
import { channelFilterHandler, errorHandler } from './utils/index.mjs';

export default function register(app: App, prefix: string) {
	app.command(`/${prefix}-brag`, errorHandler, channelFilterHandler, bragHandler);
	app.command(`/${prefix}-check`, errorHandler, channelFilterHandler, checkHandler);
	app.command(`/${prefix}-leaderboard`, errorHandler, channelFilterHandler, leaderboardHandler);
	app.command(`/${prefix}-leave`, errorHandler, channelFilterHandler, leaveHandler);
	app.command(`/${prefix}-readme`, errorHandler, readmeHandler);
	app.command(`/${prefix}-set-word`, errorHandler, channelFilterHandler, setWordHandler);
}
