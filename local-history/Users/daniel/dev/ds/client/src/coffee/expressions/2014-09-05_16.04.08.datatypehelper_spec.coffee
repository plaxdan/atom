DataTypeHelper = require './datatypehelper'
md5 = require 'MD5'

describe 'DataTypeHelper', ->

  describe 'windowsStyleChecksum', ->

    it 'should create a windows style checksum', ->
      input = 'hello'
      checksum = DataTypeHelper.windowsStyleChecksum input
