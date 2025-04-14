import type { App } from '@slack/bolt';
import checkHandler from './check';
import filterChannelHandler from './handleFilterChannel';
import setWordHandler from './setWord';

export default function register(app: App) {
  app.command('/wg-check', filterChannelHandler, checkHandler);
  app.command('/wg-set-word', filterChannelHandler, setWordHandler);
}
