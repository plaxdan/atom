DataSpliceWebService = require './datasplicewebservice'
describe 'DataSpliceWebService', ->

  it 'should do a thing', ->
    # api = new DataSpliceWebService 'http://demo2.datasplice.com'
    api = new DataSpliceWebService
    console.log "API", api
    promise = api.getServer()
    console.log 'Promise', promise
    promise.then (response) ->
      console.log 'Response: ', response
