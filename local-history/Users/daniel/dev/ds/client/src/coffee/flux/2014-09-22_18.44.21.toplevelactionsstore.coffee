Fluxxor = require 'fluxxor'
{FluxMessages} = require './constants'

TopLevelActionsStore = Fluxxor.createStore

  initialize: (@factory) ->
    @state = {}
    @bindActions FluxMessages.SESSION_LOADED, @_updateCategories

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
