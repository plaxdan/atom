(function() {
  var BSD3LicenseText, MITLicenseText, PermissiveLicenses, existsSync, extend, extractLicense, extractLicenseFromDirectory, extractLicenseFromReadme, extractRepository, findLicenses, isBSDLicense, isMITLicense, join, omitPermissiveLicenses, readFileSync, readIfExists, readInstalled, size, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  readInstalled = require('read-installed');

  _ref = require('underscore'), size = _ref.size, extend = _ref.extend;

  join = require('path').join;

  _ref1 = require('fs'), existsSync = _ref1.existsSync, readFileSync = _ref1.readFileSync;

  module.exports = function(options, cb) {
    var omitPermissive, overrides, path;
    path = options.path, overrides = options.overrides, omitPermissive = options.omitPermissive;
    return readInstalled(path, null, console.log, function(err, packageData) {
      var licenseSummary;
      if (err != null) {
        return cb(err);
      }
      try {
        licenseSummary = overrides != null ? overrides : {};
        findLicenses(licenseSummary, packageData, path);
        if (omitPermissive) {
          omitPermissiveLicenses(licenseSummary);
        }
        return cb(null, licenseSummary);
      } catch (_error) {
        err = _error;
        return cb(err);
      }
    });
  };

  findLicenses = function(licenseSummary, packageData, path) {
    var data, dependencies, dependencyPath, engines, entry, id, name, version, _results;
    name = packageData.name, version = packageData.version, dependencies = packageData.dependencies, engines = packageData.engines;
    id = "" + name + "@" + version;
    if (!existsSync(path)) {
      return;
    }
    if (licenseSummary[id] == null) {
      entry = {
        repository: extractRepository(packageData)
      };
      extend(entry, extractLicense(packageData, path));
      licenseSummary[id] = entry;
      if (size(dependencies) > 0) {
        _results = [];
        for (name in dependencies) {
          data = dependencies[name];
          dependencyPath = join(path, 'node_modules', name);
          _results.push(findLicenses(licenseSummary, data, dependencyPath));
        }
        return _results;
      }
    }
  };

  extractRepository = function(_arg) {
    var repository;
    repository = _arg.repository;
    if (typeof repository === 'object') {
      repository = repository.url.replace('git://github.com', 'https://github.com').replace('.git', '');
    }
    return repository;
  };

  extractLicense = function(_arg, path) {
    var license, licenses, readme, result, _ref2, _ref3;
    license = _arg.license, licenses = _arg.licenses, readme = _arg.readme;
    if ((licenses != null ? licenses.length : void 0) > 0) {
      if (license == null) {
        license = licenses[0];
      }
    }
    if (result = extractLicenseFromDirectory(path)) {
      return result;
    } else if (license != null) {
      if (typeof license !== 'string') {
        license = (_ref2 = license.type) != null ? _ref2 : 'UNKNOWN';
      }
      if (license.match(/^BSD-.*/)) {
        license = 'BSD';
      }
      if (license.match(/^MIT\W/)) {
        license = 'MIT';
      }
      if (license.match(/^Apache.*/)) {
        license = 'Apache';
      }
      if (license === 'WTFPL') {
        license = 'WTF';
      }
      return {
        license: license,
        source: 'package.json'
      };
    } else {
      return (_ref3 = extractLicenseFromReadme(readme)) != null ? _ref3 : {
        license: 'UNKNOWN'
      };
    }
  };

  extractLicenseFromReadme = function(readme) {
    var license;
    if (readme == null) {
      return;
    }
    license = readme.indexOf('MIT') > -1 ? 'MIT' : readme.indexOf('BSD') > -1 ? 'BSD' : readme.indexOf('Apache License') > -1 ? 'Apache' : readme.indexOf('DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE') > -1 ? 'WTF' : void 0;
    if (license != null) {
      return {
        license: license,
        source: 'README',
        sourceText: readme
      };
    }
  };

  extractLicenseFromDirectory = function(path) {
    var license, licenseFileName, licenseText;
    licenseFileName = 'LICENSE';
    licenseText = readIfExists(join(path, licenseFileName));
    if (licenseText == null) {
      licenseFileName = 'LICENSE.md';
      licenseText = readIfExists(join(path, licenseFileName));
    }
    if (licenseText == null) {
      licenseFileName = 'LICENSE.txt';
      licenseText = readIfExists(join(path, licenseFileName));
    }
    if (licenseText == null) {
      licenseFileName = 'LICENCE';
      licenseText = readIfExists(join(path, licenseFileName));
    }
    if (licenseText == null) {
      licenseFileName = 'MIT-LICENSE.txt';
      if (licenseText = readIfExists(join(path, licenseFileName))) {
        license = 'MIT';
      }
    }
    if (licenseText == null) {
      return;
    }
    if (license == null) {
      license = licenseText.indexOf('Apache License') > -1 ? 'Apache' : isMITLicense(licenseText) ? 'MIT' : isBSDLicense(licenseText) ? 'BSD' : licenseText.indexOf('The ISC License') > -1 ? 'ISC' : void 0;
    }
    if (license != null) {
      return {
        license: license,
        source: licenseFileName,
        sourceText: licenseText
      };
    }
  };

  readIfExists = function(path) {
    if (existsSync(path)) {
      return readFileSync(path, 'utf8');
    }
  };

  MITLicenseText = "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.".replace(/\s+/gm, ' ');

  isMITLicense = function(licenseText) {
    var normalizedLicenseText, startIndex;
    if (licenseText.indexOf('MIT License') > -1) {
      return true;
    } else {
      startIndex = licenseText.indexOf('Permission is hereby granted');
      if (startIndex > -1) {
        normalizedLicenseText = licenseText.slice(startIndex).replace(/\s+/gm, ' ').replace(/\s+$/m, '');
        return normalizedLicenseText === MITLicenseText;
      } else {
        return false;
      }
    }
  };

  BSD3LicenseText = "Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\n\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\n\nTHIS IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.".replace(/\s+/gm, ' ');

  isBSDLicense = function(licenseText) {
    var normalizedLicenseText, startIndex;
    if (licenseText.indexOf('BSD License') > -1) {
      return true;
    } else {
      startIndex = licenseText.indexOf('Redistribution and use');
      if (startIndex > -1) {
        normalizedLicenseText = licenseText.slice(startIndex).replace(/\s+/gm, ' ').replace(/\s+$/m, '');
        return normalizedLicenseText === BSD3LicenseText;
      } else {
        return false;
      }
    }
  };

  PermissiveLicenses = ['MIT', 'BSD', 'Apache', 'WTF', 'LGPL', 'ISC', 'Artistic-2.0'];

  omitPermissiveLicenses = function(licenseSummary) {
    var license, name, _results;
    _results = [];
    for (name in licenseSummary) {
      license = licenseSummary[name].license;
      if (__indexOf.call(PermissiveLicenses, license) >= 0) {
        _results.push(delete licenseSummary[name]);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

}).call(this);
