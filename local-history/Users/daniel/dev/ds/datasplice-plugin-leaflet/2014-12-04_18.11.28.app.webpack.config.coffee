webpack = require 'webpack'

# TODO: pass package.json into the module function?
pkg = require './package.json'

module.exports = (paths) ->

  exportName = (pkg.name).replace /-/g, '_'
  webpackConfig =
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
    module:
      loaders: [
        test:
          ///
          \.gif$
          |\.eot$
          |\.jpe?g$
          |\.mp3$
          |\.png$
          |\.svg$
          |\.ttf$
          |\.wav$
          |\.woff$
          ///
        loader: 'url-loader'
      ,
        test: /\.scss$/
        loader: 'style-loader!css-loader!sass-loader?\
          includePaths[]=node_modules'
      ,
        test: /\.css$/
        loader: 'style-loader!css-loader'
      ,
        test: /\.coffee$/
        loader: 'coffee-loader'
      ]
    plugins: []




  cache:true
  entry:
    app: "#{paths.source}/app/app.coffee"
    test: "#{paths.source}/app/test.coffee"
  output:
    path: paths.app
    filename: '[name].js'
  resolve:
    # Allow to omit extensions when requiring these files
    extensions: [
      ''
      '.coffee'
      '.js'
    ]
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
      test: /\.(scss|sass)$/
      loader: 'style-loader!css-loader!sass-loader?\
        includePaths[]=node_modules'
    ,
      test: /\.(eot|png|svg|ttf|woff)(\?v=[0-9]\.[0-9]\.[0-9])?$/
      loader: 'url-loader'
    ]
  plugins: [
    # this is needed for breakpoints to work with the chrome developer tools
    new webpack.BannerPlugin '//# sourceURL=app.js',
      raw: true
  ]
