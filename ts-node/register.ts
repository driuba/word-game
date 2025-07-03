import { register } from 'module';
import { pathToFileURL } from 'url';

register('./ts-node/esmHooks.ts', pathToFileURL(import.meta.dirname));
