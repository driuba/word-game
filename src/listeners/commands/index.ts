import type { App } from '@slack/bolt';
import filterChannel from './filterChannel';
import setWordHandler from './setWord';

export default function register(app: App) {
  app.command('/wg-set-word', filterChannel, setWordHandler);
}
