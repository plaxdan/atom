webpack = require 'webpack'
AppCachePlugin = require 'appcache-webpack-plugin'

module.exports = (paths) ->
  entry:
    skel: "#{paths.source}/skel/skel.coffee"
    ds5_shim: "#{paths.source}/skel/ds5_shim.coffee"
    test: "#{paths.source}/app/test.coffee"
  output:
    path: paths.skel
    filename: '[name].js'
  resolve:
    extensions: [
      ''
      '.coffee'
      '.js'
    ]
    modulesDirectories: [ 'node_modules', 'bower_components' ]
  module:
    loaders: [
      test: /\.coffee$/
      loader: 'coffee-loader'
    ,
      test: /\.less$/
      loader: 'css-loader!less-loader'
    ,
      test: /.(jpe?g|png)$/
      loader: 'url-loader'
    ,
      test: /.(eot|svg|ttf|woff)(\?v=[0-9]\.[0-9]\.[0-9])?$/
      loader: 'url-loader'
    ]
  plugins: [
    new AppCachePlugin
      cache: [ 'favicon.ico' ]
      network: [ '*', 'http://*', 'https://*' ]
    # moment includes a bunch of unnecessary locale files by default, this
    # decreases the output size by ~120k
    # https://github.com/webpack/webpack/issues/198
    new webpack.ContextReplacementPlugin /moment[\/\\]locale$/, /en/
  ]
  # this is needed to load a shimmed Bootstrap for the DS5.0 app
  externals: [
    'underscore': 'var _'
  ]

  # non-standard config - shared libraries that are exposed as globals to
  # the app as well
  sharedLibraries:
    _: 'lodash'
    async: 'async'
    jQuery: 'jquery'
    moment: 'moment'
    React: 'react/addons'
