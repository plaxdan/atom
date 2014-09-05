md5 = require 'MD5'
# Data Type Helper
#
# Provides functionality for converting between various data types
class DataTypeHelper

  @_s4 = ->
    (((1+Math.random())*0x10000)|0).toString(16).substring(1)

  # create GUID-looking values
  # bing - needs to use the seed to create deterministic values if provided
  @createGuid = (seed) ->
    "{#{ @_s4() }#{ @_s4() }-#{ @_s4() }-#{ @_s4() }-#{ @_s4() }-#{ @_s4() }#{ @_s4() }#{ @_s4() }}".toUpperCase()

  @GUID_PATTERN = /^{([A-F0-9-]){36}}$/
  # might want to make this more restrictive
  @ISO8601_PATTERN = /^[0-9-]+T[0-9:.]+Z$/

  # ensures that a value is a integer. options.long can be specified for a 64
  # bit number, otherwise it assumes 32 bit (only matters when converting GUID
  # values)
  @coerceInteger = (value, options) ->
    return null unless value?

    if _.isDate value
      value.getTime()
    else if _.isString value
      # convert GUID values to numbers. this is useful for generating random
      # values
      if value.match DataTypeHelper.GUID_PATTERN
        raw = value.replace /[{}-]/g, ''
        raw = raw.substring 0, if options?.long then 16 else 8
        # this is pretty hack-y, but a common use case here is to generate
        # signed random integer, so trim the top bit so we don't overflow
        # a 32 bit number
        0x7fffffff & parseInt '0x' + raw
      else
        parseInt value
    else if _.isBoolean value
      if value then 1 else 0
    else
      parseInt value

  # ensures that a value is a number
  @coerceNumeric = (value, options) ->
    return null unless value?

    if _.isNumber value
      value
    else if _.isBoolean value
      if value then 1 else 0
    else if _.isString value
      # convert GUID values to numbers. this is useful for generating random
      # values
      if value.match DataTypeHelper.GUID_PATTERN
        raw = value.replace /[{}-]/g, ''
        raw = raw.substring 0, if options?.long then 16 else 8
        # see above
        0x7fffffff & parseInt '0x' + raw
      else
        parseFloat value
    else
      parseFloat value

  # generic routine to parse values into true/false/null
  @coerceBoolean = (value) ->
    return null unless value?

    if _.isBoolean value
      value

    else if _.isNumber value
      return if value then true else false

    else
      test = (String value).toLowerCase()
      if test in [ '', 'null' ]
        null
      else if test in [ '0', 'f', 'false', 'n', 'no' ]
        false
      else if (parseFloat test) is 0
        false
      else
        # consider everything else to be 'true'
        true

  # ensures that a value is a date. options.format can be used to specify a
  # specific text format if needed
  @coerceDateTime = (value, options) ->
    return null unless value? and value isnt ''

    if _.isDate value
      value
    else
      # ignore explicit formats for ISO8601 dates (locale invariant)
      format = if (_.isString value) and DataTypeHelper.ISO8601_PATTERN.test value
        null
      else
        value = String value
        options?.format

      m = moment value, format
      if m.year() is 0
        if options?.current
          current = moment options.current
          m.year current.year()
          m.month current.month()
          m.date current.date()
        else
          m.year moment().year()
      # bing - this seems pretty arbitrary
      else if m.year() < 100
        m.year(m.year() + (if m.year() < 50 then 2000 else 1900))
      m.toDate()

  # convert a value to the correct data type specified by a field definition
  # (Integer, DateTime, etc)
  @ensureFieldType = (type, value) ->
    switch type
      when 'String' then String value
      when 'Integer' then DataTypeHelper.coerceInteger value
      when 'Long' then DataTypeHelper.coerceInteger value, long: true
      when 'Double' then DataTypeHelper.coerceNumeric value
      when 'Boolean' then DataTypeHelper.coerceBoolean value
      when 'DateTime' then DataTypeHelper.coerceDateTime value
      else value

  @formatBinaryInfo: (value, options) ->
    if _.isEmpty value
      return ''

    attrs = if value.attributes?
      value.attributes
    else if _.isString value
      parse = JSON.parse value
      for key, value of parse
        # camel case attributes to be more JavaScript-y
        test = key[0].toLowerCase() + key.substring 1
        if test isnt key
          parse[test] = value
          delete parse[key]
      parse
    else
      value

    checksum = attrs.checksum or value.id
    if options?.humanize
      if attrs.contentType
        parts = []

        fileName = attrs.fileName
        parts.push fileName, '-' if fileName

        parts.push attrs.contentType

        fileSize = attrs.fileSize
        parts.push "(#{@humanizeFileSize fileSize})"

        parts.join ' '
      else
        ''
    else
      JSON.stringify _.extend { checksum }, _.omit attrs, 'data', 'isLocal'

  @formatValue = (value, options) ->
    return '' unless value? and value isnt ''

    list = if options?.format
      # styles can be comma separated list, but we only care about the
      # built-in styles
      options.format.split /\s*,\s*/g

    else if _.isDate value
      # use a default date format
      [ 'datetime' ]

    # nothing to do
    return String value unless list?.length

    # loop through the specified formats and return the first that matches
    # anything - so 'uppercase, numeric' would upper case only
    for format in list
      # handle basic formatting types
      switch format.toLowerCase()
        # text formats
        when 'uppercase', 'upper case', 'upper'
          return (String value).toUpperCase()
        when 'lowercase', 'lower case', 'lower'
          return (String value).toLowerCase()
        when 'password'
          return '******'

        # numeric formats
        when 'integer', 'numeric0'
          return String parseInt value
        when 'numeric1', 'numeric2', 'numeric3', 'numeric4', 'numeric5', 'numeric6'
          float = parseFloat value
          [m, digits] = format.match /numeric(\d)/i
          return float.toFixed digits

        # boolean formats
        when 'bit'
          return if !!(@coerceBoolean value) then '1' else '0'
        when 'yesno'
          return if !!(@coerceBoolean value) then 'Y' else 'N'

        # date formats
        # bing - need to handle explicit date/formats
        when 'datetime'
          m = moment value
          return "#{m.format 'L'} #{m.format 'LT'}"
        when 'date'
          return (moment value).format 'L'
        when 'time'
          return (moment value).format 'LT'

        when 'binary'
          return @formatBinaryInfo value, humanize: true

        else
          if _.isDate value
            # support additional date formats using momentjs
            # first need to translate a few values that are case-insensitive
            # for DataSplice formats but for moment
            format = format.replace /y/g, 'Y' # year must be upper case
            format = format.replace /d/g, 'D' # day must be upper case
            format = format.replace /S/g, 's' # second must be lower case

            return (moment value).format format

    # pass through the value if nothing matches
    String value

  @_b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

  @base64Decode = (encoded) ->
    return '' unless encoded

    if window.atob
      atob encoded

    else
      # IE9 doesn't have built in conversion functions
      # taken from: http://phpjs.org/functions/base64_decode/
      temp = []
      offset = 0
      while offset < encoded.length
        h1 = @_b64.indexOf encoded.charAt offset
        h2 = @_b64.indexOf encoded.charAt offset + 1
        h3 = @_b64.indexOf encoded.charAt offset + 2
        h4 = @_b64.indexOf encoded.charAt offset + 3
        offset += 4

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4

        o1 = bits >> 16 & 0xff
        o2 = bits >> 8 & 0xff
        o3 = bits & 0xff

        if h3 == 64
          temp.push String.fromCharCode o1
        else if h4 == 64
          temp.push String.fromCharCode o1, o2
        else
          temp.push String.fromCharCode o1, o2, o3

      temp.join ''

  @base64Encode = (data) ->
    return '' unless data

    if window.btoa
      btoa data
    else
      # IE9 doesn't have built in conversion functions
      # taken from: http://phpjs.org/functions/base64_encode/
      i = 0
      ac = 0
      tmp_arr = []

      while i < data.length
        o1 = data.charCodeAt i++
        o2 = data.charCodeAt i++
        o3 = data.charCodeAt i++

        bits = o1 << 16 | o2 << 8 | o3

        h1 = bits >> 18 & 0x3f
        h2 = bits >> 12 & 0x3f
        h3 = bits >> 6 & 0x3f
        h4 = bits & 0x3f

        tmp_arr[ac++] = (@_b64.charAt h1) + (@_b64.charAt h2) +
          (@_b64.charAt h3) + (@_b64.charAt h4)

      encoded = tmp_arr.join ''
      r = data.length % 3
      ( if r then ( encoded.slice 0, r - 3 ) else encoded ) + '==='.slice r || 3

  @humanizeFileSize = (size) ->
    if size >= ( 1024 * 1024 )
      size /= ( 1024 * 1024 )
      suffix = 'MB'
    else if size >= 1024
      size /= 1024
      suffix = 'KB'
    else
      suffix = 'B'

    if size >= 100
      size = parseInt size
    else
      size = ( parseInt ( size * 10 ) ) / 10

    "#{size}#{suffix}"

  @humanizeTimeSpan = (milliseconds) ->
    if milliseconds > 1000
      seconds = milliseconds / 1000

      if seconds >= 60
        minutes = seconds / 60
        seconds -= minutes * 60
        "#{parseInt minutes}m #{parseInt seconds}s"
      else
        "#{parseInt seconds}s"
    else
      "#{(parseInt milliseconds / 10) * 10}ms"

  @capitalize = (text) ->
    text[0].toUpperCase() + text.substring 1

  @decapitalize = (text) ->
    text[0].toLowerCase() + text.substring 1

  @windowsStyleChecksum = (input) ->
    # split checksum into 2 character chunks and massage to match
    # Windows-style checksums
    bytes = (md5 input, encoding: 'binary').match /../g
    [
      (bytes.slice 0, 4).reverse().join ''
      (bytes.slice 4, 6).reverse().join ''
      (bytes.slice 6, 8).reverse().join ''
      (bytes.slice 8, 10).join ''
      (bytes.slice 10).join ''
    ].join '-'

module.exports = DataTypeHelper
