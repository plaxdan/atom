# Hardware Settings View
#
# Exposes settings for the various devices that can interact with DataSplice
# (bar code scanners, cameras, etc)
BaseView = require '../common/baseview'
BaseFormView = require '../common/baseform'
ReactViewMixin = require '../mixins/reactviewmixin'
OtherKup = require '../../utils/otherkup'

{ Stores } = require '../../constants'
ScannerSettings = require '../../ui/settings/scannersettings'

{
  InputBehavior
  NumericInputBehavior
  CheckboxInputBehavior
} = require '../common/inputbehavior'

class HardwareSettingsView extends BaseView
  className: 'accordion'

  initialize: (options) ->
    super

  render: ->
    ok = new OtherKup @

    ok.accordionGroup
      id: 'barcode'
      heading: (ok) -> ok.strong style: 'font-size: 150%', 'Scanner Integration'
      body: (ok) =>
        view = @registerChildView @options.factory.create BarCodeSettingsView
        ok.append view.render()

    ok.accordionGroup
      id: 'camera'
      heading: (ok) -> ok.strong style: 'font-size: 150%', 'Camera Settings'
      body: (ok) =>
        view = @registerChildView @options.factory.create CameraSettingsView

        ok.append view.render()

    @

class BarCodeSettingsView extends BaseView

  # add React-sauce
  @mixin ReactViewMixin

  reactComponent: ScannerSettings

  getDefaultProps: ->
    { flux } = @options
    _.extend
      updateScannerConfig: flux.actions.hardware.updateScannerConfig
      showScannerSettings: flux.actions.hardware.showScannerSettings
      hardwareService: @options.hardwareService
    , @_scannerStore().getState()

  initialize: (options) ->
    super

    @_boundRender = _.bind @render, @
    @_scannerStore().addListener 'change', @_boundRender

  gc: ->
    @forceUnmount()
    @_scannerStore().removeListener 'change', @_boundRender

  _scannerStore: ->
    @options.flux.store Stores.ScannerIntegration

class BarCodeScannerOptionsView extends BaseFormView

  initialize: (options) ->
    super
    {@controller} = @options

    @typeToBehavior =
      'integer': NumericInputBehavior.INTEGER
      'boolean': CheckboxInputBehavior.DEFAULT
      'string': null


  createBinding: (key,attrs) ->
    driver = @controller.getDriver @controller.info.get 'active'
    binding =
      key: key
      get: ->
        opt = driver.getOption(key)
        driver.getOption(key).value
      set: (value) -> driver.setOption key , value
      attrs: attrs

  render: ->
    @clearAllFields()
    driver = @controller.getDriver @controller.info.get 'active'
    return unless driver?
    options = driver.get 'options'
    unless driver? and options? and options.length > 0
      @createLabel 'No settings for this device.'
      super
      return

    for opt in options
      dispType = @typeToBehavior[ opt.type ]
      if opt.type is 'boolean' then attrs = {notEmpty: true} else attrs = {}

      @registerField opt.name,
        binding: @createBinding opt.name , attrs
        behavior: dispType

    super


class BarCodeEventListenerView extends BaseView

  globalEvents:
    'barcodeScan': 'onBarcodeScan'

  initialize: (options) ->
    super

  onBarcodeScan: (input, details) ->
    alert = @$ '.alert'
    ok = new OtherKup @, el: alert

    ok.p ->
      ok.strong 'Input Data: '
      ok.span input

    ok.p ->
      ok.strong 'Symbology: '
      ok.span details?.symbology or 'unknown'

    # flash the pane green
    alert.removeClass('alert-muted').addClass 'alert-success'
    _.delay ( ->
      alert.removeClass('alert-success').addClass 'alert-muted'
    ), 1500

  render: ->
    ok = new OtherKup @

    ok.div class: 'alert alert-muted',
      'Scan a bar code to display information about the label'

    @

class CameraSettingsView extends BaseFormView

  events:
    'click .test-capture': 'testCapture'

  initialize: (options) ->
    super

    source = if navigator.getUserMedia
      'GetUserMedia'
    # else if navigator.camera
    #   'Cordova'
    else
      'Form Input'

    @createReadonly 'Source', source

    class TestCapture extends BaseView

      displayResource: (resource) ->
        resources = @options.binaryResources

        @title = resource.toString()
        $.when(resources.loadData resource).done (@data) =>
          # don't clutter up storage with the image
          resources.forget resource
          @render()

      render: ->
        ok = new OtherKup @

        ok.button class: 'test-capture btn', 'Capture'

        if @data
          ok.div class: 'alert alert-muted', =>
            ok.div @title
            ok.img src: @data.toDataURL()

        @

    @_test = @options.factory.create TestCapture
    @registerField 'Test', @_test

  testCapture: ->
    $.when(@options.factory.binaryResources.cameraCapture())
      .done (resource) =>
        @_test.displayResource resource

module.exports = HardwareSettingsView
