# minidump - Process minidump files

## Installing

```sh
npm install minidump
```

## Building
  * Clone the repository recursively
  * Run `npm install`

## Docs

```javascript
minidump = require('minidump');
```

### minidump.addSymbolPath(path1, ..., pathN)

Add search paths for looking up symbol files.

### minidump.walkStack(minidumpFilePath, [symbolPaths, ]callback)

Get the stack trace from `minidumpFilePath`, the `callback` would be called
with `callback(error, report)` upon completion.

### minidump.dumpSymbol(binaryPath, callback)

Dump debug symbols in minidump format from `binaryPath`, the `callback` would
be called with `callback(error, minidump)` upon completion.
