"use strict";

// This script should not be modified
// unless some core operations are needed.
// It basically is a substructure
// to call functions of extend/background.js script



/*
 * Util : some helper functions
 */
var Util = {
  /*
   isEmpty : check the given object is empty,null or undefined
   @return boolean
   */
  isEmpty: function (value) {
    if (typeof value == "string") value = value.trim();
    return value == null ||
        value === '' ||
        value === undefined ||
        value === null ||
        Object.keys(value).length === 0;
  }
};

document.addEventListener('DOMContentLoaded', function() {
  browser.tabs.onCreated.addListener(tabCreate);

  browser.tabs.onUpdated.addListener(tabUpdate);

  browser.runtime.onMessage.addListener(handleMessage);

  initialize();

});
