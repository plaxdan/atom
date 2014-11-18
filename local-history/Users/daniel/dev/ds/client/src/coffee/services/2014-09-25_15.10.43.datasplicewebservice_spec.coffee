DataSpliceWebService = require './datasplicewebservice'
describe 'DataSpliceWebService', ->

  it 'should do a thing', ->
    api = new DataSpliceWebService 'http://demo2.datasplice.com'
    console.log "API", api
    api.getServer()
    .then (response) ->
      console.log 'Response: ', response
