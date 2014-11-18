DataSpliceWebService = require './datasplicewebservice'
describe 'DataSpliceWebService', ->

  it 'should do a thing', ->
    api = new DataSpliceWebService 'http://demo2.datasplice.com'
    api.getServer()
    .then (server) ->
      console.log "Response: #{JSON.stringify server}"
