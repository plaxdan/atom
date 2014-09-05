ExpressionContext = require './expressioncontext'
ExpressionEvaluator = require './expressionevaluator'
DataSpliceParser = require '../../grammar/parser'

# define [ 'async', 'when', 'expressions/expressionevaluator', 'expressions/expressioncontext' ]
# , (async, When, ExpressionEvaluator, ExpressionContext) ->

describe 'Expression Evaluator', ->

  # helper function that iterates a collection of statements and compares the
  # evaluation result against the expected value. the 'done' callback is
  # invoked after all the statements are checked successfully
  checkStatements = (statements, context, done) ->
    async.each (_.pairs statements)
    , # iterate
      (item, callback) ->
        [statement, expected] = item
        Promise.resolve(ExpressionEvaluator.evaluate statement, {context})
          .then (value) ->
            expect(value).to.equal expected
            callback()
          .catch (error) ->
            callback error
    , # complete
      (error) ->
        expect(error).to.not.exist
        done()

  describe 'Basic functionality', ->

    it 'should evaluate whether or not a statement is an expression', ->
      expect(ExpressionEvaluator.isExpression ':= 1 + 2').to.equal true
      expect(ExpressionEvaluator.isExpression '1 + 2').to.equal false
      # only bare attribute references are expressions without := prefix
      expect(ExpressionEvaluator.isExpression '${foo}').to.equal true
      expect(ExpressionEvaluator.isExpression '${foo} ${bar}').to.equal false

  describe 'Arithmetic operations', ->

    it 'support basic arithmetic operations', (done) ->
      statements =
        '1 + 2': 3
        '10 - 3': 7
        '3 * 4': 12
        '10 / 2': 5
        '14 % 3': 2
        '3 ^ 3': 27
        '-47': -47

      checkStatements statements, null, done

    it 'coerce numeric arguments for arithmetic operations', (done) ->
      statements =
        '"3" * "4"': 12
        '3 + null': 3
        '4 * true': 4
        '5 - false': 5
        '"this" + "that"': 0 # addition operator is strictly numeric

      checkStatements statements, null, done

    it 'emulate ds division by zero behavior', (done) ->
      statements =
        '5 / 0': 0
        '5 % 0': 0
        '0 / 0': 0
        '0 % 0': 0

      checkStatements statements, null, done

    it 'handle operator precedence correctly', (done) ->
      statements =
        '1 + 2 * 3': 7
        '2 * 3 + 4': 10

      checkStatements statements, null, done

    it 'provide a operator to concatenate strings', (done) ->
      statements =
        '"foo" || "bar"': 'foobar'
        '"foo" || null': 'foo'
        '"foo" || 12': 'foo12'

      checkStatements statements, null, done

  describe 'Unary operators', ->

    it 'provide a boolean negation operator', (done) ->
      statements =
        '!true': false
        '!(2 == 3)': true

      checkStatements statements, null, done

    it 'provide a numeric negation operator', (done) ->
      statements =
        '-3': -3
        '-(4 * -5)': 20

      checkStatements statements, null, done

  describe 'Comparison operations', ->

    it 'Handle empty and null strings like ds4 did', (done) ->
      statements =
        '"" == ""': true
        'null == null' : true
        '"" == null' : true
        'null is null' : true
        '"" is null' : true

      checkStatements statements, null, done

    it 'provide a similarity operator that performs advanced matching', (done) ->
      statements =
        # case insensitive
        '"foo" ~= "Foo"': true
        '"foo" ~= "Bar"': false

        # list-searches
        '"bar" ~= "foo,bar,baz"': true
        '"nope" ~= "foo,bar,baz"': false

        # wildcards
        '"food" ~= "foo*"': true
        '"food" ~= "foo?"': true
        '"foodie" ~= "foo?"': false

        # regular expressions
        '"foobar" ~= /^foo/': true
        '"barfoo" ~= /^foo/': false

      checkStatements statements, null, done

    it 'provide a corresponding dis-similarity operator', (done) ->
      statements =
        # case insensitive
        '"foo" ~!= "Foo"': false
        '"foo" ~!= "Bar"': true
        '"foo" ~<> "Foo"': false
        '"foo" ~<> "Bar"': true

        # list-searches
        '"bar" ~!= "foo,bar,baz"': false
        '"nope" ~!= "foo,bar,baz"': true
        '"bar" ~<> "foo,bar,baz"': false
        '"nope" ~<> "foo,bar,baz"': true

        # wildcards
        '"food" ~!= "foo*"':false
        '"food" ~!= "foo?"': false
        '"foodie" ~!= "foo?"': true
        '"food" ~<> "foo*"':false
        '"food" ~<> "foo?"': false
        '"foodie" ~<> "foo?"': true

        # regular expressions
        '"foobar" ~!= /^foo/': false
        '"barfoo" ~!= /^foo/': true
        '"foobar" ~<> /^foo/': false
        '"barfoo" ~<> /^foo/': true

      checkStatements statements, null, done

  describe 'Expressions that fail to parse in DS4', ->

    it 'Expressions with negative numbers', (done) ->
      statements =
        '(1 + 2) - -3': 6

      checkStatements statements, null, done

    it 'Problems with not operator', (done) ->
      statements =
        # these are both failing in JavaScript
        #'true and ! false': true         -- this works in ds4
        #'true and not false': true       -- this does not work in ds4
        'true and true': true    # I just put this here to make sure I didn't have an indentation problem or something

      checkStatements statements, null, done

  describe 'Memoization of DataSpliceParser', ->

    parseSpy = null
    originalParse = DataSpliceParser.parse

    beforeEach ->
      parseSpy = chai.spy DataSpliceParser.parse
      DataSpliceParser.parse = parseSpy
      parseSpy.should.be.spy

    afterEach ->
      parseSpy = null
      DataSpliceParser.parse = originalParse

    it 'should only call DataSpliceParser.parse once when given the same arguments multiple times', ->
      expression = 'true or ( 1 + 2 )'
      ExpressionEvaluator.parse expression for count in [1..10]
      parseSpy.should.have.been.called.once

    it 'should call DataSpliceParseer.parse once for each unique statement', ->
      expressionA = 'true or ( 1 + 2 )'
      expressionB = 'false or ( 3 + 2 )'
      for count in [1..10]
        ExpressionEvaluator.parse expressionA
        ExpressionEvaluator.parse expressionB

      parseSpy.should.have.been.called.twice

  describe 'Grouping operators', ->

    it 'support AND/OR grouping statements', (done) ->
      statements =
        'true and false': false
        'true and (1 = 1)': true
        'false or true': true

      checkStatements statements, null, done
  #
    it 'short-circuit AND statements if the first argument is false', (done) ->
      # ensure we hit both visit and done callbacks
      complete = _.after 2, -> done()

      promise = ExpressionEvaluator.evaluate 'false and ( 1 + 2 )',
        visit: (value, item) ->
          if item.op
            # right-hand side of the statement should not get visited
            expect(item.op).not.to.equal '+'
            complete()

      Promise.resolve promise
        .then (value) ->
          expect(value).to.equal false
          complete()
  #
    it 'short-circuit OR statements if the first argument is true', (done) ->
      # ensure we hit both visit and done callbacks
      complete = _.after 2, -> done()

      promise = ExpressionEvaluator.evaluate 'true or ( 1 + 2 )',
        visit: (value, item) ->
          if item.op
            # right-hand side of the statement should not get visited
            expect(item.op).not.to.equal '+'
            complete()

      Promise.resolve promise
        .then (value) ->
          expect(value).to.equal true
          complete()

  describe 'Attribute handling', ->

    it 'lookup attribute values', (done) ->
      # set up the context
      context = new ExpressionContext
      context.addAttributes foo: 'bar'

      Promise.resolve ExpressionEvaluator.evaluate '${foo}', {context}
        .then (value) ->
          expect(value).to.equal 'bar'
          done()

    it 'return an error if an invalid attribute is referenced', (done) ->
      Promise.resolve ExpressionEvaluator.evaluate '${foo}'
        .then ->
          expect('should not have been called').to.not.exist
        , (error) ->
          expect(error).to.equal 'Attribute not found: foo'
          done()

    it 'evaluate expressions within attribute values', (done) ->
      # set up the context
      context = new ExpressionContext
      context.addAttributes foo: ':= 1 + 5'

      Promise.resolve ExpressionEvaluator.evaluate '${foo}', {context}
        .then (value) ->
          expect(value).to.equal 6
          done()

    it 'not consume error messages within attribute expressions', (done) ->
      # set up the context
      context = new ExpressionContext
      context.addAttributes foo: ':= inv alid'

      Promise.resolve ExpressionEvaluator.evaluate '${foo}', {context}
        .then (value) ->
          # this should not get called
          expect('done').toNotHappen()
        , (error) ->
          done()

    it 'handle null and undefined values correctly', (done) ->
      # set up the context
      context = new ExpressionContext
      context.addAttributes 'null_value': null
      context.addAttributes 'undefined_value': undefined

      statements =
        '${null_value} is null': true
        '${null_value} is not null': false
        '${undefined_value} is null': true
        '${undefined_value} is not null': false

      checkStatements statements, context, done

    it 'convert boolean attribute values correctly', (done) ->
      context = new ExpressionContext
      context.addAttributes 'yes': 'true'
      context.addAttributes 'no': 'false'
      context.addAttributes 'Camel': 'True'
      context.addAttributes 'Upper': 'FALSE'

      statements =
        '${yes}': true
        '${yes} == true': true
        '${no}': false
        '${no} == false': true
        '${Camel}': true
        '${Camel} == true': true
        '${Upper}': false
        '${Upper} == false': true

      checkStatements statements, context, done

  describe 'Nested Attributes', ->

    it 'pass numerical attribute references to nested definitions', (done) ->

      context = new ExpressionContext
      context.addAttributes do_upper: ':= upper( ${1} )'

      Promise.resolve ExpressionEvaluator.evaluate '${do_upper("something")}', { context }
        .then (value) ->
          expect(value).to.equal 'SOMETHING'

          # this also should not pollute the attribute collection in the
          # context
          expect(context._attributes.length).to.equal 1

          done()

    it 'handle attribute parameters that are attribute references', (done) ->

      context = new ExpressionContext
      context.addAttributes
        do_upper: ':= upper( ${1} )'
        bar: 'something'

      Promise.resolve ExpressionEvaluator.evaluate '${do_upper(${bar})}', { context }
        .then (value) ->
          expect(value).to.equal 'SOMETHING'
          done()

  describe 'Attribute Collections', ->

    it 'evaluate collections of attributes that contain expressions and references', (done) ->

      context = new ExpressionContext
      context.addAttributes foo: 'bar'

      attributes =
        first: 'something'
        second: ':= 1 + 2'
        third: ':= upper( ${foo} )'
        fourth: '${foo}'

      Promise.resolve ExpressionEvaluator.evaluateAttributes attributes, {context}
        .then ->

          # it should leave not expressions alone
          expect(attributes.first).to.equal 'something'
          # should handle basic expressions
          expect(attributes.second).to.equal 3
          # the supplied context should be used
          expect(attributes.third).to.equal 'BAR'
          # should process bare attribute references
          expect(attributes.fourth).to.equal 'bar'

          done()

    it 'should support recursive attribute references', (done) ->

      context = new ExpressionContext
      context.addAttributes foo: ' spaces '

      attributes =
        foo: ':= trim( ${foo} )'

      Promise.resolve ExpressionEvaluator.evaluateAttributes attributes, {context}
        .then ->
          expect(attributes.foo).to.equal 'spaces'

          done()
