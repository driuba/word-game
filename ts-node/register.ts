import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./ts-node/esmHooks.ts', pathToFileURL(import.meta.dirname));
