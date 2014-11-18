Backbone = require 'backbone'
BaseModel = require './basemodel'

describe 'BaseModel', ->

  describe 'Chained Properties', ->

    it 'should support accessing internal object properties with a single get request', ->
      inner = new BaseModel
        foo: 'bar'

      # this should work both with Backbone attributes
      outer = new BaseModel
        inner: inner
      expect(outer.get 'inner.foo').to.equal 'bar'

      # and object properties
      outer.prop = inner
      expect(outer.get 'prop.foo').to.equal 'bar'

    it 'should return undefined when invalid paths are accessed', ->
      foo = new BaseModel

      expect(foo.get 'bad.food').to.be.undefined

    it 'should work with classes that implement custom property getters', ->

      # create a collection object that overrides get to look up models by name
      class NamedCollection extends Backbone.Collection
        # override get to fetch objects by name as well
        get: (key) ->
          test = super
          if not test and _.isString key
            test = _.find @models, (m) -> ((m.get 'name') is key)
          test

      # create a simple collection with a couple of models
      first = new BaseModel { id: 0, name: 'first' }
      second = new BaseModel { id: 1, name: 'second' }
      c = new NamedCollection [ first, second ]

      # now create the base model to test chained properties
      foo = new BaseModel
        collection: c

      for obj in [ first, second ]
        # should work with the base Backbone getter (model.id)
        expect(foo.get "collection.#{ obj.id }").to.equal obj

        # also should work with the overridden get method
        expect(foo.get "collection.#{ obj.get 'name' }").to.equal obj

    it 'should also access through object properties', ->
      inner =
        raw: 'bar'
      outer = new BaseModel
        inner: inner
      expect('bar').to.equal outer.get 'inner.raw'

    it 'should support accessing chained properties through regular Backbone Models', ->
      inner = new Backbone.Model
        foo: 'bar'
      outer = new BaseModel
        inner: inner
      expect('bar').to.equal outer.get 'inner.foo'

    it 'should use the model parse method when creating objects to process attributes', ->
      class ParseModel extends BaseModel
        parse: (attributes) ->
          # useful primarily for inflating formatted or unwrapped attributes
          attributes.formatted = JSON.parse attributes.formatted

          # should be able to add additional attributes
          attributes.inject = 'something'

          super

      model = new ParseModel foo: 'bar', formatted: '[1, 2, 3]'
      expect(model.get 'foo').to.equal 'bar'
      expect(model.get 'formatted').to.deep.equal [1, 2, 3]
      expect(model.get 'inject').to.equal 'something'

  describe 'Model Storage', ->

    it 'should use a storage proxy to determine if the model is cached', ->
      model = new BaseModel

      # isCached should return false with no storage attached
      expect(model.isCached()).to.be.false

      # mock the storage interface
      spy = chai.spy()
      model.storage = isCached: spy
      model.isCached()

      spy.should.have.been.called.with model

    it 'should use a storage proxy to delete the local cache', ->
      model = new BaseModel foo: 'bar'
      model.url = '/foo'

      # mock the storage interface
      spy = chai.spy()
      model.storage = deleteCache: spy
      model.deleteCache()

      spy.should.have.been.called.with model

      # should also clear the model
      expect(model.attributes).to.be.empty
