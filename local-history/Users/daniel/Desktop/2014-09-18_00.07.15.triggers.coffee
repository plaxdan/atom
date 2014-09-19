activeCellChanged
barcodeScan
cacheMiss
commitCurrentEdit
connectionStateChanged
createRecord
currentEventContext
dataSync
defaultCommand
displayError
displayHome
displayModal
displayNavigationAction
displayNotification
displayPrompt
displaySettings
fetchError
fetchQuery
field
hideWait
initialized
logOut
loggedOut
markDeleted
recordCreated
recordModified
recordRemoved
rendered
resetRecord
resolved
restartSession
scroll
selectedRowsChanged
  serverError
  serverLoaded
  sessionError
  sessionLoaded
showWait
stack
sync
toggleDetails
verifyRecordChanges

'/application.coffee' = trigger 'displayNotification',
'/application.coffee' = trigger 'displayNotification',
'/application.coffee' = trigger 'displayModal', ModalDialog
'/application.coffee' = trigger 'displayError', details if details
'/connectionmanager.coffee' = trigger 'displayNotification', message: options.message
'/connectionmanager.coffee' = trigger 'restartSession', { promise }
'/connectionmanager.coffee' = trigger 'displayModal', ConfirmPasswordPrompt
'/connectionmanager.coffee' = trigger 'displayNotification',
'/connectionmanager.coffee' = trigger 'displayModal', ConfirmPasswordPrompt
'/connectionmanager.coffee' = trigger 'displayModal',
'/connectionmanager.coffee' = trigger 'logOut', force: true
'/connectionmanager.coffee' = trigger 'displayNotification',
'/connectionmanager.coffee' = trigger 'displayError', new UserError { message }
'/connectionmanager.coffee' = trigger 'displayNotification',
'/connectionmanager.coffee' = trigger 'restartSession', authenticated: wasEmpty
'/connectionmanager.coffee' = trigger 'connectionStateChanged'
'/connectionmanager.coffee' = trigger 'displayNotification', message: response.message
'/connectionmanager.coffee' = trigger 'sync.offlineData', response.data, (error) ->
'/connectionmanager.coffee' = trigger 'sync.purgeRecords', response.purgeRecords, (error) ->
'/connectionmanager.coffee' = trigger 'displayError', new UserError response.error
'/connectionmanager.coffee' = trigger 'displayModal', @_syncStatus
'/connectionmanager.coffee' = trigger 'sync.complete'
'/controller.coffee' = trigger 'showWait'
'/controller.coffee' = trigger 'serverLoaded'
'/controller.coffee' = trigger 'serverLoaded'
'/controller.coffee' = trigger 'serverError'
'/controller.coffee' = trigger 'hideWait'
'/controller.coffee' = trigger 'displayNotification',
'/controller.coffee' = trigger 'displayNotification',
'/controller.coffee' = trigger 'hideWait'
'/controller.coffee' = trigger 'sessionError'
'/controller.coffee' = trigger 'showWait'
'/controller.coffee' = trigger 'hideWait'
'/controller.coffee' = trigger 'showWait'
'/controller.coffee' = trigger 'hideWait'
'/controller.coffee' = trigger 'restartSession', authenticated: true
'/controller.coffee' = trigger 'hideWait'
'/controller.coffee' = trigger 'displayNotification',
'/controller.coffee' = trigger 'displayModal',
'/controller.coffee' = trigger 'loggedOut'
'/controller.coffee' = trigger 'sessionLoaded', options
'/controller.coffee' = trigger 'hideWait'
'/data/binaryresourcehandler.coffee' = trigger 'displayModal',
'/data/binaryresourcehandler.coffee' = trigger 'displayNotification',
'/data/binaryresourcehandler.coffee' = trigger 'displayModal',
'/data/datacontroller.coffee' = trigger 'displayNotification',
'/data/datacontroller.coffee' = trigger 'displayNotification',
'/data/displaystatecontroller.coffee' = trigger 'stack:push', childState unless options?.silent
'/data/displaystatecontroller.coffee' = trigger 'stack:pop', oldChild unless options?.silent
'/data/displaystatecontroller.coffee' = trigger 'displayModal',
'/data/displaystatecontroller.coffee' = trigger 'displayModal',
'/data/displaystatecontroller.coffee' = trigger 'showWait'
'/data/displaystatecontroller.coffee' = trigger 'hideWait'
'/data/displaystatecontroller.coffee' = trigger 'displayNotification',
'/data/displaystatecontroller.coffee' = trigger 'commitCurrentEdit'
'/data/displaystatecontroller.coffee' = trigger 'displayModal', ModalDataAction
'/data/modificationhandler.coffee' = trigger 'recordRemoved', record
'/data/modificationhandler.coffee' = trigger 'displayModal', status
'/data/modificationhandler.coffee' = trigger 'displayNotification',
'/data/modificationhandler.coffee' = trigger 'recordModified', record, fieldNames
'/data/modificationhandler.coffee' = trigger 'recordCreated', record
'/data/modificationhandler.coffee' = trigger 'recordModified', record
'/data/modificationhandler.coffee' = trigger 'recordModified', record
'/data/modificationhandler.coffee' = trigger 'displayModal', ModalRecordAction
'/data/modificationhandler.coffee' = trigger 'displayModal',
'/event/displaystateinterface.coffee' = trigger 'field:select', field
'/event/displaystateinterface.coffee' = trigger 'field:edit', field, action
'/event/eventhandler.coffee' = trigger 'displayModal',
'/event/eventhandler.coffee' = trigger 'displayPrompt',
'/event/eventhandler.coffee' = trigger 'showWait', message: action.statusLabelOption
'/event/eventhandler.coffee' = trigger 'hideWait'
'/expressions/configurationmanager.coffee' = trigger 'displayNotification',
'/expressions/configurationmanager.coffee' = trigger 'displayNotification',
'/expressions/configurationmanager.coffee' = trigger 'displayNotification',
'/expressions/contextfunctionhandler.coffee' = trigger 'currentEventContext', (context) =>
'/expressions/contextfunctionhandler.coffee' = trigger 'displayModal',
'/expressions/contextfunctionhandler.coffee' = trigger 'dataSync'
'/expressions/contextfunctionhandler.coffee' = trigger 'logOut', logoutOptions
'/expressions/contextfunctionhandler.coffee' = trigger 'displayHome'
'/hardware/barcodescannercontroller.coffee' = trigger 'currentEventContext', (context) ->
'/hardware/barcodescannercontroller.coffee' = trigger 'barcodeScan', scanResult
'/hardware/barcodescannercontroller.coffee' = trigger 'barcodeScan', results.text,
'/hardware/barcodescannercontroller.coffee' = trigger 'displayNotification',
'/hardware/barcodescannercontroller.coffee' = trigger 'barcodeScan', results.data
'/hardware/barcodescannercontroller.coffee' = trigger 'barcodeScan', @_scanData
'/hardware/barcodescannercontroller.coffee' = trigger 'displayModal', SimulateScannerPrompt
'/hardware/barcodescannercontroller.coffee' = trigger 'barcodeScan', input,
'/hardware/barcodescannercontroller.coffee' = trigger 'barcodeScan', data, { symbology }
'/models/dataset.coffee' = trigger 'cacheMiss', @, index: key
'/models/dataset.coffee' = trigger 'createRecord', @, options
'/models/query.coffee' = trigger 'fetchQuery', @
'/models/query.coffee' = trigger 'fetchQuery', @, options, ->
'/models/query.coffee' = trigger 'fetchError', @, error
'/models/query.coffee' = trigger 'resolved', @
'/models/query.coffee' = trigger 'resolved', @
'/models/record.coffee' = trigger 'verifyRecordChanges', @, changes,
'/models/record.coffee' = trigger 'resetRecord', @ if @modification
'/models/record.coffee' = trigger 'markDeleted', @
'/models/recordmodification.coffee' = trigger 'recordModified', record if not options?.silent
'/models/recordmodification.coffee' = trigger 'recordModified', record if not options?.silent
'/ui/data/modalrecordaction.coffee' = trigger 'displayError', error if error
'/ui/feedback/offlinesyncstatus.coffee' = trigger 'displayModal', PostponedErrors
'/ui/feedback/userprompt.coffee' = trigger 'displayNotification',
'/ui/feedback/userprompt.coffee' = trigger 'displayNotification',
'/ui/feedback/userprompt.coffee' = trigger 'rendered'
'/ui/header.coffee' = trigger 'dataSync'
'/ui/header.coffee' = trigger 'logOut'
'/ui/header.coffee' = trigger 'displaySettings'
'/ui/header.coffee' = trigger 'displaySettings', 'modifications'
'/ui/header.coffee' = trigger 'displayModal', ModalRecordAction
'/ui/header.coffee' = trigger 'displayNavigationAction', action
'/ui/startcenter.coffee' = trigger 'displayNavigationAction', action, controller
'/views/common/baseform.coffee' = trigger 'sync', @input.binding.key
'/views/common/inputbehavior.coffee' = trigger 'displayModal', editor
'/views/common/inputbehavior.coffee' = trigger 'showWait'
'/views/common/inputbehavior.coffee' = trigger 'hideWait'
'/views/common/inputbehavior.coffee' = trigger 'displayModal',
'/views/common/inputcontrolfactory.coffee' = trigger 'displayModal', ModalDataAction
'/views/common/slickgridview.coffee' = trigger 'scroll', event, details
'/views/common/slickgridview.coffee' = trigger 'selectedRowsChanged', ev, cell
'/views/common/slickgridview.coffee' = trigger 'activeCellChanged', ev, cell
'/views/data/datagridview.coffee' = trigger 'defaultCommand'
'/views/data/datagridview.coffee' = trigger 'toggleDetails'
'/views/data/datagridview.coffee' = trigger 'initialized'
'/views/data/datasearchview.coffee' = trigger 'defaultCommand'
'/views/settings/appaboutview.coffee' = trigger 'displayModal', UpdatePasswordPrompt
'/views/settings/appaboutview.coffee' = trigger 'displayNotification',
'/views/settings/datamanagement.coffee' = trigger 'displayModal',
'/views/settings/datamanagement.coffee' = trigger 'displayModal',
'/views/settings/datamanagement.coffee' = trigger 'displayNotification',
'/views/settings/datamanagement.coffee' = trigger 'displayModal', ModalDataAction
'/views/settings/datamanagement.coffee' = trigger 'displayModal',
'/views/settings/datamanagement.coffee' = trigger 'displayModal',
'/views/settings/localmodifications.coffee' = trigger 'displayModal',
'/views/settings/localmodifications.coffee' = trigger 'displayNotification',
'/views/settings/localmodifications.coffee' = trigger 'displayModal', ModalRecordAction
