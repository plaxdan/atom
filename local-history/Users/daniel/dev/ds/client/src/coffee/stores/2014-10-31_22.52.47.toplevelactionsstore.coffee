Fluxxor = require 'fluxxor'
{FluxMessages} = require '../constants'

TopLevelActionsStore = Fluxxor.createStore

  initialize: (@legacyFactory) ->
    @state = {}
    @bindActions FluxMessages.SESSION_CREATED, @_updateCategories,
      FluxMessages.SESSION_RESUMED, @_updateCategories,
      FluxMessages.SESSION_DESTROYED, @_scorchEarth,

  getState: ->
    @state

  _scorchEarth: ->
    @state = {}
    @emit 'change'

  _updateCategories: (payload, fluxMessage) ->
    vc = @legacyFactory.session.get 'views'
    { configurationManager } = @legacyFactory
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
