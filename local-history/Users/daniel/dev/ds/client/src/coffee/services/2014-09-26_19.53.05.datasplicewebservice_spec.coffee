DataSpliceWebService = require './datasplicewebservice'
describe 'DataSpliceWebService', ->

  it 'requires a mock server for proper testing'
    api = new DataSpliceWebService 'http://demo2.datasplice.com'
    # api = new DataSpliceWebService
    api.getServer()
      .then (response) ->
        console.log 'Response: ', response
      .catch (error) ->
        console.log "#{error.message}", error
