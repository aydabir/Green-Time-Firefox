"use strict";

// This script should not be modified
// unless some core operations are needed.
// It basically is a substructure
// to call functions of extend/background.js script




document.addEventListener('DOMContentLoaded', function() {
  browser.tabs.onCreated.addListener(tabCreate);

  browser.tabs.onUpdated.addListener(tabUpdate);

  browser.runtime.onMessage.addListener(handleMessage);

  initialize();

});
