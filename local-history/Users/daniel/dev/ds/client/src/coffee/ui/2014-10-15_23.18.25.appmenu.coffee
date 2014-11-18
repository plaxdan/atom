{ div, span, ul, li } = React.DOM
{ classSet } = React.addons
a = require './widgets/anchor'
BootstrapIcon = require './widgets/bootstrapicon'

SessionLabel = require './sessiontitle'

AppMenu = React.createClass
  displayName: 'AppMenu'

  propTypes:
    serverInstance: React.PropTypes.string.isRequired
    userName: React.PropTypes.string.isRequired
    connectionState: React.PropTypes.string.isRequired
    modificationCount: React.PropTypes.number.isRequired
    notification: React.PropTypes.object
    searchVisible: React.PropTypes.bool
    activeMessageCenterSection: React.PropTypes.string
    triggerScan: React.PropTypes.func
    toggleMessageCenter: React.PropTypes.func.isRequired
    toggleSearch: React.PropTypes.func
    displayNotificationDetailsHandler: React.PropTypes.func.isRequired
    commitChanges: React.PropTypes.func.isRequired

  render: ->
    { notification } = @props

    div className: 'navbar navbar-inverse navbar-fixed-top',
      div className: 'navbar-inner',
        div className: 'container',

          ul className: 'home-logo nav',
            li
              className: classSet
                active: @_isActiveSection 'home-actions'
            ,
              a
                title: 'Home Actions'
                onClick: @_toggleMessageCenter 'home-actions'
              , 'd' # this gets replaaced with the DS logo


          SessionLabel
            clickHandler: _.bind @props.toggleMessageCenter, @, ''
            userName: @props.userName
            serverInstance: @props.serverInstance

          # div className: 'brand-container',
          #   a
          #     href: '#ui/home'
          #     onClick: _.bind @props.toggleMessageCenter, @, ''
          #   ,
          #     span className: 'session-title brand',
          #       "#{@props.userName}@#{@props.serverInstance}"

          if notification
            div className: 'notifications-container',
              div className: "alert alert-#{(notification.get 'severity') or 'info'}",
                div className: 'close', 'x'
                if notification.get 'error.details'
                  a
                    className: 'error-details'
                    title: 'Display Details'
                    onClick: _.bind @props.displayNotificationDetailsHandler,
                      notification.get 'error'
                  ,
                    BootstrapIcon icon: 'icon-tasks'
                notification.get 'message'

          ul className: 'session-badges nav',

            if @props.modificationCount > 0
              LocalModificationsBadge
                modificationCount: @props.modificationCount
                messageCenterActive: @_isActiveSection 'local-modifications'
                toggleMessageCenter: @_toggleMessageCenter 'local-modifications'
                commitChanges: @props.commitChanges

            if @props.triggerScan
              ScannerTriggerBadge
                triggerScan: @props.triggerScan

            ConnectionStateBadge
              connectionState: @props.connectionState
              messageCenterActive: @_isActiveSection 'connection-state'
              toggleMessageCenter: @_toggleMessageCenter 'connection-state'

            if @props.toggleSearch
              SearchBadge
                searchVisible: @props.searchVisible
                toggleSearch: @props.toggleSearch

  _isActiveSection: (section) ->
    @props.activeMessageCenterSection is section

  _toggleMessageCenter: (section) ->
    _.bind @props.toggleMessageCenter, @, section

LocalModificationsBadge = React.createClass
  displayName: 'LocationModificationsBadge'

  propTypes:
    modificationCount: React.PropTypes.number.isRequired
    messageCenterActive: React.PropTypes.bool
    toggleMessageCenter: React.PropTypes.func.isRequired
    commitChanges: React.PropTypes.func.isRequired

  render: ->
    li className: 'local-modifications',
      div className: 'btn-group',
        a
          className: 'btn btn-info'
          title: 'Commit Changes'
          onClick: @props.commitChanges
        ,
          BootstrapIcon
            icon: 'icon-upload-alt'
            label: if @props.messageCenterActive
              'Commit'
            else
              "(#{@props.modificationCount})"
        a
          className: classSet
            'btn btn-info': true
            active: @props.messageCenterActive
          title: 'Modification Details'
          onClick: @props.toggleMessageCenter
        ,
          BootstrapIcon icon: 'icon-chevron-down'

ScannerTriggerBadge = React.createClass
  displayName: 'ScannerTriggerBadge'

  propTypes:
    triggerScan: React.PropTypes.func.isRequired

  render: ->
    li className: 'trigger-scan',
      a onClick: @props.triggerScan,
        BootstrapIcon icon: 'icon-barcode', title: 'Trigger Scan'

ConnectionStateBadge = React.createClass
  displayName: 'ConnectionStateBadge'

  propTypes:
    connectionState: React.PropTypes.string.isRequired
    messageCenterActive: React.PropTypes.bool
    toggleMessageCenter: React.PropTypes.func.isRequired

  render: ->
    classes = [ 'connection-state', @props.connectionState ]
    classes.push 'active' if @props.messageCenterActive
    li { className: classes.join ' ' },
      a onClick: @props.toggleMessageCenter,
        BootstrapIcon icon: 'icon-signal', title: 'Connection State'

SearchBadge = React.createClass
  displayName: 'SearchBadge'

  propTypes:
    searchVisible: React.PropTypes.bool
    toggleSearch: React.PropTypes.func.isRequired

  render: ->
    li
      className: classSet
        'toggle-search': true
        'open': @props.searchVisible
    ,
      a { onClick: _.bind @props.toggleSearch, @, null },
        BootstrapIcon icon: 'icon-search', title: 'Search'

module.exports = AppMenu
