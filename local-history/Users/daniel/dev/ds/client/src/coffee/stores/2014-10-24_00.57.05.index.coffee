ConnectionStore = require './connectionstore'
ScannerIntegratonStore = require './scannerintegratonstore'
ServerStore = require './serverstore'
SessionStore = require './sessionstore'
SettingsStore = require './settingsstore'
TopLevelActionsStore = require './toplevelactionsstore'

Stores = ->

  # Wire up the stores
  connection: new ConnectionStore
  scannerintegraton: new ScannerIntegratonStore
  server: new ServerStore
  session: new SessionStore
  settings: new SettingsStore
  toplevelactions: new TopLevelActionsStore

module.exports = Stores
