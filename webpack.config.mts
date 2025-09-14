// noinspection JSUnusedGlobalSymbols

import type { Configuration } from 'webpack';
import { resolve } from 'node:path';
import packageInformation from './package.json' with { type: 'json' };

export default {
	context: resolve(import.meta.dirname),
	devtool: 'source-map',
	entry: './src/index.ts',
	experiments: {
		outputModule: true
	},
	externals: Object.keys(packageInformation.dependencies),
	externalsType: 'node-commonjs',
	module: {
		defaultRules: [
			{
				exclude: resolve(import.meta.dirname, 'src', 'migrations'),
				include: resolve(import.meta.dirname, 'src')
			}
		],
		rules: [
			{
				test: /\.json$/,
				type: 'json'
			},
			{
				test: /\.md$/,
				type: 'asset/source'
			},
			{
				test: /\.ts$/,
				use: 'ts-loader'
			}
		]
	},
	optimization: {
		nodeEnv: false
	},
	output: {
		clean: true,
		filename: 'app.js',
		module: true,
		path: resolve(import.meta.dirname, 'dist')
	},
	resolve: {
		alias: {
			/* eslint-disable @typescript-eslint/naming-convention */
			'~': resolve(import.meta.dirname, 'src')
			/* eslint-enable @typescript-eslint/naming-convention */
		},
		extensionAlias: {
			/* eslint-disable @typescript-eslint/naming-convention */
			'.js': ['.ts']
			/* eslint-enable @typescript-eslint/naming-convention */
		},
		extensions: ['.ts']
	},
	target: 'node24.8'
} as const satisfies Configuration;
