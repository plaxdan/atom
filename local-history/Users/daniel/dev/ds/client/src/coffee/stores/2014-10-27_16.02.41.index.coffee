{FluxStores} = require '../constants'

ConnectionStore = require './connectionstore'
RouteStore = require './routestore'
ScannerIntegrationStore = require './scannerintegrationstore'
ServerStore = require './serverstore'
SessionStore = require './sessionstore'
SettingsStore = require './settingsstore'
TopLevelActionsStore = require './toplevelactionsstore'

Stores = (legacyFactory) ->

  stores = {}

  # Wire up the stores
  stores[FluxStores.Connection] = new ConnectionStore
  stores[FluxStores.Route] = new RouteStore
  stores[FluxStores.ScannerIntegration] = new ScannerIntegrationStore
  stores[FluxStores.Server] = new ServerStore
  stores[FluxStores.Session] = new SessionStore
  stores[FluxStores.Settings] = new SettingsStore
  stores[FluxStores.TopLevelActions] = new TopLevelActionsStore legacyFactory

  stores

module.exports = Stores