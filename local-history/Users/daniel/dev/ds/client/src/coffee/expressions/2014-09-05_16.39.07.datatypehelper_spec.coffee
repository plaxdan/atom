DataTypeHelper = require './datatypehelper'
md5 = require 'MD5'

describe 'DataTypeHelper', ->

  it 'windowsStyleChecksum should create a windows style checksum', ->
    expected = "2a40415d-4bbc-762a-b971-9d911017c592"
    input = 'hello'
    checksum = DataTypeHelper.windowsStyleChecksum input
    checksum.should.equal expected

  it 'decapitalize', ->
    expected = 'hello-there'
    camelized = DataTypeHelper.camelize 'Hello-There'
    camelized.should.equal expected
