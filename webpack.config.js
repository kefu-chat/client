const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  mode: 'development',
  entry: './src/widget.js',
  output: {
    path: path.resolve(__dirname, process.env.APP_ENV === 'production' ? 'public/build' : 'public'),
    filename: 'widget.js'
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
  ],
  module: {
    rules: [
      {
        include: __dirname + "/src/",
        exclude: "/node_modules/",
        loader: "babel-loader",
        options: {
          presets: []
        }
      }
    ]
  }
};
