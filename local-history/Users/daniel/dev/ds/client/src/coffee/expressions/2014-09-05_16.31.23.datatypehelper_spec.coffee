DataTypeHelper = require './datatypehelper'
md5 = require 'MD5'

describe 'DataTypeHelper', ->

  describe 'windowsStyleChecksum', ->

    it 'should create a windows style checksum', ->
      expectedOutput = "2a40415d-4bbc-762a-b971-9d911017c592"
      input = 'hello'
      checksum = DataTypeHelper.windowsStyleChecksum input
      checksum.should.equal expectedOutput
