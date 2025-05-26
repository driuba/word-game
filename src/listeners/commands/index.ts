import type { App } from '@slack/bolt';
import checkHandler from './check';
import filterChannelHandler from './filterChannel';
import leaderboardHandler from './leaderboard';
import setWordHandler from './setWord';

export default function register(app: App) {
	app.command('/wg-brag', filterChannelHandler, bragHandler);
	app.command('/wg-leaderboard', filterChannelHandler, leaderboardHandler);
	app.command('/wg-set-word', filterChannelHandler, setWordHandler);
}
