_ = require 'lodash'
del = require 'del'
path = require 'path'

gulp = require 'gulp'
$ = do require 'gulp-load-plugins'
runSequence = require 'run-sequence'

webpack = require 'webpack'

proxyServer = require './gulp/proxyserver'
AppManifestPlugin = require './gulp/appmanifestplugin'

{ red, cyan, blue, green, magenta } = $.util.colors

pkgInfo = require './package.json'

projectPath = path.resolve __dirname
paths =
  base:   projectPath
  source:   "#{projectPath}/src"
  build:    "#{projectPath}/build"
  skel:     "#{projectPath}/build/skel"
  app:      "#{projectPath}/build/app"
  webapp:   "#{projectPath}/build/webapp"
  dist:     "#{projectPath}/dist"
  plugins:  "#{projectPath}/build/app/plugins"

# load and update the config settings for Webpack
skelConfig = (require './skel.webpack.config') paths
skelConfig.plugins or= []
appConfig = (require './app.webpack.config') paths
appConfig.plugins or= []

# automatically expose shared libraries
if skelConfig.sharedLibraries
  skelConfig.plugins.push new webpack.ProvidePlugin skelConfig.sharedLibraries
  appConfig.plugins.push new webpack.ProvidePlugin skelConfig.sharedLibraries

  # these need to be registered as external dependencies in the app so they
  # are only bundled once
  appConfig.externals = _.invert skelConfig.sharedLibraries

# create a manifest of the files packaged for the app - skip the unit tests
appConfig.plugins.push new AppManifestPlugin
  name: 'dynamic.json'
  skip: 'test.js'

buildVersion = pkgInfo.version
# jenkins defines a BUILD_NUMBER variable for official builds
if process.env.BUILD_NUMBER
  buildVersion = buildVersion.replace /0$/, process.env.BUILD_NUMBER

appConfig.plugins.push new webpack.DefinePlugin
  NOWEBSQL: $.util.env.nowebsql
  TRACE: $.util.env.trace
  DEBUG: not $.util.env.production
  DS_BUILD_VERSION: JSON.stringify buildVersion
  DS_BUILD_TIMESTAMP: JSON.stringify new Date

# entry tasks

gulp.task 'default', [ 'run' ]

gulp.task 'build', [ 'build:skel', 'build:app', 'build:webapp', 'build:plugins' ]

gulp.task 'dist', (cb) ->
  runSequence 'build', 'build:dist', cb

gulp.task 'run', [ 'build:skel' ], ->
  gulp.start 'run:webpack'

gulp.task 'test', (cb) ->
  runSequence 'dist', 'run:mocha', cb

gulp.task 'clean', (cb) ->
  # use concat to support cleaning multiple distpaths (CEF, etc)
  distpath = $.util.env.distpath or paths.dist
  del ([ paths.build ].concat distpath), cb

# build tasks

# static skeleton resources
gulp.task 'build:static', ->
  gulp.src "#{paths.source}/static/**/*"
    .pipe gulp.dest "#{paths.skel}"

# skeleton application, shared libraries, etc
gulp.task 'build:skel', ['build:static'], (cb) ->
  unless $.util.env.nouglify
    skelConfig.plugins.push new webpack.optimize.UglifyJsPlugin
  webpack skelConfig, (err, stats) ->
    $.util.log '[skel:src]', stats.toString colors: true
    cb err

gulp.task 'build:plugins', (cb) ->
  # make sure the plugins folder exists
  mkdirp paths.plugins, cb

gulp.task 'build:app', (cb) ->
  unless $.util.env.nouglify
    appConfig.plugins.push new webpack.optimize.UglifyJsPlugin

  webpack appConfig, (err, stats) ->
    $.util.log '[app:src]', stats.toString colors: true
    cb err

gulp.task 'build:webapp', [ 'build:skel' ], ->
  dest = $.util.env.webapppath or paths.webapp
  $.util.log 'Copying webapp files to', cyan dest
  gulp.src [ "#{paths.skel}/**/*" ]
    .pipe gulp.dest "#{dest}/src"
  gulp.src [ "#{paths.source}/webapp/**/*" ]
    .pipe gulp.dest dest

gulp.task 'build:dist', ->
  dest = $.util.env.distpath or paths.dist
  $.util.log 'Copying dist files to', cyan dest
  gulp.src [ "#{paths.skel}/**/*", "#{paths.app}/**/*" ]
    .pipe gulp.dest dest

# run tasks

gulp.task 'run:skel', [ 'build:static' ], ->
  compiler = webpack skelConfig
  proxyServer compiler, paths

gulp.task 'run:webpack', ->
  compiler = webpack appConfig
  proxyServer compiler, paths

gulp.task 'run:mocha', ->
  gulp.src "#{paths.dist}/test.html"
    .pipe $.mochaPhantomjs reporter: 'dot'
