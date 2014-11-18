DataSpliceWebService = require './datasplicewebservice'
describe 'DataSpliceWebService', ->

  it 'should do a thing', ->
    api = new DataSpliceWebService 'http://demo2.datasplice.com'
    console.log "API", api
    api.getServer()
    .then (server) -> console.log 'Response: ', response
    # .then (server) ->
    #
    # api.getServer()
    # .then (server) ->
    #   console.log "Response: #{JSON.stringify server}"
