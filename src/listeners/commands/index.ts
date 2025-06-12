import type { App } from '@slack/bolt';
import bragHandler from './brag';
import checkHandler from './check';
import leaderboardHandler from './leaderboard';
import leaveHandler from './leave';
import readmeHandler from './readme';
import setWordHandler from './setWord';
import { channelFilterHandler, errorHandler } from './utils'

export default function register(app: App, prefix: string) {
	app.command(`/${prefix}-brag`, errorHandler, channelFilterHandler, bragHandler);
	app.command(`/${prefix}-check`, errorHandler, channelFilterHandler, checkHandler);
	app.command(`/${prefix}-leaderboard`, errorHandler, channelFilterHandler, leaderboardHandler);
	app.command(`/${prefix}-leave`, errorHandler, channelFilterHandler, leaveHandler);
	app.command(`/${prefix}-readme`, errorHandler, readmeHandler);
	app.command(`/${prefix}-set-word`, errorHandler, channelFilterHandler, setWordHandler);
}
