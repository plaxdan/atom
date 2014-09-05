DataTypeHelper = require './datatypehelper'
md5 = require 'MD5'

describe 'DataTypeHelper', ->

  it 'windowsStyleChecksum should create a windows style checksum', ->
    expected = "2a40415d-4bbc-762a-b971-9d911017c592"
    input = 'hello'
    checksum = DataTypeHelper.windowsStyleChecksum input
    checksum.should.equal expected

  it 'camelize should camelize', ->
    expected = 'hello'
    camelized = DataTypeHelper.camelize 'Hello'
    camelized.should.equal expected
