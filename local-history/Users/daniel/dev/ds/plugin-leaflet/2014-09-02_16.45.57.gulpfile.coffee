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
coffee = require 'gulp-coffee'
concat = require 'gulp-concat'
rename = require 'gulp-rename'
uglify = require 'gulp-uglify'
embedlr = require 'gulp-embedlr'
refresh = require 'gulp-livereload'
minifycss = require 'gulp-minify-css'
browserify = require 'gulp-browserify'
plumber = require 'gulp-plumber'
server = do lr

pkg = require './package.json'
projectPath     = "#{path.resolve __dirname}"
appPath         = "#{projectPath}/app"
buildPath       = "#{projectPath}/build"
jsBuildPath     = "#{buildPath}/js"
webBuildPath    = "#{buildPath}/web"
testBuildPath   = "#{buildPath}/test"
distPath        = if gutil.env.distpath
    "#{gutil.env.distpath}/plugins/#{pkg.name}"
  else
    "#{projectPath}/dist/#{pkg.name}"
webDistPath     = "#{distPath}/web"

nodeModulesPath     = "#{projectPath}/node_modules"
bowerComponentsPath = "#{projectPath}/bower_components"

browserifyOptions =
  debug: not gutil.env.production

# gulp-browserify doesn't support external option yet, see the prebundle
# section below
# https://github.com/deepak1556/gulp-browserify/issues/36
browserifyExternals = [
  'react'
]

vendorAssets = [
    name: 'leaflet-locatecontrol'
    base: 'vendor/leaflet-locatecontrol/src'
    assets: [
      src: '*.js'
    ,
      src: '*.css'
    ,
      src: 'css/**/*'
      dest: 'css/'
    ,
      src: 'font/**/*'
      dest: 'font/'
    ]
  ,
    name: 'leaflet'
    base: 'node_modules/leaflet/dist'
    assets: [
      src: '*.js'
    ,
      src: 'images/**/*'
      dest: 'images/'
    ,
      src: 'leaflet.css'
    ]
]

port = 3000
# allow to connect from anywhere
hostname = null
# change this to something unique if you want to run multiple projects
# side-by-side
lrPort = gutil.env.lrport or 35729

gulp.task 'livereload', ->
  server.listen lrPort, (err) ->
    gutil.log err if err

# Starts the webserver
gulp.task 'webserver', ->
  application = connect()
    # allows import of npm/bower resources
    .use connect.static nodeModulesPath
    .use connect.static bowerComponentsPath
    # Mount the mocha tests
    .use connect.static testBuildPath
  (http.createServer application).listen port, hostname

gulp.task 'coffee', ->
  gulp.src "#{appPath}/src/**/*.coffee"
    .pipe plumber()
    .pipe coffee bare: true
    .pipe gulp.dest "#{jsBuildPath}"

gulp.task 'scripts', ['coffee'], ->
  gulp.src "#{jsBuildPath}/index.js", read: false
    .pipe browserify browserifyOptions
    .on 'error', gutil.log
    .pipe rename 'index.js'
    .pipe if gutil.env.production then uglify() else gutil.noop()
    .pipe gulp.dest "#{webBuildPath}/src"
    .pipe refresh server

gulp.task 'test:scripts', ['scripts'], ->
  gulp.src "#{jsBuildPath}/test.js", read: false
    .pipe browserify browserifyOptions
      .on 'prebundle', (bundle) ->
        bundle.external ext for ext in browserifyExternals
    .on 'error', gutil.log
    .pipe rename 'test.js'
    .pipe gulp.dest "#{testBuildPath}/src"
    .pipe refresh server

gulp.task 'test:styles', ->
  gulp.src "node_modules/mocha/mocha.css"
    .pipe gulp.dest "#{testBuildPath}/styles"
    .pipe refresh server

# Compiles Sass files into css file
# and reloads the styles
gulp.task 'styles', ->
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

# Copy the HTML to web
gulp.task 'html', ->
  gulp.src "#{appPath}/index.html"
    # embeds the live reload script
    .pipe if gutil.env.production then gutil.noop() else embedlr port: lrPort
    .pipe gulp.dest "#{webBuildPath}"
    .pipe refresh server

# Copy the HTML to mocha
gulp.task 'test:html', ->
  gulp.src "#{appPath}/test.html"
    # embeds the live reload script
    .pipe embedlr()
    .pipe gulp.dest "#{testBuildPath}"
    .pipe refresh server

gulp.task 'watch', ['dist'], ->
  gulp.watch "#{appPath}/src/**", ['dist']
  gulp.watch "#{appPath}/test.html", ['html']
  gulp.watch "#{appPath}/plugin_manifest.json", ['dist']

gulp.task 'clean', ['clean:build', 'clean:dist']

gulp.task 'clean:build', ->
  gulp.src ["#{buildPath}"], read: false
    .pipe clean force: true

gulp.task 'clean:dist', ->
  gulp.src ["#{distPath}"], read: false
    .pipe clean force: true

gulp.task 'build', [
  'build:web'
  'build:test'
]

gulp.task 'build:web', [
  'build:vendor'
  'html'
  'styles'
  'scripts'
]

gulp.task 'build:test', [
  'test:html'
  'test:styles'
  'test:scripts'
]

gulp.task 'build:vendor', ->
  cyan = gutil.colors.cyan
  for vendor in vendorAssets
    gutil.log "Building vendor #{cyan vendor.base}"
    for asset in vendor.assets
      src = "#{vendor.base}/#{asset.src}"
      # some assets assume a particular path in the file structure
      dest = if asset.shared
        "#{buildPath}/#{asset.dest}"
      else
        "#{buildPath}/vendor/#{vendor.name}/#{asset.dest or ''}"
      gutil.log "\tCopying #{cyan src} to #{cyan dest}"
      gulp.src src
        .pipe gulp.dest dest

gulp.task 'dist', ['build'], ->
  gutil.log "\Distributing to #{distPath}"
  gulp.src "#{jsBuildPath}/index.js"
    .pipe browserify browserifyOptions
    .on 'prebundle', (bundle) ->
      bundle.external ext for ext in browserifyExternals
    .pipe gulp.dest distPath
  gulp.src "#{webBuildPath}/styles/index.css"
    .pipe gulp.dest distPath
  gulp.src "#{appPath}/plugin_manifest.json"
    .pipe gulp.dest distPath
  gulp.src "#{buildPath}/vendor/**/*"
    .pipe gulp.dest "#{distPath}/vendor"

gulp.task 'run:web', [
  'webserver'
  'livereload'
  'watch'
  'dist'
]

gulp.task 'run:test', ['coffee'], ->
  gulp.src "#{jsBuildPath}/test.js", read: false
    .pipe browserify browserifyOptions
    .on 'error', gutil.log
    .pipe mocha reporter: 'nyan'
    .on 'error', gutil.log

gulp.task 'default', ['build']
