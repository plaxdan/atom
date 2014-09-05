{ div, span, ul, li, button } = React.DOM
a = require './widgets/anchor'
BootstrapIcon = require './widgets/bootstrapicon'

AppMenu = React.createClass
  displayName: 'AppMenu'

  propTypes:
    serverInstance: React.PropTypes.string.isRequired
    userName: React.PropTypes.string.isRequired
    connectionState: React.PropTypes.string.isRequired
    modificationCount: React.PropTypes.number.isRequired
    notification: React.PropTypes.object
    triggerScan: React.PropTypes.func
    toggleMessageCenter: React.PropTypes.func.isRequired
    displayNotificationDetailsHandler: React.PropTypes.func.isRequired
    commitChanges: React.PropTypes.func.isRequired

  render: ->
    { notification } = @props

    div className: 'navbar navbar-inverse navbar-fixed-top',
      div className: 'navbar-inner',
        div className: 'container',

          ul className: 'home-logo nav',
            li null,
              a
                title: 'Home Actions'
                onClick: _.bind @props.toggleMessageCenter, @, 'home-actions'
              , 'd' # this gets replaaced with the DS logo

          div className: 'brand-container',
            a
              href: '#ui/home'
              onClick: _.bind @props.toggleMessageCenter, @, ''
            ,
              span className: 'session-title brand',
                "#{@props.userName}@#{@props.serverInstance}"

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
                toggleMessageCenter: @props.toggleMessageCenter
                commitChanges: @props.commitChanges

            if @props.triggerScan
              ScannerTriggerBadge
                triggerScan: @props.triggerScan
            ConnectionStateBadge
              connectionState: @props.connectionState
              toggleMessageCenter: @props.toggleMessageCenter

LocalModificationsBadge = React.createClass
  displayName: 'LocationModificationsBadge'

  propTypes:
    modificationCount: React.PropTypes.number.isRequired
    toggleMessageCenter: React.PropTypes.func.isRequired
    commitChanges: React.PropTypes.func.isRequired

  getInitialState: ->
    isOpen: false

  _toggleModifications: ->
    @setState isOpen: not @state.isOpen
    @props.toggleMessageCenter 'local-modifications'

  render: ->
    btnGroupClasses = React.addons.classSet
      'btn-group': true
      'open': @state.isOpen

    li className: 'local-modifications',

      div className: btnGroupClasses,
        button className: 'btn btn-success', onClick: @props.commitChanges,
          BootstrapIcon
            icon: 'icon-upload-alt'
            title: "Commit #{@props.modificationCount} modifications"
            label: "(#{@props.modificationCount})"
        button
          className: 'btn btn-success'
          onClick: @_toggleModifications
          # onClick: _.bind @props.toggleMessageCenter, @, 'local-modifications'
        ,
          span className: 'caret'

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
    toggleMessageCenter: React.PropTypes.func.isRequired

  render: ->
    li className: "connection-state #{@props.connectionState}",
      a { onClick: _.bind @props.toggleMessageCenter, @, 'connection-state' },
        BootstrapIcon icon: 'icon-signal', title: 'Connection State'

module.exports = AppMenu
