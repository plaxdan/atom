del = require 'del'
exec = (require 'child_process').exec
gulp = require 'gulp'
path = require 'path'

projectPath     = "#{path.resolve __dirname}"
paths =
  solution:    "#{projectPath}/EsriDataSourcePlugin.sln"
  plugin:      "#{projectPath}/EsriDataSourcePlugin/bin/Release/EsriDataSourcePlugin.dll"
  tests:       "#{projectPath}/EsriDataSourcePluginTests/bin/Release/EsriDataSourcePluginTests.dll"
  testResults: "#{projectPath}/tests.trx"
  distBase:    "#{projectPath}/dist/"
  dist:        "#{projectPath}/dist/Server/"


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
  execute "call mstest /testcontainer:#{paths.tests} /resultsfile:#{paths.testResults}", cb

gulp.task 'dist', ['test'], (cb) ->
  gulp.src paths.plugin
    .pipe gulp.dest paths.dist

gulp.task 'ci', ['dist']
