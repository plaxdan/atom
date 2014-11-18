class AppCacheService

  @update: ->
    ac = window.applicationCache
    ac.update() if ac and ac.status isnt ac.UNCACHED
