const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 9000,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
  plugins: [
    new InjectManifest({
      swSrc: path.resolve(__dirname, 'src/scripts/sw.js'),
      swDest: 'sw.js',
      exclude: [/\.map$/, /manifest\.json$/, /sw\.js$/],
    }),
  ],
});
