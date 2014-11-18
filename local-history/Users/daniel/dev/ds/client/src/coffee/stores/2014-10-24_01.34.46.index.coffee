{FluxStores} = require '../constants'

ConnectionStore = require './connectionstore'
ScannerIntegratonStore = require './scannerintegrationstore'
ServerStore = require './serverstore'
SessionStore = require './sessionstore'
SettingsStore = require './settingsstore'
TopLevelActionsStore = require './toplevelactionsstore'

Stores = {}

# Wire up the stores
Stores[FluxStores.Connection] = new ConnectionStore
Stores[FluxStores.ScannerIntegraton] = new ScannerIntegratonStore
Stores[FluxStores.Server] = new ServerStore
Stores[FluxStores.Session] = new SessionStore
Stores[FluxStores.Settings] = new SettingsStore
Stores[FluxStores.TopLevelActions] = new TopLevelActionsStore

module.exports = Stores
