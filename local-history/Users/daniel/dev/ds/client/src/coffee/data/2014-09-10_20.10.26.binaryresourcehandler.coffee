# Binary Resource Handler

md5 = require 'MD5'
Backbone = require 'backbone'
BinaryResourceInfo = require '../models/binaryresourceinfo'
DataTypeHelper = require '../expressions/datatypehelper'
StorageFactory = require '../storage/storagefactory'
GetUserMediaCameraCapture = require '../ui/binary/getusermediacameracapture'
UploadFilePrompt = require '../ui/binary/uploadfileprompt'

# handle implementation-specific versions of getUserMedia
navigator.getUserMedia or=
  navigator.webkitGetUserMedia or
  navigator.mozGetUserMedia or
  navigator.msGetUserMedia

class BinaryResourceHandler extends Backbone.Collection

  # flag to specify whether or not the device has access to a camera
  # would be nice to have a smarter default here, at the moment this only
  # gets set to false if accessing the camera fails
  @hasCamera = true

  model: BinaryResourceInfo

  constructor: (@factory) ->
    super null

    # register this handler in the factory
    @factory.register 'binaryResources', @

    # prefer websql since local storage has a pretty small data limit
    @storage = StorageFactory.modelStorage [ 'webSql', 'localStorage' ]
    (Promise.resolve @storage.initialized)
      .then =>
        @storage.getKeys /^ds\/resources\//
      .done (keys) =>
        _.each keys, (url) =>
          id = url.substring (url.lastIndexOf '/') + 1
          info = new BinaryResourceInfo { id }
          # bing - this is fairly expensive since we have to load the entire
          # resource just to get basic information about it. might be nice to
          # add capability to the storage mechanism to persist the resource
          # data separately
          (Promise.resolve info.loadLocal()).done =>
            # unload data attribute from memory
            delete info.attributes.data
            @add info

  # finds or creates a binary resource info object based on formatted
  # information provided by the server
  lookup: (json) ->
    if _.isString json
      json = JSON.parse json

    # see if this object is already in the collection
    info = @get ( json.id or json.Checksum or json.checksum )

    return info if info?

    # otherwise create a new info object
    info = new BinaryResourceInfo json
    @add info
    info

  # creates a new (empty) resource file that can be tracked locally
  create: ->
    # assign the resource a random id, it will get updated if/when the
    # associate record is saved
    info = new BinaryResourceInfo
      isLocal: true
      id: DataTypeHelper.createGuid()

    @add info
    info

  # removes local information about a particular resource
  forget: (resources) ->
    unless _.isArray resources
      resources = [ resources ]

    @remove( for r in resources
      r = (@get r) unless r instanceof BinaryResourceInfo
      r?.deleteCache()
      r
    )

  getFileName: (resource) ->
    contentType = resource.get 'contentType'
    [ m, extension ] = contentType.match /\/(.+)/
    "#{resource.id}.#{extension}"

  parseDataURL: (data, options) ->
    [ m, contentType, data ] = data.match /^data:([^;]*);base64,(.*)$/
    unless data?.length
      throw new Error 'No data'

    # decode the data and calculate a checksum for the file
    decode = DataTypeHelper.base64Decode data
    fileSize = decode.length
    checksum = DataTypeHelper.windowsStyleChecksum decode

    set = { contentType, fileSize, data }
    if options?.fileName
      set.fileName = options.fileName
    info = new BinaryResourceInfo set
    info.id = "{#{checksum.toUpperCase()}}"
    console.warn info
    @_createDataWrapper info

  loadData: (resource, options) ->
    new Promise (resolve, reject) =>
      { id } = resource
      (Promise.resolve resource.loadLocal()).done (loaded) =>
        if loaded
          resolve @_createDataWrapper resource
        else
          # try to request the resource from the server
          resource.fetch
            success: =>
              if resource.id isnt id
                console.error "Resource ID mismatch on fetch: #{id} -> #{resource.id}"
                resource.id = id
                resource.attributes.id = id
              if options?.cache
                resource.storeLocal()
              resolve @_createDataWrapper resource
            error: (model, xhr) =>
              reject xhr.responseText

  storeData: (resource, options) ->
    new Promise (resolve, reject) =>
      if (@models.indexOf resource) < 0
        resource.set isLocal: true
        resource.id = DataTypeHelper.createGuid() unless resource.id
        console.warn resource
        @add resource

      try
        (Promise.resolve resource.storeLocal())
          .done ->
            delete resource.attributes.data
            resolve()
          .catch (error) =>
            @forget resource
            reject error

      catch error
        reject error.message

  # process the local data and ensure that the available binary resources
  # are cached locally
  syncOfflineResources: (options) ->
    # first need to figure out the binary resources that are available
    # locally
    @_getLocalResources().then (resources) =>
      new Promise (resolve, reject) =>
        # then prune cached resources that are no longer referenced
        prune = _.difference (_.pluck @models, 'id'), _.keys resources
        for id in prune
          info = @get id
          @forget info unless info.get 'isLocal'

        # finally ensure referenced resources are cached locally
        resources = _.values resources
        unless resources.length
          resolve()

        else
          total = resources.length

          task =
            Description: 'Downloading Binary Resources'
            Current: 0
            Total: resources.length
          options.status.addStatus task

          loadResource = (resource, done) =>
            task.Current = total - resources.length
            options.status.addStatus task
            options.status.addStatus
              Parent: task.Description
              Description: 'Download'
              Step: resource.toString()

            @loadData resource, cache: true
              .then done
              .catch (error) ->
                console.error "Failed to load resource: #{error.message or error}"
                done()

          resourceLoadingComplete = ->
            status.Percent = 100
            options.status.addStatus status
            resolve()

          async.eachSeries resources, loadResource, resourceLoadingComplete

  deleteCache: ->
    @forget @models

  uploadFile: (options) ->
    new Promise (resolve, reject) =>
      @factory.pubSub.trigger 'displayModal',
        UploadFilePrompt
          title: options?.title
          resourceHandler: @
          accept: options?.accept
          validate: (results) =>
            if results.role is 'accept'
              { resource } = results
              (@storeData results.resource)
                .then -> resolve results.resource
                .catch reject

  cameraCapture: (options) ->

    ios = navigator.userAgent.match /i(Pod|Phone|Pad)/i
    android = navigator.userAgent.match /Android/i

    # use the cordova camera object if possible
    if navigator.camera
      @_cordovaCameraCapture()

    # getUserMedia doesn't behave all that well on devices so avoid it
    # there even if the API is available
    else if navigator.getUserMedia and BinaryResourceHandler.hasCamera and
        not ( ios or android )
      @_getUserMediaCameraCapture()

    # otherwise render an input so the user can upload a file or trigger the
    # camera
    else
      @uploadFile
        title: 'Camera Capture'
        accept: 'image/*;capture=camera'

  _createDataWrapper: (resource) ->
    # move binary data into a separate object
    data = resource.get 'data'

    resource: resource
    data: data
    decodeData: ->
      DataTypeHelper.base64Decode data
    toDataURL: ->
      "data:#{@resource.get 'contentType'};base64,#{data}"

  _cordovaCameraCapture: ->
    new Promise (resolve, reject) =>
      cameraOptions =
        destinationType: navigator.camera.DestinationType.DATA_URL
        encodingType: navigator.camera.EncodingType.JPEG
      onSuccess = (data) =>
        (@storeData resource, "data:image/jpeg;base64,#{data}")
          .then -> resolve resource
          .catch reject
      onError = (error) =>
        unless options?.silent
          @factory.pubSub.trigger 'displayNotification',
            message: error
            severity: 'error'
        reject error

      navigator.camera.getPicture onSuccess, onError, cameraOptions

  _getUserMediaCameraCapture: ->
    new Promise (resolve, reject) =>
      @factory.pubSub.trigger 'displayModal',
        GetUserMediaCameraCapture
          resourceHandler: @
          settings: @factory.settings
          validate: (results) =>
            if results.role is 'accept'
              { resource } = results
              (@storeData results.resource)
                .then -> resolve results.resource
                .catch reject

  # query the local data and build a map of all binary resources that are
  # referenced
  _getLocalResources: ->
    new Promise (resolve, reject) =>
      resources = {}
      async.each (@factory.session.get 'views').models,
        (view, done) =>
          binaryFields = {}
          _.each (view.get 'fields'), (field, index) ->
            binaryFields[field.name] = index if field.dataType is 'Binary'

          if _.isEmpty binaryFields
            done()
          else
            where = (_.collect (_.keys binaryFields), (k) -> "'#{k}' is not null").join ' or '

            query = @factory.dataController.createQuery view,
              filter: where
              localData: true
            query.dataSet.on 'reset', =>
              for record in query.dataSet.models
                for index in _.values binaryFields
                  value = record.getValue index
                  if value
                    info = @lookup value
                    resources[info.id] = info
              done()

            query.fetch()

        # async complete
        , =>
          resolve resources

module.exports = BinaryResourceHandler
