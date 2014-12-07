webpack = require 'webpack'

module.exports = (paths) ->
  cache:true
  entry:
    app: "#{paths.source}/app/app.coffee"
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
    modulesDirectories: [ 'node_modules', 'bower_components' ]
  module:
    loaders: [
      test: /_spec\.coffee$/
      loader: 'mocha'
    ,
      test: /\.coffee$/
      loader: 'coffee-loader'
    ,
      test: /\.less$/
      loader: 'style-loader!css-loader!less-loader'
    ,
      test: /\.(scss|sass)$/
      loader: 'style-loader!css-loader!sass-loader?\
        includePaths[]=node_modules'
    ,
      test: /.(eot|gif|jpe?g|png|svg|ttf|woff)(\?v=[0-9]\.[0-9]\.[0-9])?$/
      loader: 'url-loader'
    ]
  plugins: [
    # this is needed for breakpoints to work with the chrome developer tools
    new webpack.BannerPlugin '//# sourceURL=app.js',
      raw: true
  ]
