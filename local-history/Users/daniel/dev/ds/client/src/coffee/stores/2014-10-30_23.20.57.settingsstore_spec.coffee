Fluxxor = require 'fluxxor'
SettingsStore = require './settingsstore'
{ FluxMessages } = require '../constants'

describe 'Settings Store', ->

  it 'should emit a changed event when the settings changed message is dispatched', (done) ->
    # listen for the store change event
    store = new SettingsStore
    store.on 'change', done

    # stub the dispatcher to fire the changed message
    flux = new Fluxxor.Flux [ store ],
      fireChanged: -> @dispatch FluxMessages.SETTINGS_CHANGED
    flux.intents.fireChanged()

  it 'should should store changed settings in its state', (done) ->
    stub =
      app: { first: 'value' }
      user: { second: 'other stuff', third: 3 }

    store = new SettingsStore
    store.on 'change', ->
      state = store.getState()
      expect(state).to.deep.equal stub
      done()

    flux = new Fluxxor.Flux [ store ],
      fireChanged: (settings) ->
        @dispatch FluxMessages.SETTINGS_CHANGED, settings
    flux.intents.fireChanged stub
