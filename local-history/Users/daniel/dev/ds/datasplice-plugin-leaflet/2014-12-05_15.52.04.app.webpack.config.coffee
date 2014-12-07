webpack = require 'webpack'

module.exports = (pathsm pkg) ->

  exportName = (pkg.name).replace /-/g, '_'

  cache: true
  entry:
    index: "#{paths.source}/app/index.coffee"
    test: "#{paths.source}/app/test.coffee"
  output:
    path: paths.app
    filename: '[name].js'
    libraryTarget: 'jsonp'
    library: exportName
    jsonpCallback: "webpackJsonp#{exportName}"
  resolve:
    extensions: [
      ''
      '.coffee'
      '.js'
    ]
    modulesDirectories: [ 'node_modules', 'bower_components' ]
  module:
    loaders: [
      test: /_spec\.coffee$/
      loader: 'mocha'
    ,
      test: /\.coffee$/
      loader: 'coffee-loader'
    ,
      test: /\.css$/
      loader: 'style-loader!css-loader'
    ,
      test: /\.less$/
      loader: 'style-loader!css-loader!less-loader'
    ,
      test: /\.scss$/
      loader: 'style-loader!css-loader!sass-loader?\
        includePaths[]=node_modules'
    ,
      test: /\.(eot|png|svg|ttf|woff)(\?v=[0-9]\.[0-9]\.[0-9])?$/
      loader: 'url-loader'
    ,
    ]
  plugins: [
    # this is needed for breakpoints to work with the chrome developer tools
    new webpack.BannerPlugin '//# sourceURL=index.js',
      raw: true
  ]
