_ = require 'lodash'
path = require 'path'
gulp = require 'gulp'
$ = do require 'gulp-load-plugins'
runSequence = require 'run-sequence'
webpack = require 'webpack'
fs = require 'fs'
mkdirp = require 'mkdirp'
tinylr = do require 'tiny-lr'
proxyServer = require './tasks/proxyserver'

# config

{ red, cyan, blue, green, magenta } = $.util.colors

projectPath = "#{path.resolve __dirname}"
srcPath     = "#{projectPath}/src"
buildPath   = "#{projectPath}/build"
distPath    = $.util.env.distpath or "#{projectPath}/dist"

jsBuildPath     = "#{buildPath}/js"
webBuildPath    = "#{buildPath}/web"
pluginsPath     = "#{webBuildPath}/plugins"

vendorBundlePath = "#{webBuildPath}/vendor"
vendorBundleFileName = 'vendor.bundle.js'

lrPort = $.util.env.lrport or 35729

vendorAssets = [
  {
    name: 'fontawesome'
    base: './bower_components/font-awesome/font'
    dest: "#{webBuildPath}/font/"
    assets: [
      '*.*'
    ]
  }
  {
    name: 'jquery.atwho'
    base: './bower_components/jquery.atwho/dist'
    assets: [
      src: 'js/jquery.atwho.min.js'
      bundle: true
    ,
      'css/jquery.atwho.min.css'
    ]
  }
  {
    name: 'slickgrid'
    base: './bower_components/slickgrid'
    bundle: true
    assets: [
      'lib/jquery.event.drag-2.2.js'
      'slick.core.js'
      'plugins/slick.cellrangedecorator.js'
      'plugins/slick.cellrangeselector.js'
      'plugins/slick.rowselectionmodel.js'
      'slick.formatters.js'
      'slick.editors.js'
      'slick.grid.js'
    ,
      src: 'slick.grid.css'
    ]
  }
  {
    name: 'select2'
    base: './bower_components/select2'
    assets: [
      src: 'select2.js'
      bundle: true
    ,
      src: 'select2.css'
      dest: 'styles'
    ,
      src: 'select2-responsive.css'
      dest: 'styles'
    ]
  }
  {
    name: 'Placeholders.js'
    base: './bower_components/Placeholders.js/lib'
    bundle: true
    assets: [
      'utils.js'
      'main.js'
    ]
  }
  {
    name: 'bootstrap-scripts'
    base: './bower_components/bootstrap/js'
    bundle: true
    assets: [
      'bootstrap-collapse.js'
    ]
  }
  {
    name: 'bootstrap-responsive-dropdown'
    base: './bower_components/bootstrap-responsive-dropdown/js'
    bundle: true
    assets: [
      'bootstrap-responsive-dropdown.js'
    ]
  }
  {
    name: 'bootstrap-datetimepicker'
    base: './bower_components/bootstrap-datetimepicker/src/js'
    bundle: true
    assets: [
      'bootstrap-datetimepicker.js'
    ]
  }
  {
    name: 'mocha'
    base: './node_modules/mocha'
    assets: [
      'mocha.js'
      'mocha.css'
    ]
  }
]

webpackConfig =
  cache: true
  entry:
    shared: "#{srcPath}/coffee/shared.coffee"
    index: "#{srcPath}/coffee/index.coffee"
    test: "#{srcPath}/coffee/test.coffee"
  output:
    path: "#{webBuildPath}/src"
    filename: '[name].js'
  resolve:
    extensions: [
      ''
      '.coffee'
      '.js'
    ]
  module:
    loaders: [
      test: /\.coffee$/, loader: 'coffee-loader'
    ]
  plugins: [
    new webpack.optimize.CommonsChunkPlugin 'lib.js', null, 2
    # expose common libraries globally so they don't have to be required
    new webpack.ProvidePlugin
      _: 'lodash'
      async: 'async'
      React: 'react/addons'
      $: 'jquery'
      moment: 'moment'
  ]

