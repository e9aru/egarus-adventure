/*jshint -W008 */

var UTILS = (function(){
  'use strict';

  function lsSet(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
  }

  function lsGet(name) {
    return JSON.parse(localStorage.getItem(name)) || { level: 0};
  }

  function lsRemove(name) {
    localStorage.removeItem(name);
  }

  return {
    storage: {
      remove: lsRemove,
      set: lsSet,
      get: lsGet
    }
  };
})();