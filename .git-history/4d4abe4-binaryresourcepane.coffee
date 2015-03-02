BootstrapIcon = require '../widgets/bootstrapicon'

{ div, img, textarea, object, button } = React.DOM

BinaryResourcePane = React.createClass
  displayName: 'BinaryResourcePane'

  propTypes:
    binaryData: React.PropTypes.object.isRequired

  render: ->
    { resource } = @props.binaryData
    contentType = resource.get 'contentType'

    # display image and text data directly
    if contentType.match /^image\//
      img src: @props.binaryData.toDataURL()
    else if contentType.match /^text\//
      textarea
        className: 'input-block-level'
        rows: 10
        readOnly: true
        style: { height: '100%' }
        value: @props.binaryData.decodeData()
    else if contentType is 'application/pdf'
      div
        style:
          height: '100%'
          width: '100%'
          overflow: 'scroll'
          '-webkit-overflow-scrolling': 'touch'
      ,
        # ugh - iOS doesn't automatically size embedded objects/iframes
        # and there isn't a way to query the desired object height.
        # just set a value that will scroll a few pages, and the user
        # can download the entire document into a new tab if needed
        ios = navigator.userAgent.match /i(Pod|Phone|Pad)/i
        object
          data: @props.binaryData.toDataURL()
          style:
            height: if ios then '10000px' else '100%'
            width: '100%'
    else
      button className: 'btn',
        BootstrapIcon icon: 'icon-download', label: 'Download'

module.exports = BinaryResourcePane