# create a single webpack compiler to allow caching
srcCompiler = _.memoize ->
  if $.util.env.production
    # even though we have source maps, the uglify plug-in slows the build
    # down considerable so only use it with production flag
    webpackConfig.plugins.push new webpack.optimize.UglifyJsPlugin
  else
    webpackConfig.plugins.push new webpack.DefinePlugin DEBUG: true
    webpackConfig.devtool = 'sourcemap' unless $.util.env.nosourcemap
    webpackConfig.debug = true
  webpack webpackConfig

# top-level tasks

gulp.task 'default', [ 'build' ]

gulp.task 'clean', [ 'clean:build', 'clean:dist' ]

gulp.task 'build', [ 'build:web', 'build:tests', 'build:offlinemanifest' ]

gulp.task 'dist', [ 'dist:web' ]

# clean tasks

gulp.task 'clean:build', ->
  gulp.src ["#{buildPath}"], read: false
    .pipe $.rimraf force: true

gulp.task 'clean:dist', ->
  gulp.src ["#{distPath}"], read: false
    .pipe $.rimraf force: true

# build tasks

gulp.task 'build:web', [
  'build:src'
  'build:images'
  'build:styles'
  'build:html'
  'build:plugins'
]

gulp.task 'build:src', ['build:vendor'], (cb) ->
  srcCompiler().run (err, stats) ->
    $.util.log 'build:src', stats.toString colors: true
    cb err

gulp.task 'build:images', ->
  gulp.src "#{srcPath}/img/**/*"
    .pipe gulp.dest "#{webBuildPath}/img"

gulp.task 'build:styles', ->
  lessOpts =
    sourceMap: true unless $.util.env.nosourcemap
  gulp.src "#{srcPath}/style/*.less"
    .pipe $.less lessOpts
    .pipe gulp.dest "#{webBuildPath}/styles"

gulp.task 'build:html', ->
  indexParams = ->
    # file contains 4 digit build number, only want the 3 most significant
    buildVersion = fs.readFileSync 'build_version.txt'
    params = {}
    [params.version] = (String buildVersion).match /^(\d+\.\d+\.\d+)/
    params.timestamp = (new Date).toJSON()
    params.manifest = if $.util.env.nomanifest
      ''
    else
      'manifest="offline.manifest"'
    params
  gulp.src "#{srcPath}/html/index.html"
    # embeds the live reload script
    .pipe if $.util.env.production or $.util.env.nolr
        $.util.noop()
      else
        $.embedlr port: lrPort
    .pipe $.template indexParams()
    .pipe gulp.dest webBuildPath
  # copy additional static resources
  gulp.src [ "#{srcPath}/html/favicon.ico", "#{srcPath}/html/dynamic.json" ]

gulp.task 'build:tests', [ 'build:src', 'build:vendor' ], ->
  gulp.src "#{srcPath}/html/test.html"
    # embeds the live reload script
    .pipe if $.util.env.nolr then $.util.noop() else $.embedlr port: lrPort
    .pipe gulp.dest webBuildPath

gulp.task 'build:plugins', (cb) ->
  # make sure the plugins folder exists
  mkdirp pluginsPath, cb

# offline.manifest uses lodash templating
gulp.task 'build:offlinemanifest', (cb) ->
  if $.util.env.nomanifest
    cb()
  else
    # todo - seems like this should be stream-y
    fs.readdir pluginsPath, (err, paths) ->
      paths or= []
      pluginResources = _.flatten( for plugin in paths
        manifest = require "#{pluginsPath}/#{plugin}/package.json"
        base = "plugins/#{plugin}"
        resources = []
        $.util.log cyan "#{base}:"
        resources.push "#{base}/#{manifest.main}"
        if manifest.files
          resources.push "#{base}/#{resource}" for resource in manifest.files
        resources
      )

      timestamp = (new Date).toJSON()
      $.util.log magenta "Updating offline manifest: #{timestamp}"
      gulp.src "#{srcPath}/html/offline.manifest"
        .pipe $.template { timestamp, plugins: pluginResources }
        .pipe gulp.dest webBuildPath
        .on 'end', cb

