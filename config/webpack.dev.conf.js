const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const commonConf = require('./webpack.base.conf')

module.exports = merge(commonConf, {
  mode: 'development',
  entry: {
    app: path.resolve(__dirname, '../demo/')
  },
  output: {
    path: path.resolve(__dirname, '../demo-dist/'),
    publicPath: '/'
  },
  devtool: '#source-map',
  devServer: {
    contentBase: path.resolve(__dirname, '../demo-dist/'),
    host: 'localhost',
    port: 8082,
    compress: true,
    hot: true,
    overlay: true
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.WatchIgnorePlugin([/\.d\.ts$/]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../demo/index.html'),
      filename: 'index.html'
    })
  ]
})
