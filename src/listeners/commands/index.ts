import type { App } from '@slack/bolt';
import bragHandler from './brag';
import checkHandler from './check';
import errorHandler from './errorFilter';
import filterChannelHandler from './channelFilter';
import leaderboardHandler from './leaderboard';
import leaveHandler from './leave';
import readmeHandler from './readme';
import setWordHandler from './setWord';

export default function register(app: App, prefix: string) {
	app.command(`/${prefix}-brag`, errorHandler, filterChannelHandler, bragHandler);
	app.command(`/${prefix}-check`, errorHandler, filterChannelHandler, checkHandler);
	app.command(`/${prefix}-leaderboard`, errorHandler, filterChannelHandler, leaderboardHandler);
	app.command(`/${prefix}-leave`, errorHandler, filterChannelHandler, leaveHandler);
	app.command(`/${prefix}-readme`, errorHandler, readmeHandler);
	app.command(`/${prefix}-set-word`, errorHandler, filterChannelHandler, setWordHandler);
}
