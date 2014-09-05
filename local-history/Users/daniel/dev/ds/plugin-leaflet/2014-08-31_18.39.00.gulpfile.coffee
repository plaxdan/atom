_ = require 'lodash'
gulp = require 'gulp'
http = require 'http'
path = require 'path'
lr = require 'tiny-lr'
connect = require 'connect'
es = require 'event-stream'
mocha = require 'gulp-mocha'
webpack = require 'webpack'
$ = do require 'gulp-load-plugins'

{ red, cyan, blue, green, magenta } = $.util.colors
server = do lr

pkg = require './package.json'
projectPath     = "#{path.resolve __dirname}"
appPath         = "#{projectPath}/app"
buildPath       = "#{projectPath}/build"

jsBuildPath     = "#{buildPath}/js"
webBuildPath    = "#{buildPath}/web"
testBuildPath   = "#{buildPath}/test"

globalVendorsPath = "#{buildPath}/vendor"
globalVendorsFileName = 'global.js'

distPath        = if $.util.env.distpath
    "#{$.util.env.distpath}/plugins/#{pkg.name}"
  else
    "#{projectPath}/dist/#{pkg.name}"
webDistPath     = "#{distPath}/web"

vendorAssets = [
    name: 'leaflet'
    base: 'node_modules/leaflet/dist'
    dest: buildPath
    assets: [
      src: '*.js'
      global: true
    ,
      'leaflet.css'
    ,
      src: 'images/**/*'
      dest: 'images/'
    ]
  ,
    name: 'leaflet-locatecontrol'
    base: 'vendor/leaflet-locatecontrol/src'
    dest: buildPath
    assets: [
      src: '*.js'
      global: true
    ,
      '*.css'
    ,
      src: 'css/**/*'
      dest: 'css/'
    ,
      src: 'font/**/*'
      dest: 'font/'
    ]
]

exportName = (pkg.name).replace /-/g, '_'
webpackConfig =
  cache: true
  entry:
    index: "#{appPath}/src/index.coffee"
    test: "#{appPath}/src/test.coffee"
  output:
    path: "#{webBuildPath}/src"
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
      loader: 'style-loader!css-loader!sass-loader'
    ,
      test: /\.css$/
      loader: 'style-loader!css-loader'
    ,
      test: /\.coffee$/
      loader: 'coffee-loader'
    ]

# create a single webpack compiler to allow caching
webpackCompiler = _.memoize ->
  if $.util.env.production
    # even though we have source maps, the $.uglify plug-in slows the build
    # down considerable so only use it with production flag
    webpackConfig.plugins.push new webpack.optimize.UglifyJsPlugin
  else
    webpackConfig.plugins.push new webpack.DefinePlugin DEBUG: true
    webpackConfig.devtool = 'sourcemap' unless $.util.env.nosourcemap
    webpackConfig.debug = true
  webpack webpackConfig

port = 3000
# allow to connect from anywhere
hostname = null
# change this to something unique if you want to run multiple projects
# side-by-side
lrPort = $.util.env.lrport or 35729


gulp.task 'default', [ 'build' ]

gulp.task 'clean', [ 'clean:build', 'clean:dist' ]

gulp.task 'build', [
  'build:webpack'
  'build:styles'
]

gulp.task 'dist', ['build'], ->
  $.util.log "\Distributing to #{distPath}"

  includeInDist = [
    "#{webBuildPath}/src/index.js"
    "#{webBuildPath}/styles/index.css"
    "#{projectPath}/package.json"
  ]

  # Add source maps unless production or prohibited
  unless $.util.env.production or $.util.env.nosourcemap
    includeInDist.push "#{webBuildPath}/src/index.js.map"

  gulp.src includeInDist
    .pipe gulp.dest distPath
  gulp.src "#{buildPath}/vendor/**/*"
    .pipe gulp.dest "#{distPath}/vendor"

gulp.task 'clean:build', ->
  gulp.src ["#{buildPath}"], read: false
    .pipe $.rimraf force: true

gulp.task 'clean:dist', ->
  gulp.src ["#{distPath}"], read: false
    .pipe $.rimraf force: true

# Compiles Sass files into css file
# and reloads the styles
gulp.task 'build:styles', ->
  es.concat(
    gulp.src "#{appPath}/styles/index.scss"
      # TODO: should include pattern for styles from React components
      .pipe $.sass errLogToConsole: true, includePaths: ['styles/includes']
    , gulp.src "bower_components/normalize-css/normalize.css"
  )
  .pipe $.rename 'index.css'
  .pipe if $.util.env.production then $.minifyCss() else $.util.noop()
  .pipe gulp.dest "#{webBuildPath}/styles"
  .pipe $.livereload server

gulp.task 'build:test-suite', [ 'build:webpack' ], ->
  gulp.src "#{jsBuildPath}/**/*_spec.js"
    .pipe $.concat 'test-suite.js'
    .pipe gulp.dest jsBuildPath

gulp.task 'build:test', [ 'build:test-suite' ], ->
  gulp.src "#{appPath}/html/test.html"
    # embeds the live reload script
    .pipe $.embedlr port: lrPort
    .pipe gulp.dest testBuildPath

gulp.task 'build:vendor', ->
  globalVendors = []
  for vendor in vendorAssets
    $.util.log cyan vendor.name

    # a little validation
    if (not vendor.dest? and not vendor.global) or
      (vendor.dest? and vendor.global)
        $.util.log red "#{vendor.name} error - you can have dest or global \
        but not both"
        return false

    # process each asset
    for asset in vendor.assets
      dest = "#{vendor.dest}/vendor/#{vendor.name}"

      if _.isString asset
        asset = src: "#{vendor.base}/#{asset}", dest: dest
      else if _.isObject asset
        asset.src = "#{vendor.base}/#{asset.src}"
        asset.dest = "#{dest}/#{if asset.dest? then asset.dest else ''}"
        # $.util.log green "DEST: #{asset.dest}"

      if vendor.global or asset.global
        globalVendors.push asset.src
        $.util.log "\t#{asset.src} -> " +
          (magenta "#{globalVendorsPath}/#{globalVendorsFileName}")
      else
        asset.dest = vendor.dest if vendor.shared
        (gulp.src asset.src).pipe gulp.dest asset.dest
        $.util.log "\t#{asset.src} -> " + magenta "#{asset.dest}"

  # concat files to script if eligible
  # minify concatenated file if necessary
  if globalVendors.length > 0
    gulp.src globalVendors
      .pipe $.concat globalVendorsFileName
      .pipe if $.util.env.production then $.uglify() else $.util.noop()
      .pipe gulp.dest globalVendorsPath

gulp.task 'build:webpack', ['build:vendor'], (cb) ->
  webpackCompiler().run (err, stats) ->
    $.util.log 'build:webpack', stats.toString colors: true

    # trigger explicit reload
    forceReload()

    cb err

# pipe-able task that is called to reload the server
pipeReload = -> $.util.noop()
# explicit function to reload from a watch event
forceReload = ->

gulp.task 'run:server', [ 'build', 'watch' ], ->
  tinylr.listen lrPort, (err) -> $.util.log err if err
  $.util.log "Live reload server listening on port #{lrPort}"

  # set up reload functions
  pipeReload = -> livereload tinylr
  forceReload = ->
    tinylr.changed
      body:
        files: [ 'index.html', 'test.html' ]

    if $.util.env.mocha
      gulp.start 'watch-mocha'

  proxyServer [ webBuildPath, testBuildPath ]
