const path = require('path');
const webpack = require('webpack');

require('dotenv').config();

module.exports = {
  mode: 'development',
  entry: './' + (process.env.APP_ENV === 'production' ? 'public/build' : 'public') + '/bundle.js',
  output: {
    path: path.resolve(__dirname, process.env.APP_ENV === 'production' ? 'public/build' : 'public'),
    filename: 'bundle.js',
    //filename: 'widget_[contenthash:6].js',
    publicPath: '/',
  },
  node: {
    fs: "empty"
  },
  plugins: [
  ],
  optimization: {
  },
  module: {
    rules: [
      {
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
