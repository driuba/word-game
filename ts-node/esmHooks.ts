/**
 * Code taken as a workaround for ts-node from with inspiration from
 * https://github.com/TypeStrong/ts-node/discussions/1450#discussioncomment-1806115
 */
import { fileURLToPath, pathToFileURL } from 'url';
import type { NodeLoaderHooksAPI2 } from 'ts-node';
import { createEsmHooks, register } from 'ts-node';
import { createMatchPath, loadConfig } from 'tsconfig-paths';

const dotJs = '.js';
const dotMd = '.md';
const indexJs = '/index.js';

const configLoaderResult = loadConfig();

if (configLoaderResult.resultType === 'failed') {
	throw new Error(configLoaderResult.message);
}

const { absoluteBaseUrl, paths } = configLoaderResult;

const matchPath = createMatchPath(absoluteBaseUrl, paths);

const { load: loadTsNode, resolve: resolveTsNode } = createEsmHooks(register()) as NodeLoaderHooksAPI2;

export async function load(
	...[url, context, defaultLoad]: Parameters<NodeLoaderHooksAPI2.LoadHook>
): ReturnType<NodeLoaderHooksAPI2.LoadHook> {
	if (url.endsWith(dotMd)) {
		return {
			format: 'module',
			source:
				`import { readFile } from 'fs/promises';` +
				`export default await readFile(String.raw\`${fileURLToPath(url)}\`, 'utf8');`,
			shortCircuit: true
		};
	}

	return await loadTsNode(url, context, defaultLoad);
}

export function resolve(
	...[specifier, context, defaultResolve]: Parameters<NodeLoaderHooksAPI2.ResolveHook>
): ReturnType<NodeLoaderHooksAPI2.ResolveHook> {
	let suffix: string | undefined;

	if (specifier.endsWith(indexJs)) {
		suffix = indexJs;
	} else if (specifier.endsWith(dotJs)) {
		suffix = dotJs;
	} else if (specifier.endsWith(dotMd)) {
		suffix = dotMd;
	}

	if (suffix) {
		const match = matchPath(
			specifier.substring(0, specifier.length - suffix.length)
		);

		if (match) {
			return resolveTsNode(pathToFileURL(`${match}${suffix}`).href, context, defaultResolve);
		}
	}

	return resolveTsNode(specifier, context, defaultResolve);
}
