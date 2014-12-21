gulp = require 'gulp'
http = require 'http'
path = require 'path'
del = require 'del'
lr = require 'tiny-lr'
connect = require 'connect'
runSequence = require 'run-sequence'
webpack = require 'webpack'
$ = do require 'gulp-load-plugins'

{ red, cyan, blue, green, magenta } = $.util.colors
server = do lr

pkg = require './package.json'
projectPath     = "#{path.resolve __dirname}"
paths =
  base:   projectPath
  source: "#{projectPath}/src"
  build:  "#{projectPath}/build"
  app:    "#{projectPath}/build/app"
  dist:   "#{projectPath}/dist"
  plugin: "#{projectPath}/dist/Server/Resources/WebClient#{pkg.name}"

distPath = if $.util.env.distpath
    "#{$.util.env.distpath}/plugins/#{pkg.name}"
  else
    paths.plugin

# Adjust webpack config based on env
webpackConfig = (require './app.webpack.config.coffee') paths, pkg
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

gulp.task 'ci', (cb) ->
  runSequence 'clean', 'build', cb

gulp.task 'dist', ['build'], ->
  $.util.log "\Distributing to #{distPath}"

  distribution = [
    "#{paths.build}/app/index.js"
    "#{paths.base}/package.json"
  ]

  # Add source maps unless production or prohibited
  if webpackConfig.devtool is 'sourcemap'
    distribution.push "#{paths.build}/app/index.js.map"

  gulp.src distribution
    .pipe gulp.dest distPath

gulp.task 'clean:build', (cb) ->
  del [paths.build], cb

gulp.task 'clean:dist', (cb) ->
  del [distPath], cb

gulp.task 'build:test', [ 'build:test-suite' ], ->
  gulp.src "#{appPath}/html/test.html"
    # embeds the live reload script
    .pipe $.embedlr port: lrPort
    .pipe gulp.dest testBuildPath

gulp.task 'build', (cb) ->
  webpack webpackConfig, (err, stats) ->
    $.util.log '[build:app]', stats.toString colors: true
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
