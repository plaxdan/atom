WysiwygHtmlEditor = require './ui/wysiwyg/wysiwyghtmleditor'
HtmlEditorToolbar = require './ui/wysiwyg/htmleditortoolbar'
React = require 'react/addons'
TestUtils = React.addons.TestUtils
wysiwygComponent = null

describe 'WysiwygHtmlEditor', ->

  fieldId = 'myFieldId'
  contentEditable = null
  editableDiv = null
  onChange = null

  renderWysiwyg = (props) ->
    wysiwygComponent = WysiwygHtmlEditor props
    wysiwygComponent = TestUtils.renderIntoDocument wysiwygComponent
    contentEditable = wysiwygComponent.refs.editor
    editableDiv = TestUtils.findRenderedDOMComponentWithTag contentEditable, 'div'

  it 'should exist', ->
    WysiwygHtmlEditor.should.not.be.null

  describe 'by default', ->

    beforeEach -> renderWysiwyg null

    it 'should not render a toolbar', ->
      (expect wysiwygComponent.props.toolbar).to.not.be.ok # falsy
      toolbars = TestUtils.scryRenderedComponentsWithType wysiwygComponent, HtmlEditorToolbar
      toolbars.should.be.empty

    it 'should not be readOnly', ->
      (expect wysiwygComponent.props.readOnly).to.not.be.ok # falsy

    it 'getHtml() should return empty', ->
      (expect wysiwygComponent.getHtml()).to.be.empty

    it 'should contain an editor', ->
      contentEditable = wysiwygComponent.refs.editor
      (expect contentEditable).to.be.ok

  describe 'with fieldId', ->

    fieldId = 'myFieldId'
    beforeEach -> renderWysiwyg {fieldId}

    it 'should pass the fieldId property to the underlying editable dom node', ->
      divId = editableDiv.getDOMNode().getAttribute 'id'
      divId.should.equal fieldId

  describe 'with value', ->

    initialContent = 'Hey some content!'
    beforeEach -> renderWysiwyg value: initialContent

    it 'should return the value from getHtml()', ->
      wysiwygComponent.getHtml().should.equal initialContent


  describe 'when readOnly is true', ->

    it 'should not allow a toolbar', ->
      renderWysiwyg {
        fieldId
        onChange
        toolbar: true
        readOnly: true
      }
      toolbars = TestUtils.scryRenderedComponentsWithType wysiwygComponent, HtmlEditorToolbar
      toolbars.should.be.empty

    describe 'onChange callback', ->

      beforeEach ->
        onChange = chai.spy()
        renderWysiwyg {fieldId, onChange, readOnly: true}

      it 'should not fire on blur', ->
        TestUtils.Simulate.blur editableDiv
        onChange.should.not.have.been.called

      it 'should not fire on change', ->
        TestUtils.Simulate.change editableDiv
        onChange.should.not.have.been.called

  describe 'when readOnly is false', ->

    beforeEach ->
      onChange = chai.spy()
      renderWysiwyg {fieldId, onChange, readOnly: false}

    it 'should allow a toolbar', ->
      renderWysiwyg {
        fieldId
        onChange
        toolbar: true
        readOnly: false
      }
      toolbar = TestUtils.findRenderedComponentWithType wysiwygComponent, HtmlEditorToolbar
      toolbar.should.be.ok

    it 'should allow editing', ->
      onChange = chai.spy()
      renderWysiwyg {fieldId, onChange, readOnly: false}

      node = editableDiv.getDOMNode()
      node.innerHTML = 'hello'
      TestUtils.Simulate.change node
      onChange.should.have.been.called.once
      wysiwygComponent.getHtml().should.equal 'hello'

    describe 'onChange callback', ->

      beforeEach ->
        onChange = chai.spy()
        renderWysiwyg {fieldId, onChange, readOnly: false}

      it 'should fire on blur', ->
        TestUtils.Simulate.blur editableDiv
        onChange.should.have.been.called.once

      it 'should fire on change', ->
        TestUtils.Simulate.change editableDiv
        onChange.should.have.been.called.once
