import type { App } from '@slack/bolt';
import bragHandler from './brag';
import checkHandler from './check';
import filterChannelHandler from './filterChannel';
import leaderboardHandler from './leaderboard';
import leaveHandler from './leave';
import setWordHandler from './setWord';

export default function register(app: App, prefix: string) {
	app.command(`/${prefix}-brag`, filterChannelHandler, bragHandler);
	app.command(`/${prefix}-check`, filterChannelHandler, checkHandler);
	app.command(`/${prefix}-leaderboard`, filterChannelHandler, leaderboardHandler);
	app.command(`/${prefix}-leave`, filterChannelHandler, leaveHandler);
	app.command(`/${prefix}-set-word`, filterChannelHandler, setWordHandler);
}
