import { resolve } from 'path';
import nodeExternals from 'webpack-node-externals';
import type { Configuration } from 'webpack';

export default {
  devtool: 'source-map',
  entry: './src/index.ts',
  externals: nodeExternals(),
  mode: 'development',
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
