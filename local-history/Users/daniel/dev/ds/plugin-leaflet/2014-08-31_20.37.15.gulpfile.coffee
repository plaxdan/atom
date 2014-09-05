_ = require 'lodash'
gulp = require 'gulp'
http = require 'http'
path = require 'path'
lr = require 'tiny-lr'
sass = require 'gulp-sass'
connect = require 'connect'
es = require 'event-stream'
gutil = require 'gulp-util'
clean = require 'gulp-clean'
mocha = require 'gulp-mocha'
cache = require 'gulp-cached'
coffee = require 'gulp-coffee'
concat = require 'gulp-concat'
rename = require 'gulp-rename'
uglify = require 'gulp-uglify'
embedlr = require 'gulp-embedlr'
refresh = require 'gulp-livereload'
minifycss = require 'gulp-minify-css'
plumber = require 'gulp-plumber'
webpack = require 'webpack'

{ red, cyan, blue, green, magenta } = gutil.colors
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

distPath        = if gutil.env.distpath
    "#{gutil.env.distpath}/plugins/#{pkg.name}"
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
    name: 'sayhello'
    base: 'vendor/sayhello'
    dest: buildPath
    assets: [
      '*.js'
    ]
  ,
    name: 'leaflet-locatecontrol'
<<<<<<< HEAD
    base: 'bower_components/leaflet.locatecontrol/src'
=======
    base: 'vendor/leaflet-locatecontrol/src'
    dest: buildPath
>>>>>>> webpackify
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
  if gutil.env.production
    # even though we have source maps, the uglify plug-in slows the build
    # down considerable so only use it with production flag
    webpackConfig.plugins.push new webpack.optimize.UglifyJsPlugin
  else
    webpackConfig.devtool = 'sourcemap'
    webpackConfig.debug = true
  webpack webpackConfig

port = 3000
# allow to connect from anywhere
hostname = null
# change this to something unique if you want to run multiple projects
# side-by-side
lrPort = gutil.env.lrport or 35729


gulp.task 'default', [ 'build' ]

gulp.task 'clean', [ 'clean:build', 'clean:dist' ]

gulp.task 'build', [
  'build:webpack'
  'build:styles'
]

gulp.task 'dist', ['build'], ->
  gutil.log "\Distributing to #{distPath}"
  gulp.src [
    "#{webBuildPath}/src/index.js"
    "#{webBuildPath}/styles/index.css"
    "#{appPath}/plugin_manifest.json"
  ]
    .pipe gulp.dest distPath
  gulp.src "#{buildPath}/vendor/**/*"
    .pipe gulp.dest "#{distPath}/vendor"

gulp.task 'clean:build', ->
  gulp.src ["#{buildPath}"], read: false
    .pipe clean force: true

gulp.task 'clean:dist', ->
  gulp.src ["#{distPath}"], read: false
    .pipe clean force: true

# Compiles Sass files into css file
# and reloads the styles
gulp.task 'build:styles', ->
  es.concat(
    gulp.src "#{appPath}/styles/index.scss"
      # TODO: should include pattern for styles from React components
      .pipe sass errLogToConsole: true, includePaths: ['styles/includes']
    , gulp.src "bower_components/normalize-css/normalize.css"
  )
  .pipe rename 'index.css'
  .pipe if gutil.env.production then minifycss() else gutil.noop()
  .pipe gulp.dest "#{webBuildPath}/styles"
  .pipe refresh server

gulp.task 'build:test-suite', [ 'build:webpack' ], ->
  gulp.src "#{jsBuildPath}/**/*_spec.js"
    .pipe concat 'test-suite.js'
    .pipe gulp.dest jsBuildPath

gulp.task 'build:test', [ 'build:test-suite' ], ->
  gulp.src "#{appPath}/html/test.html"
    # embeds the live reload script
    .pipe embedlr port: lrPort
    .pipe gulp.dest testBuildPath

gulp.task 'build:vendor', (cb) ->
  globalVendors = []
  for vendor in vendorAssets
    gutil.log cyan vendor.name

    # a little validation
    if (not vendor.dest? and not vendor.global) or
      (vendor.dest? and vendor.global)
        gutil.log red "#{vendor.name} error - you can have dest or global \
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
        # gutil.log green "DEST: #{asset.dest}"

      if vendor.global or asset.global
        globalVendors.push asset.src
        gutil.log "\t#{asset.src} -> " +
          (magenta "#{globalVendorsPath}/#{globalVendorsFileName}")
      else
        asset.dest = vendor.dest if vendor.shared
        (gulp.src asset.src).pipe gulp.dest asset.dest
        gutil.log "\t#{asset.src} -> " + magenta "#{asset.dest}"

  # concat files to script if eligible
  # minify concatenated file if necessary
  if globalVendors.length > 0
    gulp.src globalVendors
      .pipe concat globalVendorsFileName
      .pipe if gutil.env.production then uglify() else gutil.noop()
      .pipe gulp.dest globalVendorsPath

  cb()

gulp.task 'build:webpack', ['build:vendor'], (cb) ->
  webpackCompiler().run (err, stats) ->
    gutil.log 'build:webpack', stats.toString colors: true

    # trigger explicit reload
    forceReload()

    cb err

# pipe-able task that is called to reload the server
pipeReload = -> gutil.noop()
# explicit function to reload from a watch event
forceReload = ->

gulp.task 'run:server', [ 'build', 'watch' ], ->
  tinylr.listen lrPort, (err) -> gutil.log err if err
  gutil.log "Live reload server listening on port #{lrPort}"

  # set up reload functions
  pipeReload = -> livereload tinylr
  forceReload = ->
    tinylr.changed
      body:
        files: [ 'index.html', 'test.html' ]

    if gutil.env.mocha
      gulp.start 'watch-mocha'

  proxyServer [ webBuildPath, testBuildPath ]
