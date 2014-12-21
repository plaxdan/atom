InteractionIntents = (pubSub) ->

  doPrompt = (options) ->
    new Promise (resolve, reject) ->
      promise = new $.Deferred
      pubSub.trigger 'displayModal',
        title: options.title
        body: options.body
        buttons: [
          { label: options.resolveLabel, class: 'btn-primary', role: 'accept' }
          { label: options.rejectLabel, role: 'cancel' }
        ]
        promise: promise
      promise.then resolve, reject

  # display a prompt asking the user to confirm or cancel an action
  # title - title of the prompt dialog
  # body - body/message of the prompt
  # resolveLabel - label of button to confirm the prompt
  # rejectLabel - label of button to cancel the prompt
  prompt: (options) ->
    doPrompt options

  # common variants
  yesNoPrompt: (options) ->
    doPrompt _.assign
      resolveLabel: 'Yes'
      rejectLabel: 'No'
    , options
  okCancelPrompt: (options) ->
    doPrompt _.assign
      resolveLabel: 'OK'
      rejectLabel: 'Cancel'
    , options

  # show a waiting/progress spinner - this returns an 'end' callback that should
  # be used to stop the spinner
  showWait: ->
    pubSub.trigger 'showWait'

    # return an object with an end callback
    end: -> pubSub.trigger 'hideWait'

  # displays an error message to the user
  error: (message) ->
    pubSub.trigger 'displayNotification', message, severity: 'error'

module.exports = InteractionIntents
