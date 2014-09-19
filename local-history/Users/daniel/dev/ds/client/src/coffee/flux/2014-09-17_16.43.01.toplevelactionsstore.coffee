Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

TopLevelActionsStore = Fluxxor.createStore

  initialize: (@factory) ->
    @state = {}

    # todo - the startup sequence isn't firing actions we can listen to
    # through the dispatcher, so we need to listen old-school
    @factory.pubSub.on 'sessionLoaded', =>
      @_updateCategories()

  getState: ->
    @state

  _updateCategories: ->
    { configurationManager } = @factory
    categories = configurationManager.getHomescreenCategories()
    categoryActions = {}
    async.eachSeries categories, (cat, done) =>
      ($.when configurationManager.getHomescreenActionsForCategory cat)
        .done (actions) ->
          if actions.length
            categoryActions[cat] = actions
          else
            categories = _.without categories, cat
        .always -> done()
    , =>
      @_setState { categories, categoryActions }

  _setState: (newState) ->
    extendedState = _.extend @state, newState
    @emit 'change'

module.exports = TopLevelActionsStore
