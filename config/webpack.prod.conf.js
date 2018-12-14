const path = require('path')
const merge = require('webpack-merge')

const commonConf = require('./webpack.base.conf')

module.exports = merge(commonConf, {
  mode: 'production',
  entry: {
    app: path.resolve(__dirname, '../src/')
  },
  output: {
    path: path.resolve(__dirname, '../lib/'),
    publicPath: '/',
    filename: 'vdom.js',
    library: 'vdom',
    libraryTarget: 'umd'
  }
})
