const webpack = require("webpack");
const base = require('./webpack.base')
const { merge } = require('webpack-merge');

const path = require('path'); // 处理绝对路径

const config = merge(
  {
    mode: 'development',
    devtool: 'inline-cheap-source-map',
    devServer: {
      contentBase: path.resolve('../dist'), //打包后的文件存放的地方
      port: 8080,
      compress: true,
      hot: true,
      inline: true,
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
  },
  base
);

module.exports = config;
