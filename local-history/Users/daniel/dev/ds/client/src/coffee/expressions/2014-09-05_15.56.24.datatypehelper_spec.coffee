DataTypeHelper = require './datatypehelper'

describe 'DataTypeHelper', ->

  describe 'windowsStyleChecksum', ->

    it 'should create a windows style checksum', ->
      input = 'hello'
      checksum = DataTypeHelper.windowsStyleChecksum input
      console.log checksum
