fs        = require 'fs'
util      = require 'util'
path      = require 'path'
walkdir   = require 'walkdir'
Async     = require 'async'
_         = require 'underscore'

Parser    = require './parser'
Generator = require './generator'
exec = require('child_process').exec

# Public: Biscotto - the TomDoc-CoffeeScript API documentation generator
module.exports = class Biscotto

  # Public: Get the current Biscotto version
  #
  # Returns a {String} representing the Biscotto version
  @version: ->
    'v' + JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'))['version']

  # Public: Run the documentation generator. This is usually done through
  # the command line utility `biscotto` that is provided by this package.
  #
  # This function sets up all of the configuration options used by Biscotto.
  #
  # You can also run the documentation generation without writing files
  # to the file system, by supplying a callback function.
  #
  # done - A {Function} to callback once the function is done
  # file - A {Function} to callback on every file
  # analytics - A {String} representing Google analytics tracking code
  # homepage - The {String} homepage in the breadcrumbs
  #
  # Examples
  #
  #    biscotto = require 'biscotto'
  #
  #    file = (filename, content) ->
  #      console.log "New file %s with content %s", filename, content
  #
  #    done = (err) ->
  #      if err
  #        console.log "Cannot generate documentation:", err
  #      else
  #        console.log "Documentation generated"
  #
  #    biscotto.run file, done
  #
  @run: (done, file, analytics = false, homepage = false) ->

    biscottoopts =
      _ : []

    # Read .biscottoopts project defaults
    try
      if (fs.existsSync || path.existsSync)('.biscottoopts')
        configs = fs.readFileSync '.biscottoopts', 'utf8'

        for config in configs.split('\n')
          # Key value configs
          if option = /^-{1,2}([\w-]+)\s+(['"])?(.*?)\2?$/.exec config
            biscottoopts[option[1]] = option[3]
          # Boolean configs
          else if bool = /^-{1,2}([\w-]+)\s*$/.exec config
            biscottoopts[bool[1]] = true
          # Argv configs
          else if config isnt ''
            biscottoopts._.push config


      Async.parallel {
        inputs:  @detectSources
        readme:  @detectReadme
        extras:  @detectExtras
        name:    @detectName
        tag:     @detectTag
        origin:  @detectOrigin
      },
      (err, defaults) ->

        extraUsage = if defaults.extras.length is 0 then '' else  "- #{ defaults.extras.join ' ' }"

        optimist = require('optimist')
          .usage("""
          Usage:   $0 [options] [source_files [- extra_files]]
          Default: $0 [options] #{ defaults.inputs.join ' ' } #{ extraUsage }
          """)
          .options('r',
            alias     : 'readme'
            describe  : 'The readme file used'
            default   : biscottoopts.readme || biscottoopts.r || defaults.readme
          )
          .options('n',
            alias     : 'name'
            describe  : 'The project name used'
            default   : biscottoopts.name || biscottoopts.n || defaults.name
          )
          .options('q',
            alias     : 'quiet'
            describe  : 'Show no warnings'
            boolean   : true
            default   : biscottoopts.quiet || false
          )
          .options('o',
            alias     : 'output-dir'
            describe  : 'The output directory'
            default   : biscottoopts['output-dir'] || biscottoopts.o || './doc'
          )
          .options('a',
            alias     : 'analytics'
            describe  : 'The Google analytics ID'
            default   : biscottoopts.analytics || biscottoopts.a || false
          )
          .options('v',
            alias     : 'verbose'
            describe  : 'Show parsing errors'
            boolean   : true
            default   : biscottoopts.verbose || biscottoopts.v  || false
          )
          .options('d',
            alias     : 'debug'
            describe  : 'Show stacktraces and converted CoffeeScript source'
            boolean   : true
            default   : biscottoopts.debug || biscottoopts.d  || false
          )
          .options('h',
            alias     : 'help'
            describe  : 'Show the help'
          )
          .options('s',
            alias     : 'server'
            describe  : 'Start a documentation server'
          )
          .options('j',
            alias     : 'json'
            describe  : 'The location (including filename) of optional JSON output'
          )
          .options('noOutput',
            boolean   : true
            describe  : 'Generates no documentation output'
          )
          .options('stats',
            boolean   : true
            describe  : 'Returns stats on documentation, such as total coverage'
          )
          .options('missing',
            boolean   : true
            describe  : 'Lists which elements are missing documentation'
          )
          .options('private',
            boolean   : true
            default   : biscottoopts.private || false
            describe  : 'Show private methods'
          )
          .options('internal',
            boolean   : true
            default   : biscottoopts.internal || false
            describe  : 'Show internal methods'
          )
          .options('stability',
            describe  : 'Set stability level'
            default   : -1
          ).default('title', biscottoopts.title || 'CoffeeScript API Documentation')

        argv = optimist.argv

        if argv.h
          console.log optimist.help()

        else if argv.s
          port = if argv.s is true then 8080 else argv.s
          connect = require 'connect'
          connect.createServer(connect.static(argv.o)).listen port
          console.log 'Biscotto documentation from %s is available at http://localhost:%d', argv.o, port

        else
          options =
            inputs: []
            output: argv.o
            json: argv.j || ""
            extras: []
            name: argv.n
            readme: argv.r
            title: argv.title
            quiet: argv.q
            private: argv.private
            internal: argv.internal
            noOutput: argv.noOutput
            missing: argv.missing
            verbose: argv.v
            debug: argv.d
            cautious: argv.cautious
            homepage: homepage
            analytics: analytics || argv.a
            tag: defaults.tag
            origin: defaults.origin
            stability: argv.stability

          extra = false

          # ignore params if biscotto has not been started directly
          args = if argv._.length isnt 0 and /.+biscotto$/.test(process.argv[1]) then argv._ else biscottoopts._


          for arg in args
            if arg is '-'
              extra = true
            else
              if extra then options.extras.push(arg) else options.inputs.push(arg)

          options.inputs = defaults.inputs if options.inputs.length is 0
          options.extras = defaults.extras if options.extras.length is 0

          parser = new Parser(options)

          for input in options.inputs
            if (fs.existsSync || path.existsSync)(input)
              stats = fs.lstatSync input

              if stats.isDirectory()
                for filename in walkdir.sync input
                  if filename.match /\._?coffee$/
                    try
                      parser.parseFile filename.substring process.cwd().length + 1
                    catch error
                      throw error if options.debug
                      console.log "Cannot parse file #{ filename }: #{ error.message }"
              else
                if input.match /\._?coffee$/
                  try
                    parser.parseFile input
                  catch error
                    throw error if options.debug
                    console.log "Cannot parse file #{ filename }: #{ error.message }"

          generator = new Generator(parser, options)
          generator.generate(file)

          if options.json && options.json.length
            fs.writeFileSync options.json, JSON.stringify(parser.toJSON(generator.referencer), null, "    ");

          parser.showResult(generator) unless options.quiet
          done() if done

    catch error
      done(error) if done
      console.log "Cannot generate documentation: #{ error.message }"
      throw error

  # Public: Get the Biscotto script content that is used in the webinterface
  #
  # Returns the script contents as a {String}.
  @script: ->
    @biscottoScript or= fs.readFileSync path.join(__dirname, '..', 'theme', 'default', 'assets', 'biscotto.js'), 'utf-8'

  # Public: Get the Biscotto style content that is used in the webinterface
  #
  # Returns the style content as a {String}.
  @style: ->
    @biscottoStyle or= fs.readFileSync path.join(__dirname, '..', 'theme', 'default', 'assets', 'biscotto.css'), 'utf-8'

  # Public: Find the source directories.
  @detectSources: (done) ->
    Async.filter [
      'src'
      'lib'
      'app'
    ], (fs.exists || path.exists), (results) ->
      results.push '.' if results.length is 0
      done null, results

  # Public: Find the project's README.
  @detectReadme: (done) ->
    Async.filter [
      'README.markdown'
      'README.md'
      'README'
      'readme.markdown'
      'readme.md'
      'readme'
    ], (fs.exists || path.exists), (results) -> done null, _.first(results) || ''

  # Public: Find extra project files in the repository.
  @detectExtras: (done) ->
    Async.filter [
      'CHANGELOG.markdown'
      'CHANGELOG.md'
      'AUTHORS'
      'AUTHORS.md'
      'AUTHORS.markdown'
      'LICENSE'
      'LICENSE.md'
      'LICENSE.markdown'
      'LICENSE.MIT'
      'LICENSE.GPL'
    ], (fs.exists || path.exists), (results) -> done null, results

  # Public: Find the project name by either parsing `package.json`,
  # or getting the current working directory name.
  #
  # done - The {Function} callback to call once this is done
  @detectName: (done) ->
    if (fs.exists || path.exists)('package.json')
      name = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'))['name']
    else
      name = path.basename(process.cwd())

    done null, name.charAt(0).toUpperCase() + name.slice(1)

  # Public: Find the project's latest Git tag.
  #
  # done - The {Function} callback to call once this is done
  @detectTag: (done) ->
    exec 'git describe --abbrev=0 --tags', (error, stdout, stderr) ->
      currentTag = stdout || "master"

      done null, currentTag

  # Public: Find the project's Git remote.origin URL.
  #
  # done - The {Function} callback to call once this is done
  @detectOrigin: (done) ->
    exec 'git config --get remote.origin.url', (error, stdout, stderr) ->
      url = stdout
      if url
        if url.match /https:\/\/github.com\// # e.g., https://github.com/foo/bar.git
          url = url.replace(/\.git/, '')
        else if url.match /git@github.com/    # e.g., git@github.com:foo/bar.git
          url = url.replace(/^git@github.com:/, 'https://github.com/').replace(/\.git/, '')

      done null, url
