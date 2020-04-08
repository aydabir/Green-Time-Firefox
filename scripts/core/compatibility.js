// This script is run before anything to set variables to compatible ones

// chrome specific compatibility
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

if (isChrome){
  var browser = chrome;
}