# Grabs assets from vendors
# - Vendors may have a dest or bundle=true but not both
# - Assets may have a dest or bundle=true but not both
# - Vendor dest defaults to "#{webBuildPath}/vendor/#{vendor.name}"
# - Asset dest defaults to "#{vendor.dest}"
# - If asset is a string, the string becomes asset.src
# - asset.src is always relative to vendor.base
gulp.task 'build:vendor', ->
  vendorBundle = []
  vendorBundleRelativeFilePath =
    "#{path.relative '.', vendorBundlePath}/#{vendorBundleFileName}"
  for vendor in vendorAssets
    $.util.log cyan "#{vendor.name}:"
    if vendor.dest and vendor.bundle
      $.util.log red "#{vendor.name} error - you can have dest or bundle \
      but not both"
      return false

    vendor.dest or= "#{webBuildPath}/vendor/#{vendor.name}"

    # process each asset
    for asset in vendor.assets
      if asset.dest and asset.bundle
        $.util.log red "#{asset.src} error - you can have dest or bundle \
        but not both"
        return false

      if _.isString asset
        asset = src: "#{vendor.base}/#{asset}"
        asset.dest = vendor.dest
        asset.bundle = true if vendor.bundle
      else if _.isObject asset
        asset.src = "#{vendor.base}/#{asset.src}"
        if asset.dest?
          asset.dest = "#{vendor.dest}/#{asset.dest}"
        else
          asset.bundle = true if vendor.bundle

      assetRelativeSrcPath = path.relative '.', asset.src
      nextAssetDirName = path.dirname assetRelativeSrcPath
      assetBaseName = path.basename assetRelativeSrcPath

      if nextAssetDirName isnt assetDirName
        $.util.log blue "  #{nextAssetDirName}/"

      assetDirName = nextAssetDirName

      if asset.bundle
        vendorBundle.push asset.src
        $.util.log "    #{assetBaseName} #{magenta '->'} \
          #{vendorBundleRelativeFilePath}"
      else
        (gulp.src asset.src).pipe gulp.dest asset.dest
        $.util.log "    #{assetBaseName} #{magenta '->'} \
          #{green path.relative '.', asset.dest}"

  # concat files to script if eligible
  # minify concatenated file if necessary
  if vendorBundle.length > 0
    gulp.src vendorBundle
      .pipe $.concat vendorBundleFileName
      .pipe if $.util.env.production then $.uglify() else $.util.noop()
      .pipe gulp.dest vendorBundlePath

# run tasks

gulp.task 'run:server', [ 'build', 'watch' ], ->
  tinylr.listen lrPort, (err) -> $.util.log err if err
  $.util.log "Live reload server listening on port #{lrPort}"
  proxyServer [ webBuildPath ]

gulp.task 'watch', [ 'build' ], (cb) ->
  # create a callback that runs the specified build task and then updates
  # the offline manifest and reloads the browser
  doReload = (task) ->
    -> runSequence task, 'build:offlinemanifest', 'livereload'

  gulp.watch "#{projectPath}/build_version.txt", doReload 'build:html'
  gulp.watch "#{srcPath}/html/index.html", doReload 'build:html'
  gulp.watch "#{srcPath}/coffee/**/*.coffee", doReload 'build:src'
  gulp.watch "#{srcPath}/style/**", doReload 'build:styles'
  gulp.watch "#{srcPath}/coffee/**/*.less", doReload 'build:styles'

  # watch the plugins folder for changes and rebuild the offline manifest
  # the hack to only run this after the first time it is called is to fix
  # https://github.com/DataSplice/datasplice-client/issues/137
  # seems pretty ugly, but it's not worth spending more time figuring out at
  # this point
  first = true
  $.watch name: 'Plug-in watcher', glob: "#{pluginsPath}/**", (files) ->
    if first
      first = false
    else
      runSequence 'build:offlinemanifest', 'livereload'

  cb()

gulp.task 'livereload', ->
  tinylr.changed
    body:
      files: [ 'index.html', 'test.html' ]

  gulp.start 'run:tests' if $.util.env.mocha

gulp.task 'run:tests', [ 'build' ], ->
  gulp.src "#{webBuildPath}/test.html"
    .pipe $.mochaPhantomjs reporter: 'dot'

# env tasks - allows setting of $.util.env prior to running other tasks
gulp.task 'env:production', ->
  $.util.env.production = true

# dist tasks
gulp.task 'dist:web', [ 'env:production', 'build:web', 'build:offlinemanifest' ], ->
  gulp.src "#{webBuildPath}/**/*"
    .pipe gulp.dest distPath
