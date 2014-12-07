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
paths =
  base:   projectPath
  source: "#{paths.base}/src"
  build:  "#{paths.base}/build"
  app:    "#{paths.base}/build/app"

vendorPath = "#{buildPath}/vendor"
vendorBundleFile = 'global.js'

distPath        = if $.util.env.distpath
    "#{$.util.env.distpath}/plugins/#{pkg.name}"
  else
    "#{paths.base}/dist"
webDistPath     = "#{distPath}/web"

# vendors = [
#     name: 'leaflet'
#     base: 'node_modules/leaflet/dist'
#     bundle: [
#       'leaflet.js'
#     ]
#     include:
#       assets: [
#         'leaflet.css'
#       ,
#         src: 'images/**/*'
#         dest: 'images/'
#       ]
#   ,
#     name: 'leaflet-locatecontrol'
#     base: 'bower_components/leaflet-locatecontrol/src'
#     bundle: [
#       '*.js'
#     ]
#     include:
#       assets: [
#         src: '*.css'
#       ,
#         src: 'css/**/*'
#         dest: 'css/'
#       ]
#   ,
#     name: 'esri-leaflet'
#     base: 'bower_components/esri-leaflet/dist'
#     bundle: [
#       'esri-leaflet.js'
#     ]
# ]

webpackConfig = (require './app.webpack.config.coffee') paths

# Adjust webpack config based on env
webpackConfig.devtool = 'sourcemap' unless $.util.env.nosourcemap
webpackConfig.plugins.push new webpack.DefinePlugin
  TRACE: $.util.env.trace
  DEBUG: not $.util.env.production
unless $.util.env.nouglify
  webpackConfig.plugins.push new webpack.optimize.UglifyJsPlugin

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

  distribution = [
    "#{paths.build}/app/index.js"
    "#{paths.build}/styles/index.css"
    "#{paths.base}/package.json"
  ]

  # Add source maps unless production or prohibited
  if webpackConfig.devtool is 'sourcemap'
    distribution.push "#{paths.build}/app/index.js.map"

  gulp.src distribution
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
  gulp.src "#{appPath}/styles/index.scss"
    # TODO: should include pattern for styles from React components
    .pipe $.sass errLogToConsole: true, includePaths: ['styles/includes']
    .pipe $.rename 'index.css'
    .pipe if $.util.env.production then $.minifyCss() else $.util.noop()
    .pipe gulp.dest "#{paths.build}/styles"
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

# Each vendor may provide either (or both of):
#   - bundle: files to include in the global vendor js file
#   - include: files to copy to the build
# Include assets may be strings or objects. Bundles are always strings. The
# dest of an include has the following precedence:
#   1. include.assets[i].dest (if asset[i] is an object)
#   2. include.dest (if asset[i] is a string or an object with no dest property)
#   3. vendorPath/vendor.name (if 1 or 2 is missing)
# Finally: asset.dest is always relative to its parent
# gulp.task 'build:vendor', ->
#   bundleFiles = []
#
#   for vendor in vendors
#     $.util.log cyan "#{vendor.name}:"
#
#     if vendor.bundle?
#       $.util.log magenta "  Bundling:"
#       for file in vendor.bundle
#         bundleFile = "#{vendor.base}/#{file}"
#         $.util.log "    #{bundleFile}"
#         bundleFiles.push bundleFile
#
#     if vendor.include?
#       $.util.log green "  Including:"
#       for asset in vendor.include.assets
#         if _.isString asset
#           asset = src: "#{vendor.base}/#{asset}"
#         else if _.isObject asset
#           asset.src = "#{vendor.base}/#{asset.src}"
#
#         # asset.dest should always be relative to its parent
#         if vendor.include.dest
#           # parent is include.dest
#           asset.dest = "#{vendor.include.dest}/#{asset.dest or ''}"
#         else
#           # parent is #{vendorPath}/#{vendor.name}
#           asset.dest = "#{vendorPath}/#{vendor.name}/#{asset.dest or ''}"
#
#         gulp.src asset.src
#           .pipe gulp.dest asset.dest
#
#         $.util.log "    #{asset.src} #{magenta '->'} \
#           #{green path.relative '.', asset.dest}"
#
#   if bundleFiles.length
#     gulp.src bundleFiles
#       .pipe $.concat vendorBundleFile
#       .pipe if $.util.env.production then $.uglify() else $.util.noop()
#       .pipe gulp.dest vendorPath

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

  proxyServer [ paths.build, testBuildPath ]
