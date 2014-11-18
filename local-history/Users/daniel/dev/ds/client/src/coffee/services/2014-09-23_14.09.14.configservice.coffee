class ConfigService

  constructor: (@_factory) ->

  # Usage:
  # configService.getActions session,
  #   DSActions.HomeScreenActions, groupBy: 'category'
  getActions: (session, dsActionType, options) ->
    new Promise (resolve, reject) ->
      {groupBy} = options

      # TODO: we just assume that the config has alread been loaded here
      # should we cater for loading or refreshing it from within this function?
      config = session.get 'views'
      return reject() unless config

      processConfig = (accumulator, candidate) ->
        # Example: (candidate.get 'navigationActions')['HomeScreenActions']
        actions = (candidate.get 'navigationActions')?[dsActionType]
        if actions?
          return accumulator.push actions... if _.isArray accumulator
          for action in actions
            group = action[groupBy]
            # ignore if the action does not have a non-empty group field
            if group
              accumulator[group] or= []
              accumulator[group].push action

      # If grouping then accumulate an object with actions keyed on each group
      # otherwise just accumulate an array of actions (with no grouping).
      accumulator = if groupBy? then {} else []
      groups = _.reduce config.models, processConfig, accumulator



  loadConfig: (session) ->
    config = session.get 'views'
    weHaveNoConfig = config.length is 0
    if weHaveNoConfig
      loadLocal = false # TODO <-- HOW TO SET THIS?
      load = if loadLocal then @_loadLocal else @_loadRemote
      load config
    else
      Promise.resolve config

  _loadLocal: (config) ->
    new Promise (resolve, reject) =>
      Promise.resolve config.storage.getKeys /^ds\/views\/get/
      .then (keys) ->
        createConfigForKey = (key, done) ->
          [m, id] = key.match /ds\/views\/get\/(.*)/
          newConfig = config.create { id }
          Promise.resolve newConfig.loadLocal()
          .then -> done()
        doneAllKeys = -> resolve config
        async.each keys, createConfigForKey, doneAllKeys

  _loadRemote: (config) ->
    new Promise (resolve, reject) ->
      config.fetch
        success: =>
          async.each config.models,
            (view, done) ->
              # use the locally cached view if available and the checksum
              # matches
              checksum = view.get 'checksum'
              Promise.resolve view.loadLocal()
              .then (loaded) ->
                if loaded and checksum is view.get 'checksum'
                  done()
                else
                  view.fetch
                    bypassCache: true
                    success: ->
                      # response for individual views does not contain the
                      # checksum
                      view.set { checksum }
                      view.storeLocal()
                      done()
                    error: (model) =>
                      console.error "Error resolving view #{model.id}"
                      done()
            # async complete
            , ->
              resolve()
        error: ->
          console.error 'Error fetching views'
          # TODO: shouldn't this reject instead of resolving?
          resolve()

module.exports = ConfigService
