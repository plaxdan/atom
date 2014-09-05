# Binary Resource Info
BaseModel = require './basemodel'
DataTypeHelper = require '../expressions/datatypehelper'
StorageFactory = require '../storage/storagefactory'
UrlHelper = require '../utils/urlhelper'

class BinaryResourceInfo extends BaseModel

  url: -> UrlHelper.prefix "ds/resources/#{ @id }"

  constructor: (attributes) ->
    # information from the server is usually provided as a JSON formatted
    # string
    if (_.isString attributes) and not (_.isEmpty attributes)
      attributes = JSON.parse attributes

    # prefer websql since local storage has a pretty small data limit
    @storage = StorageFactory.modelStorage [ 'webSql', 'localStorage' ]

    super @parse attributes

    # don't carry a duplicate id value in the attributes collection
    delete @attributes.id

  parse: (attributes) ->
    for key, value of attributes
      # use the file checksum as the local modal unique key
      if key.toLowerCase() is 'checksum'
        attributes.id = value
        delete attributes[key]

      # camel case attributes to be more JavaScript-y
      else
        test = key[0].toLowerCase() + key.substring 1
        if test isnt key
          attributes[test] = value
          delete attributes[key]

    attributes

  toString: (options) ->
    DataTypeHelper.formatBinaryInfo @, options

  isEmpty: ->
    (@get 'contentType') is undefined

module.exports = BinaryResourceInfo

