Session = require '../../models/session'
UserError = require '../../models/usererror'

class SessionService

  # TODO: remove dependency upon ViewFactory
  constructor: (@factory) ->

  logIn: (userName, password, domain) =>
    new Promise (resolve, reject) =>
      # TODO: move this to UI layer
      @factory.pubSub.trigger 'showWait'

      trySession = new Session userName, password, domain

      trySession.save null,

        success: =>
          trySession.storeLocal()
          @factory.register 'session', trySession

          # backbone models are internal to core. Just return the attributes
          #   TODO: for now we're still registering the model with the @factory
          resolve trySession.attributes

        error: (model, response) =>
          # get the error message
          message = if response.responseJSON
            error = new UserError response.responseJSON
            error.get 'message'
          else if response.responseText
            response.responseText
          else if response.statusText is 'error'
            'Authentication failed! Cannot contact the server'
          else
            'Authentication failed! No message from the server'

          # TODO: move this to UI layer
          @factory.pubSub.trigger 'hideWait'
          @factory.pubSub.trigger 'displayNotification',
            {message, error, severity: 'error'}

          reject {message, error, severity: 'error'}

module.exports = SessionService
