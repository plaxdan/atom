HtmlEditorToolbar = require './ui/wysiwyg/htmleditortoolbar'
React = require 'react/addons'
TestUtils = React.addons.TestUtils

describe 'HtmlEditorToolbar', ->
  it 'should exist', ->
    HtmlEditorToolbar.should.not.be.null
