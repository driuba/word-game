// noinspection JSUnusedGlobalSymbols

import type { Configuration } from 'webpack';
import { resolve } from 'path';
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
			'~': resolve(import.meta.dirname, 'src')
		},
		extensionAlias: {
			'.js': ['.ts']
		},
		extensions: ['.ts']
	},
	target: 'node24.5'
} as const satisfies Configuration;
