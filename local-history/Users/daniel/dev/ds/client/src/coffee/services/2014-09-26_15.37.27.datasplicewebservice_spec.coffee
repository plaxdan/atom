DataSpliceWebService = require './datasplicewebservice'
describe 'DataSpliceWebService', ->

  it 'should do a thing', ->
    api = new DataSpliceWebService 'http://demo2.datasplice.com'
    # api = new DataSpliceWebService
    api.getServer()
      .then (response) ->
        console.log 'Response: ', response
      .catch (err) ->
        console.log 'Error: ', err
