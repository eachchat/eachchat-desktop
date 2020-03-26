/**
 * Loader
 * @author Jakit
 * @date 2020/03/04
 */

function loading(name, obj) {
  (function (global) { global[name] = obj; })(typeof window === "object" ? window : typeof global === "object" ? global : this)
}

function use(name) {
  var getModule = undefined;
  (function (global) { getModule = global[name] })(typeof window === "object" ? window : typeof global === "object" ? global : this);
  return getModule;
}

export {
  loading,
  use
}
