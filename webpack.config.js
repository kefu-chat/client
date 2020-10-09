const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');

require('dotenv').config();

module.exports = {
  mode: 'development',
  entry: './src/widget.js',
  output: {
    path: path.resolve(__dirname, process.env.APP_ENV === 'production' ? 'public/build' : 'public'),
    filename: 'widget_[contenthash:6].js',
    publicPath: '/',
  },
  node: {
    fs: "empty"
  },
  plugins: [
    new webpack.DefinePlugin({
      API_URL: JSON.stringify(process.env.API_URL),
      WIDGET_URL: JSON.stringify(process.env.WIDGET_URL),
      SOCKET_HOST: JSON.stringify(process.env.SOCKET_HOST),
    }),
    new UglifyJsPlugin({
      sourceMap: true,
      test: /\.js(\?.*)?$/i,
      parallel: 3,
    }),
    new AssetsPlugin({
      path: process.env.APP_ENV === 'production' ? 'public/build' : 'public',
    }),
    {
      apply: compiler => {
        // add a hook to run a callback after each compile
        compiler.hooks.afterCompile.tap('jest', compilation => {
          // run `npm test` using `spawn` to keep the format of the terminal just like you run it manually.
          // for more info: https://stackoverflow.com/a/20145153/863110
          console.log(compilation)
        });
      }
    }
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        test: /\.js(\?.*)?$/i,
        parallel: 3,
      })
    ],
  },
  module: {
    rules: [
      {
        include: __dirname + "/src/",
        exclude: "/node_modules/",
        loader: "babel-loader",
        options: {
          presets: ["es2015"],
          plugins: [
            "transform-es2015-modules-amd"
          ]
        }
      }
    ]
  }
};
