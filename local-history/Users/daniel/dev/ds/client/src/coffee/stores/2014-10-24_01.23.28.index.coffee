{FluxStores} = require '../constants'

ConnectionStore = require './connectionstore'
ScannerIntegratonStore = require './scannerintegratonstore'
ServerStore = require './serverstore'
SessionStore = require './sessionstore'
SettingsStore = require './settingsstore'
TopLevelActionsStore = require './toplevelactionsstore'

Stores = {}

  # Wire up the stores
  Stores[FluxStores.connection] = new ConnectionStore
  Stores[FluxStores.scannerintegraton] = new ScannerIntegratonStore
  Stores[FluxStores.server] = new ServerStore
  Stores[FluxStores.session] = new SessionStore
  Stores[FluxStores.settings] = new SettingsStore
  Stores[FluxStores.toplevelactions] = new TopLevelActionsStore

module.exports = Stores
