DataTypeHelper = require './datatypehelper'
md5 = require 'MD5'

describe 'DataTypeHelper', ->

  describe 'windowsStyleChecksum', ->

    it 'should create a windows style checksum', ->
      input = 'hello'
      md5output = md5 input, encoding: 'binary'
      checksum = DataTypeHelper.windowsStyleChecksum input
      console.log md5output
      console.log checksum
