# set up the environment, shared libararies, etc
require './environment'

AppLoader = require './apploader'
LoadingStatus = require './loadingstatus'

unless window.DISABLE_APP_LOADER
  slowLoad = false
  appLoaded = false

  mountPoint = document.querySelector '#app'
  uiProps = {}
  renderUI = (newProps) ->
    _.assign uiProps, newProps
    # inhibit progress and status unless we have an error or the app is loading
    # slowly
    return unless uiProps.error or slowLoad

    React.renderComponent (LoadingStatus uiProps), mountPoint

  # wait half a second before enabling the progress UI to keep things less flashy
  setTimeout ->
    unless appLoaded
      slowLoad = true
      renderUI()
  , 500

  (AppLoader.loadApp
      skip: [ 'test.js' ]
      progress: (notification) ->
        renderUI progress: notification
      delay: 1000)
    .then ->
      appLoaded = true
    .catch (error) ->
      console.error error
      renderUI error: error.message or error
