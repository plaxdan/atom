_ = require 'lodash'
del = require 'del'
path = require 'path'
mkdirp = require 'mkdirp'

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
  source:     "#{projectPath}/src"
  build:      "#{projectPath}/build"
  skel:       "#{projectPath}/build/skel"
  app:        "#{projectPath}/build/app"
  webapp:     "#{projectPath}/build/webapp"
  testReport: "#{projectPath}/build/tests.tap"
  plugins:    "#{projectPath}/build/plugins"
  cordova:    "#{projectPath}/cordova/www"
  dist:       "#{projectPath}/dist"

uglifyIfNeeded = (config) ->
  unless $.util.env.nouglify or $.util.env.nooglify
    config.plugins or= []
    uglifyOptions = compress: warnings: false
    config.plugins.push new webpack.optimize.UglifyJsPlugin uglifyOptions

# load and update the config settings for Webpack
skelConfig = (require './skel.webpack.config') paths
uglifyIfNeeded skelConfig

appConfig = (require './app.webpack.config') paths
uglifyIfNeeded appConfig

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
  skip: [ 'dev.js', 'test.js', 'direct.js' ]

buildVersion = pkgInfo.version
# jenkins defines a BUILD_NUMBER variable for official builds
if process.env.BUILD_NUMBER
  buildVersion = buildVersion.replace /0$/, process.env.BUILD_NUMBER

appConfig.plugins.push new webpack.DefinePlugin
  NOWEBSQL: $.util.env.nowebsql
  DEBUG: $.util.env.debug
  DS_BUILD_VERSION: JSON.stringify buildVersion
  DS_BUILD_TIMESTAMP: JSON.stringify new Date

# entry tasks

gulp.task 'default', [ 'run' ]

gulp.task 'build', [ 'build:skel', 'build:app', 'build:webapp', 'build:cordova' ]

gulp.task 'dist', ['build'], ->
  dest = $.util.env.distpath or paths.dist
  $.util.log 'Copying dist files to', cyan dest
  gulp.src [
    "#{paths.skel}/**/*"
    "#{paths.app}/**/*"
  ]
    .pipe gulp.dest dest

gulp.task 'run', [ 'build:skel', 'build:plugins' ], ->
  gulp.start 'run:webpack'

gulp.task 'test', (cb) ->
  runSequence 'dist', 'run:mocha', cb

gulp.task 'ci', (cb) ->
  runSequence 'clean', 'testreport', cb

gulp.task 'clean', (cb) ->
  # use concat to support cleaning multiple distpaths (CEF, etc)
  distpath = $.util.env.distpath or paths.dist
  webapppath = $.util.env.webapppath or paths.webapp
  # allow deletion of files outside of current working dir (useful on ci server)
  delOptions = force: true
  filesToDelete = [
    paths.build
    paths.cordova
  ]
    .concat distpath
    .concat webapppath
  del filesToDelete, delOptions, cb

# build tasks

# static skeleton resources
gulp.task 'build:static', ->
  gulp.src "#{paths.source}/static/**/*"
    .pipe gulp.dest "#{paths.skel}"

# skeleton application, shared libraries, etc
gulp.task 'build:skel', ['build:static'], (cb) ->
  webpack skelConfig, (err, stats) ->
    $.util.log '[build:skel]', stats.toString colors: true
    $.util.log '[build:skel] error: ', err if err
    cb err

gulp.task 'build:plugins', (cb) ->
  # make sure the plugins folder exists
  mkdirp paths.plugins, cb

gulp.task 'build:app', (cb) ->
  webpack appConfig, (err, stats) ->
    $.util.log '[build:app]', stats.toString colors: true
    $.util.log '[build:app] error: ', err if err
    cb err

gulp.task 'build:webapp', [ 'build:skel' ], ->
  dest = $.util.env.webapppath or paths.webapp
  $.util.log 'Copying webapp files to', cyan dest
  gulp.src [ "#{paths.skel}/**/*" ]
    .pipe gulp.dest "#{dest}/src"
  gulp.src [ "#{paths.source}/webapp/**/*" ]
    .pipe gulp.dest dest

gulp.task 'build:cordova', [ 'build:webapp' ], ->
  # ensure the android assets folder exists - `cordova prepare` fails otherwise
  mkdirp "#{projectPath}/cordova/platforms/android/assets"
  gulp.src [ "#{paths.webapp}/**/*" ]
    .pipe gulp.dest paths.cordova

gulp.task 'testreport', ['dist'], (cb) ->
  gulp.src "#{paths.dist}/test.html"
    .pipe $.mochaPhantomjs reporter: 'tap', dump: paths.testReport
    # an error will thrown from the stream if a test fails
    .on 'error', _.noop
    .on 'end', -> cb()
  # intentionally not returning the stream
  return

# run tasks

gulp.task 'run:skel', [ 'build:static' ], ->
  compiler = webpack skelConfig
  proxyServer compiler, paths

gulp.task 'run:webpack', ->
  compiler = webpack appConfig
  proxyServer compiler, paths

gulp.task 'run:mocha', ->
  gulp.src "#{paths.dist}/test.html"
    .pipe $.mochaPhantomjs reporter: './node_modules/mocha/lib/reporters/nyan.js'
