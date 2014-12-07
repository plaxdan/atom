express = require 'express'
fs = require 'fs'
http = require 'http'
https = require 'https'
httpProxy = require 'http-proxy'
WebpackDevMiddleware = require 'webpack-dev-middleware'

$ = do require 'gulp-load-plugins'
{ red, cyan, blue, green, magenta } = $.util.colors

# config
listenPort = $.util.env.listenport or 4180
proxyAddress = $.util.env.proxy or 'http://ds5proxy.datasplice.com:4180'

module.exports = (compiler, paths) ->
  m = proxyAddress.match /(https?:\/\/)?([^:]*)(:\d+)?/
  proxyProtocol = m[1] or 'http://'
  isHttps = proxyProtocol is 'https://'
  proxyHost = m[2]
  proxyPort = (parseInt m[3]?.substring 1) or if isHttps then 443 else 4180

  proxyTarget =  "#{proxyProtocol}#{proxyHost}:#{proxyPort}"

  application = express()

  application.use (req, res, next) ->
    res.header 'Access-Control-Allow-Origin', '*'
    res.header 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE'
    next()

  # intercept plugin manifest request and reply with locally available files
  application.all '/ds/plugin/manifest.json', (req, res) ->
    # the first path in the list is the main www root
    pluginBase = "#{paths.plugins}"
    plugins = fs.readdirSync pluginBase
    manifest = for path in plugins
      # load the plug-in manifest
      require "#{pluginBase}/#{path}/package.json"
    res.send manifest

  proxyOptions = if isHttps
    changeOrigin: true
    target:
      https: true
  proxy = new httpProxy.RoutingProxy proxyOptions

  proxyRequest = (req, res) ->
    $.util.log cyan "Request to #{proxyTarget}#{req.url} (#{req.socket.remoteAddress})"

    # call into the proxy to forward the request along
    proxy.proxyRequest req, res,
      host: proxyHost
      port: proxyPort
      https: isHttps
      # using a buffer helps POSTs
      buffer: httpProxy.buffer req

  for path in [ 'ds', 'proxy', 'reports' ]
    application.all "/#{path}/*", proxyRequest

  # skeleton files are static, use webpack middleware to serve the app
  application.use express.static paths.skel
  application.use new WebpackDevMiddleware compiler,
    stats: { colors: true }

  $.util.log "Local server listening on port #{listenPort}"
  $.util.log "Service proxy: #{proxyTarget}"

  server = if isHttps or listenPort is 443
    credentials =
      key: fs.readFileSync 'server.key', 'utf8'
      cert: fs.readFileSync 'server.cert', 'utf8'
    https.createServer credentials, application
  else
    http.createServer application

  server.listen listenPort
