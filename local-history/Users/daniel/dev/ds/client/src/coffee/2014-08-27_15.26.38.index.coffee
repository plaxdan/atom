# environment shims, etc
require './environment'

# some external libraries (select2, bootstrap-datetimepicker) depend on
# globals for library references. git rid of these once we upgrade to more
# modern versions of the libraries
window.jQuery = $
window.$ = $
window.moment = moment

# this is needed when being loaded by the DS5.0 Cordova/CEF applications -
# the landing page already has jQuery and some of our dependencies, but it
# is a different version that what is included by webpack. the section above
# normalizes the references, and this forces the select library to reload
window.Select2 = undefined

# this is probably as good as anyplace to include generic libraries
require 'script!./vendor/global.js'

if DEBUG
  window.React = require 'react/addons'

# create an application object an run it - this inializes things, mounts the
# UI, etc
DataSpliceApplication = require './application'
(new DataSpliceApplication).run()
