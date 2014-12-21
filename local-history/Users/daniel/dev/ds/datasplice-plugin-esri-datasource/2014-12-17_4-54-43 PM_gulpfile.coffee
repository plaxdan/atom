del = require 'del'
exec = (require 'child_process').exec
gulp = require 'gulp'
path = require 'path'
$ = do require 'gulp-load-plugins'

projectPath     = "#{path.resolve __dirname}"
paths =
  solution:    "#{projectPath}/EsriDataSourcePlugin.sln"
  plugin:      "#{projectPath}/EsriDataSourcePlugin/bin/Release/EsriDataSourcePlugin.dll"
  tests:       "#{projectPath}/EsriDataSourcePluginTests/bin/Release/EsriDataSourcePluginTests.dll"
  testResults: "#{projectPath}/tests.trx"
  distBase:    "#{projectPath}/dist/"
  dist:        "#{projectPath}/dist/Server/"
  leaflet:     "#{projectPath}/../datasplice-plugin-leaflet/dist/*"
  release:     "#{projectPath}/release/"
  zip:         "datasplice-gis.zip"

execute = (command, cb) ->
  exec command, (error, stdout, stderr) ->
    console.log "stderr: #{stderr}"
    console.log "stdout: #{stdout}"
    cb()

gulp.task 'clean', (cb) ->
  del [paths.testResults, paths.distBase], cb

gulp.task 'build', ['clean'], (cb) ->
  execute "call msbuild #{paths.solution} /p:Configuration=Release;TargetFrameworkVersion=v3.5 /target:Clean,Build", cb

gulp.task 'test', ['build'], (cb) ->
  execute "call mstest /nologo /testcontainer:#{paths.tests} /resultsfile:#{paths.testResults} /runconfig:testrunconfig.testrunconfig", cb

gulp.task 'dist', ['test'], (cb) ->
  gulp.src paths.plugin
    .pipe gulp.dest paths.dist

gulp.task 'ci', ['dist']

gulp.task 'release', ['ci'], ->
  gulp.src "#{paths.distBase}/*"
    .pipe $.zip paths.zip
    .pipe gulp.dest paths.release
