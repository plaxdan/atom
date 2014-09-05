{ div, span, form, label, p, strong, button } = React.DOM
{ classSet } = React.addons
a = require './widgets/anchor'
BootstrapIcon = require './widgets/bootstrapicon'

MessageCenter = React.createClass
  displayName: 'MessageCenter'

  propTypes:
    section: React.PropTypes.string.isRequired
    session: React.PropTypes.object.isRequired
    connectionState: React.PropTypes.string.isRequired
    offlineBehavior: React.PropTypes.string
    startCenterCategories: React.PropTypes.array.isRequired
    localModifications: React.PropTypes.array.isRequired
    toggleMessageCenter: React.PropTypes.func.isRequired
    toggleConnection: React.PropTypes.func.isRequired
    dataSync: React.PropTypes.func.isRequired
    logOut: React.PropTypes.func.isRequired
    commitChanges: React.PropTypes.func.isRequired
    displaySettings: React.PropTypes.func.isRequired
    displayModifications: React.PropTypes.func.isRequired
    displayModification: React.PropTypes.func.isRequired
    displayNavigationAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    # this is a workaround for iOS where click events don't bubble if the
    # element doesn't have a handler or pointer cursor
    # https://github.com/facebook/react/issues/1169
    @refs.backdrop.getDOMNode().onclick = ->

  render: ->
    div null,
      div
        ref: 'backdrop'
        className: 'message-center-backdrop'
        onClick: _.bind @props.toggleMessageCenter, @, ''
      div className: 'message-center',
        switch @props.section
          when 'home-actions'
            HomeActionsSection
              startCenterCategories: @props.startCenterCategories
              displayNavigationAction: @props.displayNavigationAction
          when 'local-modifications'
            LocalModificationsSection
              localModifications:  @props.localModifications
              displayModifications:  @props.displayModifications
              displayModification:  @props.displayModification
              commitChanges:  @props.commitChanges
          else
            SessionInfoSection
              connectionState: @props.connectionState
              sessionMode: @props.session.get 'mode'
              offlineBehavior: @props.offlineBehavior
              userIdentifier: @props.session.get 'userIdentifier'
              toggleConnection: @props.toggleConnection
        SessionActionsSection
          active: @props.section is 'connection-state'
          dataSync: @props.dataSync
          logOut: @props.logOut
          displaySettings: @props.displaySettings

HomeActionsSection = React.createClass
  displayName: 'HomeActionsSection'

  propTypes:
    startCenterCategories: React.PropTypes.array.isRequired
    displayNavigationAction: React.PropTypes.func.isRequired

  render: ->
    div className: 'home-actions section wide',
      for item in @props.startCenterCategories
        div key: item.name, className: 'home-category',
          div className: 'pad',
            div className: 'title', item.name
            div className: 'actions',
              for ref in item.actions
                a
                  key: ref.name
                  className: 'display-action'
                  onClick: _.bind @props.displayNavigationAction, @, ref.action
                , ref.name

LocalModificationsSection = React.createClass
  displayName: 'LocalModificationsSection'

  propTypes:
    displayModifications: React.PropTypes.func.isRequired
    commitChanges: React.PropTypes.func.isRequired

  render: ->
    # show up to the 5 most recent modifications
    modifications = (@props.localModifications.slice -5).reverse()
    div className: 'section wide',
      for mod in modifications
        div
          key: mod.cid
          className: 'clickable modification alert alert-info'
          onClick: _.bind @props.displayModification, @, mod.cid
        ,
          div className: 'close', BootstrapIcon icon: 'icon-share-alt'

          BootstrapIcon
            icon: switch mod.eventType
              when 'insert' then 'icon-asterisk'
              when 'update' then 'icon-upload'
              when 'delete' then 'icon-trash'
            label: strong null, "#{mod.viewName} - "

          mod.description

      div {}
        # needed to ensure full height with floated link and only whitespace
        # content
        style: { whiteSpace: 'pre' }
      ,
        if @props.localModifications.length > 5
          a null, "[#{ @props.localModifications.length - 5} more ...]"
        else
          span null, ' '

        button
          className: 'pull-right btn btn-primary',
          onClick: @props.displayModifications
        ,
          'Manage Modifications'
      # p null,
      #   a className: 'pull-right', onClick: @props.commitChanges,
      #     BootstrapIcon icon: 'icon-upload-alt', label: 'Commit Changes'
      #   a onClick: @props.displayModifications,
      #     'Manage Modifications'

SessionInfoSection = React.createClass
  displayName: 'SessionInfoSection'

  propTypes:
    connectionState: React.PropTypes.string.isRequired
    sessionMode: React.PropTypes.string.isRequired
    offlineBehavior: React.PropTypes.string
    userIdentifier: React.PropTypes.string.isRequired
    toggleConnection: React.PropTypes.func.isRequired

  render: ->
    capitalized = @props.connectionState[0].toUpperCase() +
      @props.connectionState.substring 1
    stateDetails = if @props.offlineBehavior is 'always'
      capitalized
    else
      a onClick: @props.toggleConnection,
        BootstrapIcon
          icon:  if @props.connectionState is 'connected'
            'icon-lock'
          else
            'icon-unlock'
          label: capitalized

    div className: 'section wide',
      form className: 'form-horizontal',
        div className: 'control-group',
          label className: 'control-label', 'Connection State'
          div className: 'controls',
            span className: 'input-block-level uneditable-input',
              stateDetails

        div className: 'control-group',
          label className: 'control-label', 'Session Mode'
          div className: 'controls',
            span className: 'input-block-level uneditable-input',
              @props.sessionMode

        div className: 'control-group',
          label className: 'control-label', 'Connected as'
          div className: 'controls',
            span className: 'input-block-level uneditable-input',
              @props.userIdentifier

SessionActionsSection = React.createClass
  displayName: 'SessionActionsSection'

  propTypes:
    active: React.PropTypes.bool
    dataSync: React.PropTypes.func.isRequired
    displaySettings: React.PropTypes.func.isRequired

  render: ->
    div
      className: classSet
        'section btn-group btn-group-vertical': true
        active: @props.active
    ,
      a className: 'btn', onClick: @props.dataSync,
        @renderIcon 'icon-retweet', 'Synchronize'
      a className: 'btn', onClick: @props.logOut,
        @renderIcon 'icon-signout', 'Log Out'
      a className: 'btn', onClick: @props.displaySettings,
        @renderIcon 'icon-cog', 'Settings'

  renderIcon: (icon, label) ->
    BootstrapIcon if @props.active
      icon: icon
      rightIcon: true
      label: label
    else
      icon: icon
      title: label

module.exports = MessageCenter
