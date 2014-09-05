DataTypeHelper = require './datatypehelper'
md5 = require 'MD5'

describe 'DataTypeHelper', ->

  it 'windowsStyleChecksum should create a windows style checksum', ->
    checksum = DataTypeHelper.windowsStyleChecksum 'hello'
    checksum.should.equal '2a40415d-4bbc-762a-b971-9d911017c592'

  it 'decapitalize', ->
    (DataTypeHelper.decapitalize 'Hello').should.equal 'hello'
