import type { Configuration } from 'webpack';
import { resolve } from 'path';
import packageInformation from './package.json' with { type: 'json' };

export default {
  devtool: 'source-map',
  entry: './src/index.ts',
  externals: Object.keys(packageInformation.dependencies),
  externalsType: 'node-commonjs',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        exclude: /^\.\/src\/migratons\//,
        test: [
          /^\.\/src/,
          /\.ts$/
        ],
        use: 'ts-loader'
      }
    ]
  },
  output: {
    clean: true,
    filename: 'app.js',
    path: resolve(import.meta.dirname, 'dist')
  },
  resolve: {
    alias: {
      '~': resolve(import.meta.dirname, 'src')
    },
    extensions: ['.ts']
  },
  target: 'node'
} as Configuration;
