const { getIsWindows, getWindowsVersion, setLogger } = require('./utils')
const { noop, NoopClass } = require('./noops')
const win = getIsWindows() ? getWindowsVersion() : null

let _exports

/**
 * Overrides the logger on all methods and classes.
 *
 * @param {function} fn - Logger function to use
 */

// Requiring native Windows stuff on a non-windows machine isn't a great idea,
// so we just export no-ops with console warnings.
if (process.platform !== 'win32' || !(win === '10.0' || win === '8.1' || win === '8')) {
  _exports = {
    Media: NoopClass,
    setLogger: noop
  }
} else {
  _exports = {
    Media: require('./media'),
    setLogger
  }
}

module.exports = _exports
