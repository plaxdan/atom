

class SplicerService

  constructor: (@serverAddress) ->

  getSession: ->
    new Promise (resolve, reject) =>
      resolve 'session'
