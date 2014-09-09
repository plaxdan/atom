describe 'Promise Handling', ->

  it 'should support native ES6 promises', (done) ->
    new Promise (resolve, reject) ->
      resolve 'win!'
    .then (result) ->
      expect(result).to.equal 'win!'
      done()

  it 'should catch failed promises', (done) ->
    new Promise (resolve, reject) ->
      reject 'fail!'
    .then (result) ->
      throw new Error 'Promise resolved somehow'
    .catch (error) ->
      expect(error).to.equal 'fail!'
      done()

  it 'should support Promise.done shim', (done) ->
    new Promise (resolve, reject) ->
      resolve 'done'
    .done (result) ->
      expect(result).to.equal 'done'
      done()

  it 'should support Promise.finally shim', (done) ->
    new Promise (resolve, reject) ->
      resolve 'done'
    .finally (result) ->
      result.should.equal 'done'
      done()

  it 'should support Promise.resolve for values that are not promises', (done) ->
    Promise.resolve 'static'
      .done (result) ->
        expect(result).to.equal 'static'
        done()

  it 'should support Promise.resolve for values that are promises', (done) ->
    p = new Promise (resolve) ->
      resolve 'promise'

    Promise.resolve p
      .done (result) ->
        expect(result).to.equal 'promise'
        done()

  it 'should throw unhandled errors from Promise.done', (done) ->
    # this seems fairly evil, but the error is thrown asynchronously
    # so our only opportunity is to intercept mocha's error handler and
    # ensure the exception was thrown
    if window?
      mochaError = window.onerror
      window.onerror = (error) ->
        expect(error).to.match /blam!/
        window.onerror = mochaError
        done()

      new Promise (resolve, reject) ->
        reject 'blam!'
      .done (result) ->
        throw new Error 'Promise resolved unexpectedly'
    # also I can't get the node runner to not fail from the thrown error
    # so we'll skip the test in that environment
    else
      done()
