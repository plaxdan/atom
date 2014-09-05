module.exports = (factory) ->
  SessionService: new (require './sessionservice') factory
  # other services go here
