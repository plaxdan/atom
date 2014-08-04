(function() {
  var BufferedProcess, Project, fs, fstream, path, platform, temp, _;

  temp = require('temp');

  fstream = require('fstream');

  Project = require('../src/project');

  _ = require('underscore-plus');

  fs = require('fs-plus');

  path = require('path');

  platform = require('./spec-helper-platform');

  BufferedProcess = require('../src/buffered-process');

  describe("Project", function() {
    beforeEach(function() {
      return atom.project.setPath(atom.project.resolve('dir'));
    });
    describe("serialization", function() {
      var deserializedProject;
      deserializedProject = null;
      afterEach(function() {
        return deserializedProject != null ? deserializedProject.destroy() : void 0;
      });
      it("does not include unretained buffers in the serialized state", function() {
        waitsForPromise(function() {
          return atom.project.bufferForPath('a');
        });
        return runs(function() {
          expect(atom.project.getBuffers().length).toBe(1);
          deserializedProject = atom.project.testSerialization();
          return expect(deserializedProject.getBuffers().length).toBe(0);
        });
      });
      return it("listens for destroyed events on deserialized buffers and removes them when they are destroyed", function() {
        waitsForPromise(function() {
          return atom.project.open('a');
        });
        return runs(function() {
          expect(atom.project.getBuffers().length).toBe(1);
          deserializedProject = atom.project.testSerialization();
          expect(deserializedProject.getBuffers().length).toBe(1);
          deserializedProject.getBuffers()[0].destroy();
          return expect(deserializedProject.getBuffers().length).toBe(0);
        });
      });
    });
    describe("when an editor is saved and the project has no path", function() {
      return it("sets the project's path to the saved file's parent directory", function() {
        var editor, tempFile;
        tempFile = temp.openSync().path;
        atom.project.setPath(void 0);
        expect(atom.project.getPath()).toBeUndefined();
        editor = null;
        waitsForPromise(function() {
          return atom.project.open().then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          editor.saveAs(tempFile);
          return expect(atom.project.getPath()).toBe(path.dirname(tempFile));
        });
      });
    });
    describe(".open(path)", function() {
      var absolutePath, newBufferHandler, _ref;
      _ref = [], absolutePath = _ref[0], newBufferHandler = _ref[1];
      beforeEach(function() {
        absolutePath = require.resolve('./fixtures/dir/a');
        newBufferHandler = jasmine.createSpy('newBufferHandler');
        return atom.project.on('buffer-created', newBufferHandler);
      });
      describe("when given an absolute path that isn't currently open", function() {
        return it("returns a new edit session for the given path and emits 'buffer-created'", function() {
          var editor;
          editor = null;
          waitsForPromise(function() {
            return atom.project.open(absolutePath).then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            expect(editor.buffer.getPath()).toBe(absolutePath);
            return expect(newBufferHandler).toHaveBeenCalledWith(editor.buffer);
          });
        });
      });
      describe("when given a relative path that isn't currently opened", function() {
        return it("returns a new edit session for the given path (relative to the project root) and emits 'buffer-created'", function() {
          var editor;
          editor = null;
          waitsForPromise(function() {
            return atom.project.open(absolutePath).then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            expect(editor.buffer.getPath()).toBe(absolutePath);
            return expect(newBufferHandler).toHaveBeenCalledWith(editor.buffer);
          });
        });
      });
      describe("when passed the path to a buffer that is currently opened", function() {
        return it("returns a new edit session containing currently opened buffer", function() {
          var editor;
          editor = null;
          waitsForPromise(function() {
            return atom.project.open(absolutePath).then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            return newBufferHandler.reset();
          });
          waitsForPromise(function() {
            return atom.project.open(absolutePath).then(function(_arg) {
              var buffer;
              buffer = _arg.buffer;
              return expect(buffer).toBe(editor.buffer);
            });
          });
          return waitsForPromise(function() {
            return atom.project.open('a').then(function(_arg) {
              var buffer;
              buffer = _arg.buffer;
              expect(buffer).toBe(editor.buffer);
              return expect(newBufferHandler).not.toHaveBeenCalled();
            });
          });
        });
      });
      describe("when not passed a path", function() {
        return it("returns a new edit session and emits 'buffer-created'", function() {
          var editor;
          editor = null;
          waitsForPromise(function() {
            return atom.project.open().then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            expect(editor.buffer.getPath()).toBeUndefined();
            return expect(newBufferHandler).toHaveBeenCalledWith(editor.buffer);
          });
        });
      });
      return it("returns number of read bytes as progress indicator", function() {
        var filePath, promise, totalBytes;
        filePath = atom.project.resolve('a');
        totalBytes = 0;
        promise = atom.project.open(filePath);
        promise.progress(function(bytesRead) {
          return totalBytes = bytesRead;
        });
        waitsForPromise(function() {
          return promise;
        });
        return runs(function() {
          return expect(totalBytes).toBe(fs.statSync(filePath).size);
        });
      });
    });
    describe(".bufferForPath(path)", function() {
      var buffer;
      buffer = [][0];
      beforeEach(function() {
        return waitsForPromise(function() {
          return atom.project.bufferForPath("a").then(function(o) {
            buffer = o;
            return buffer.retain();
          });
        });
      });
      afterEach(function() {
        return buffer.release();
      });
      return describe("when opening a previously opened path", function() {
        it("does not create a new buffer", function() {
          waitsForPromise(function() {
            return atom.project.bufferForPath("a").then(function(anotherBuffer) {
              return expect(anotherBuffer).toBe(buffer);
            });
          });
          return waitsForPromise(function() {
            return atom.project.bufferForPath("b").then(function(anotherBuffer) {
              return expect(anotherBuffer).not.toBe(buffer);
            });
          });
        });
        return it("creates a new buffer if the previous buffer was destroyed", function() {
          buffer.release();
          return waitsForPromise(function() {
            return atom.project.bufferForPath("b").then(function(anotherBuffer) {
              return expect(anotherBuffer).not.toBe(buffer);
            });
          });
        });
      });
    });
    describe(".resolve(uri)", function() {
      describe("when passed an absolute or relative path", function() {
        return it("returns an absolute path based on the atom.project's root", function() {
          var absolutePath;
          absolutePath = require.resolve('./fixtures/dir/a');
          expect(atom.project.resolve('a')).toBe(absolutePath);
          expect(atom.project.resolve(absolutePath + '/../a')).toBe(absolutePath);
          expect(atom.project.resolve('a/../a')).toBe(absolutePath);
          return expect(atom.project.resolve()).toBeUndefined();
        });
      });
      describe("when passed a uri with a scheme", function() {
        return it("does not modify uris that begin with a scheme", function() {
          return expect(atom.project.resolve('http://zombo.com')).toBe('http://zombo.com');
        });
      });
      return describe("when the project has no path", function() {
        return it("returns undefined for relative URIs", function() {
          var absolutePath;
          atom.project.setPath();
          expect(atom.project.resolve('test.txt')).toBeUndefined();
          expect(atom.project.resolve('http://github.com')).toBe('http://github.com');
          absolutePath = fs.absolute(__dirname);
          return expect(atom.project.resolve(absolutePath)).toBe(absolutePath);
        });
      });
    });
    describe(".setPath(path)", function() {
      describe("when path is a file", function() {
        return it("sets its path to the files parent directory and updates the root directory", function() {
          atom.project.setPath(require.resolve('./fixtures/dir/a'));
          expect(atom.project.getPath()).toEqual(path.dirname(require.resolve('./fixtures/dir/a')));
          return expect(atom.project.getRootDirectory().path).toEqual(path.dirname(require.resolve('./fixtures/dir/a')));
        });
      });
      describe("when path is a directory", function() {
        return it("sets its path to the directory and updates the root directory", function() {
          var directory;
          directory = fs.absolute(path.join(__dirname, 'fixtures', 'dir', 'a-dir'));
          atom.project.setPath(directory);
          expect(atom.project.getPath()).toEqual(directory);
          return expect(atom.project.getRootDirectory().path).toEqual(directory);
        });
      });
      return describe("when path is null", function() {
        return it("sets its path and root directory to null", function() {
          atom.project.setPath(null);
          expect(atom.project.getPath() != null).toBeFalsy();
          return expect(atom.project.getRootDirectory() != null).toBeFalsy();
        });
      });
    });
    describe(".replace()", function() {
      var commentFilePath, filePath, sampleCommentContent, sampleContent, _ref;
      _ref = [], filePath = _ref[0], commentFilePath = _ref[1], sampleContent = _ref[2], sampleCommentContent = _ref[3];
      beforeEach(function() {
        atom.project.setPath(atom.project.resolve('../'));
        filePath = atom.project.resolve('sample.js');
        commentFilePath = atom.project.resolve('sample-with-comments.js');
        sampleContent = fs.readFileSync(filePath).toString();
        return sampleCommentContent = fs.readFileSync(commentFilePath).toString();
      });
      afterEach(function() {
        fs.writeFileSync(filePath, sampleContent);
        return fs.writeFileSync(commentFilePath, sampleCommentContent);
      });
      describe("when a file doesn't exist", function() {
        return it("calls back with an error", function() {
          var errors, missingPath;
          errors = [];
          missingPath = path.resolve('/not-a-file.js');
          expect(fs.existsSync(missingPath)).toBeFalsy();
          waitsForPromise(function() {
            return atom.project.replace(/items/gi, 'items', [missingPath], function(result, error) {
              return errors.push(error);
            });
          });
          return runs(function() {
            expect(errors).toHaveLength(1);
            return expect(errors[0].path).toBe(missingPath);
          });
        });
      });
      describe("when called with unopened files", function() {
        return it("replaces properly", function() {
          var results;
          results = [];
          waitsForPromise(function() {
            return atom.project.replace(/items/gi, 'items', [filePath], function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            expect(results).toHaveLength(1);
            expect(results[0].filePath).toBe(filePath);
            return expect(results[0].replacements).toBe(6);
          });
        });
      });
      return describe("when a buffer is already open", function() {
        it("replaces properly and saves when not modified", function() {
          var editor, results;
          editor = null;
          results = [];
          waitsForPromise(function() {
            return atom.project.open('sample.js').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            return expect(editor.isModified()).toBeFalsy();
          });
          waitsForPromise(function() {
            return atom.project.replace(/items/gi, 'items', [filePath], function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            expect(results).toHaveLength(1);
            expect(results[0].filePath).toBe(filePath);
            expect(results[0].replacements).toBe(6);
            return expect(editor.isModified()).toBeFalsy();
          });
        });
        it("does not replace when the path is not specified", function() {
          var editor, results;
          editor = null;
          results = [];
          waitsForPromise(function() {
            return atom.project.open('sample-with-comments.js').then(function(o) {
              return editor = o;
            });
          });
          waitsForPromise(function() {
            return atom.project.replace(/items/gi, 'items', [commentFilePath], function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            expect(results).toHaveLength(1);
            return expect(results[0].filePath).toBe(commentFilePath);
          });
        });
        return it("does NOT save when modified", function() {
          var editor, results;
          editor = null;
          results = [];
          waitsForPromise(function() {
            return atom.project.open('sample.js').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            editor.buffer.setTextInRange([[0, 0], [0, 0]], 'omg');
            return expect(editor.isModified()).toBeTruthy();
          });
          waitsForPromise(function() {
            return atom.project.replace(/items/gi, 'okthen', [filePath], function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            expect(results).toHaveLength(1);
            expect(results[0].filePath).toBe(filePath);
            expect(results[0].replacements).toBe(6);
            return expect(editor.isModified()).toBeTruthy();
          });
        });
      });
    });
    describe(".scan(options, callback)", function() {
      return describe("when called with a regex", function() {
        it("calls the callback with all regex results in all files in the project", function() {
          var results;
          results = [];
          waitsForPromise(function() {
            return atom.project.scan(/(a)+/, function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            expect(results).toHaveLength(3);
            expect(results[0].filePath).toBe(atom.project.resolve('a'));
            expect(results[0].matches).toHaveLength(3);
            return expect(results[0].matches[0]).toEqual({
              matchText: 'aaa',
              lineText: 'aaa bbb',
              lineTextOffset: 0,
              range: [[0, 0], [0, 3]]
            });
          });
        });
        it("works with with escaped literals (like $ and ^)", function() {
          var results;
          results = [];
          waitsForPromise(function() {
            return atom.project.scan(/\$\w+/, function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            var filePath, matches, _ref;
            expect(results.length).toBe(1);
            _ref = results[0], filePath = _ref.filePath, matches = _ref.matches;
            expect(filePath).toBe(atom.project.resolve('a'));
            expect(matches).toHaveLength(1);
            return expect(matches[0]).toEqual({
              matchText: '$bill',
              lineText: 'dollar$bill',
              lineTextOffset: 0,
              range: [[2, 6], [2, 11]]
            });
          });
        });
        it("works on evil filenames", function() {
          var matches, paths;
          platform.generateEvilFiles();
          atom.project.setPath(path.join(__dirname, 'fixtures', 'evil-files'));
          paths = [];
          matches = [];
          waitsForPromise(function() {
            return atom.project.scan(/evil/, function(result) {
              paths.push(result.filePath);
              return matches = matches.concat(result.matches);
            });
          });
          return runs(function() {
            _.each(matches, function(m) {
              return expect(m.matchText).toEqual('evil');
            });
            if (platform.isWindows()) {
              expect(paths.length).toBe(3);
              expect(paths[0]).toMatch(/a_file_with_utf8.txt$/);
              expect(paths[1]).toMatch(/file with spaces.txt$/);
              return expect(path.basename(paths[2])).toBe("utfa\u0306.md");
            } else {
              expect(paths.length).toBe(5);
              expect(paths[0]).toMatch(/a_file_with_utf8.txt$/);
              expect(paths[1]).toMatch(/file with spaces.txt$/);
              expect(paths[2]).toMatch(/goddam\nnewlines$/m);
              expect(paths[3]).toMatch(/quote".txt$/m);
              return expect(path.basename(paths[4])).toBe("utfa\u0306.md");
            }
          });
        });
        it("ignores case if the regex includes the `i` flag", function() {
          var results;
          results = [];
          waitsForPromise(function() {
            return atom.project.scan(/DOLLAR/i, function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            return expect(results).toHaveLength(1);
          });
        });
        describe("when the core.excludeVcsIgnoredPaths config is truthy", function() {
          var ignoredPath, projectPath, _ref;
          _ref = [], projectPath = _ref[0], ignoredPath = _ref[1];
          beforeEach(function() {
            var sourceProjectPath, writerStream;
            sourceProjectPath = path.join(__dirname, 'fixtures', 'git', 'working-dir');
            projectPath = path.join(temp.mkdirSync("atom"));
            writerStream = fstream.Writer(projectPath);
            fstream.Reader(sourceProjectPath).pipe(writerStream);
            waitsFor(function(done) {
              writerStream.on('close', done);
              return writerStream.on('error', done);
            });
            return runs(function() {
              fs.rename(path.join(projectPath, 'git.git'), path.join(projectPath, '.git'));
              ignoredPath = path.join(projectPath, 'ignored.txt');
              return fs.writeFileSync(ignoredPath, 'this match should not be included');
            });
          });
          afterEach(function() {
            if (fs.existsSync(projectPath)) {
              return fs.removeSync(projectPath);
            }
          });
          return it("excludes ignored files", function() {
            var resultHandler;
            atom.project.setPath(projectPath);
            atom.config.set('core.excludeVcsIgnoredPaths', true);
            resultHandler = jasmine.createSpy("result found");
            waitsForPromise(function() {
              return atom.project.scan(/match/, function(results) {
                return resultHandler();
              });
            });
            return runs(function() {
              return expect(resultHandler).not.toHaveBeenCalled();
            });
          });
        });
        it("includes only files when a directory filter is specified", function() {
          var filePath, matches, paths, projectPath;
          projectPath = path.join(path.join(__dirname, 'fixtures', 'dir'));
          atom.project.setPath(projectPath);
          filePath = path.join(projectPath, 'a-dir', 'oh-git');
          paths = [];
          matches = [];
          waitsForPromise(function() {
            return atom.project.scan(/aaa/, {
              paths: ["a-dir" + path.sep]
            }, function(result) {
              paths.push(result.filePath);
              return matches = matches.concat(result.matches);
            });
          });
          return runs(function() {
            expect(paths.length).toBe(1);
            expect(paths[0]).toBe(filePath);
            return expect(matches.length).toBe(1);
          });
        });
        it("includes files and folders that begin with a '.'", function() {
          var filePath, matches, paths, projectPath;
          projectPath = temp.mkdirSync();
          filePath = path.join(projectPath, '.text');
          fs.writeFileSync(filePath, 'match this');
          atom.project.setPath(projectPath);
          paths = [];
          matches = [];
          waitsForPromise(function() {
            return atom.project.scan(/match this/, function(result) {
              paths.push(result.filePath);
              return matches = matches.concat(result.matches);
            });
          });
          return runs(function() {
            expect(paths.length).toBe(1);
            expect(paths[0]).toBe(filePath);
            return expect(matches.length).toBe(1);
          });
        });
        it("excludes values in core.ignoredNames", function() {
          var ignoredNames, projectPath, resultHandler;
          projectPath = path.join(__dirname, 'fixtures', 'git', 'working-dir');
          ignoredNames = atom.config.get("core.ignoredNames");
          ignoredNames.push("a");
          atom.config.set("core.ignoredNames", ignoredNames);
          resultHandler = jasmine.createSpy("result found");
          waitsForPromise(function() {
            return atom.project.scan(/dollar/, function(results) {
              return resultHandler();
            });
          });
          return runs(function() {
            return expect(resultHandler).not.toHaveBeenCalled();
          });
        });
        it("scans buffer contents if the buffer is modified", function() {
          var editor, results;
          editor = null;
          results = [];
          waitsForPromise(function() {
            return atom.project.open('a').then(function(o) {
              editor = o;
              return editor.setText("Elephant");
            });
          });
          waitsForPromise(function() {
            return atom.project.scan(/a|Elephant/, function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            var resultForA;
            expect(results).toHaveLength(3);
            resultForA = _.find(results, function(_arg) {
              var filePath;
              filePath = _arg.filePath;
              return path.basename(filePath) === 'a';
            });
            expect(resultForA.matches).toHaveLength(1);
            return expect(resultForA.matches[0].matchText).toBe('Elephant');
          });
        });
        return it("ignores buffers outside the project", function() {
          var editor, results;
          editor = null;
          results = [];
          waitsForPromise(function() {
            return atom.project.open(temp.openSync().path).then(function(o) {
              editor = o;
              return editor.setText("Elephant");
            });
          });
          waitsForPromise(function() {
            return atom.project.scan(/Elephant/, function(result) {
              return results.push(result);
            });
          });
          return runs(function() {
            return expect(results).toHaveLength(0);
          });
        });
      });
    });
    return describe(".eachBuffer(callback)", function() {
      beforeEach(function() {
        return atom.project.bufferForPathSync('a');
      });
      it("invokes the callback for existing buffer", function() {
        var callback, callbackBuffer, count;
        count = 0;
        count = 0;
        callbackBuffer = null;
        callback = function(buffer) {
          callbackBuffer = buffer;
          return count++;
        };
        atom.project.eachBuffer(callback);
        expect(count).toBe(1);
        return expect(callbackBuffer).toBe(atom.project.getBuffers()[0]);
      });
      return it("invokes the callback for new buffers", function() {
        var callback, callbackBuffer, count;
        count = 0;
        callbackBuffer = null;
        callback = function(buffer) {
          callbackBuffer = buffer;
          return count++;
        };
        atom.project.eachBuffer(callback);
        count = 0;
        callbackBuffer = null;
        atom.project.bufferForPathSync(require.resolve('./fixtures/sample.txt'));
        expect(count).toBe(1);
        return expect(callbackBuffer).toBe(atom.project.getBuffers()[1]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUixDQURWLENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGdCQUFSLENBRlYsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSkwsQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUxQLENBQUE7O0FBQUEsRUFNQSxRQUFBLEdBQVcsT0FBQSxDQUFRLHdCQUFSLENBTlgsQ0FBQTs7QUFBQSxFQU9BLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHlCQUFSLENBUGxCLENBQUE7O0FBQUEsRUFTQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQXFCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFxQixLQUFyQixDQUFyQixFQURTO0lBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxJQUdBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixVQUFBLG1CQUFBO0FBQUEsTUFBQSxtQkFBQSxHQUFzQixJQUF0QixDQUFBO0FBQUEsTUFFQSxTQUFBLENBQVUsU0FBQSxHQUFBOzZDQUNSLG1CQUFtQixDQUFFLE9BQXJCLENBQUEsV0FEUTtNQUFBLENBQVYsQ0FGQSxDQUFBO0FBQUEsTUFLQSxFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQSxHQUFBO0FB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/project-spec.coffee