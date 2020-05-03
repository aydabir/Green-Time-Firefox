console.info('background.js is loaded');

// TODO: Waiting time options
// Properties of background script
var blockList = new BlockList();

var targetUrlList = [];

// This function is called once in the start of the browser
function initialize() {
  // default values (in case of the first run)
  blockList.setUrlList(["facebook.com"]);
  blockList.setDaytimeList([{ from: "00:00", to: "23:59" }]);

  load_options();
}

// Funcitons of background script
function tabUpdate(tabId, changeInfo, tab) {
  console.log("onUpdated " + tab.url);
  testAndBlock(tab);
}

// this is called when a tab is created
function tabCreate(tabId, changeInfo, tab) {
  console.log("onCreated " + tab.url);
  testAndBlock(tab);
}

// handle the messages coming from content scripts
function handleMessage(request, sender, sendResponse) {
  console.log("Message received: " + request.topic);
  if (!request.topic) {
    console.log("BG message request.topic should be specified!");
  }
  // Act according to request.topic
  switch (request.topic) {
    case "start waiting":
      // this domain will not be filtered while waiting
      blockList.waitOnDomain(targetUrlList[sender.tab.id], request.time);
      break;

    case "console log":
      printLog(request.log);
      break;

    case "update options":
      updateOptions(request.options);
      break;

    case "request green-pass url":
      sendGreenPassTarget(sender.tab.id);
      break;

    case "close tab":
      closeTab(sender.tab.id);
      break;

    case "block url":
      blockList.addUrl(request.url);
      // we use a callback, since query is asynch
      browser.tabs.query({ "currentWindow": true, "active": true }, function (tabs) {
        testAndBlock(tabs[0]);
      });
      break;

    case "unblock url":
      blockList.removeUrl(request.url);
      // refresh the page, so the injected overlay will disappear
      browser.tabs.reload();
      break;

    case "request current tab info":
      // we use a callback, since query is asynch
      browser.tabs.query({ "currentWindow": true, "active": true }, function (tabs) {
        sendTabInfo(tabs);
      });
      break;

    default:
      console.log("BG message request.topic is not understood!");
  }
}

// a general function to restore options
// it is called at initialization
function load_options() {
  // cookies of interest
  var cookie_names = ["urlList", "daytimeList"];
  // NOTE: we are using the 'chrome' way of reading the storage
  browser.storage.local.get(cookie_names, function (items) {
    // control the undefined case
    if (!items || items.length < 2) {
      console.error("Option items are not proper.");
      return;
    }
    // in the first run they will be 'undefined'. Keep the default values then.
    if (!Util.isEmpty(items.urlList))
      blockList.setUrlList(items.urlList);
    if (!Util.isEmpty(items.daytimeList))
      blockList.setDaytimeList(items.daytimeList);
  });

  // log the bg console
  console.log("Options loaded:");
  // report the loaded cookies
  console.log(blockList.getUrlList());
  console.log(blockList.getDaytimeList());
}

function testAndBlock(tab) {
  // check if the page should be filtered
  doFilter = filterTab(tab);
  // show green-pass if it does
  if (doFilter) {
    bringGreenPass(tab);
  }
}

// Decides if the tab should be filtered or not
// Checks the user URL-list
// Also controls the waiting time
function filterTab(tab) {

  // check undefined (new tab situation)
  if (!tab || !tab.url) {
    return false;
  }

  // check daytime
  // TODO: separate daytime intervals for separate url lists
  if (!filterDaytime()) return false;

  var domain = blockList.getDomain(tab.url);

  // filter if the domain is on the list AND not waiting
  return (domain && !domain.isWaiting)
}

// returns daytime as minutes from 00:00
// hours * 60 + minutes
function parseDaytime(strTime) {
  arrTime = strTime.split(":");
  return parseInt(arrTime[0]) * 60 + parseInt(arrTime[1])
}

// compare current time if it fits to 'any' of the daytime intervals
function filterDaytime() {
  // get current time and create a string of HH:SS format
  var currentDate = new Date();
  var currentDaytime = currentDate.getHours() * 60 + currentDate.getMinutes();

  daytimeList = blockList.getDaytimeList();
  // compare if it fits to 'any' of the interval
  //iterate all intervals in list
  len = daytimeList.length;
  for (var i = 0; i < len; i++) {
    // TODO: check empty/improper daytime
    var daytimeFrom = parseDaytime(daytimeList[i].from);
    var daytimeTo = parseDaytime(daytimeList[i].to);

    // in this interval? then filter applies
    if (currentDaytime > daytimeFrom && currentDaytime < daytimeTo) {
      return true
    }
  }
  return false;
}

// Show green-pass.html in the tab
function bringGreenPass(tab) {
  // Show the green-pass view
  // record targetUrl to inform green-pass later
  greenPassViewUrl = browser.runtime.getURL('views/green-pass.html');

  var injectScript = `GreenTime.showGreenPassView();`;

  browser.tabs.executeScript(tab.id, { code: injectScript });

  targetUrlList[tab.id] = tab.url;
}

// Closes the current tab. Firefox doesn't permit closing by page script
function closeTab(tabId) {
  // undefined?
  if (!tabId) {
    console.log("Closed tab id is undefined!");
    return;
  }
  // Close it
  browser.tabs.remove(tabId);
}

// Sends green-pass page the url to direct. It is used when the user choses to 'visit'
function sendGreenPassTarget(tabId) {
  // undefined?
  if (!tabId) {
    console.log("Green-pass tab id is undefined!");
    return;
  }
  // inform Green-pass
  browser.tabs.sendMessage(tabId, { topic: "green-pass url", targetUrl: targetUrlList[tabId] });
}

// updates the options with the option values coming with message
function updateOptions(options) {
  // undefined?
  if (!options) {
    console.log("Options are undefined!");
    return;
  }
  // assign bg variables
  blockList.setUrlList(options.urlList);
  blockList.setDaytimeList(options.daytimeList)

  console.log("Options are updated.");
}

// prints the logs coming from other scripts
// to background console for easier debug
function printLog(strLog) {
  if (!strLog) {
    console.log("Please assign the request.log field \
    in \"console log\" messages");
    return;
  }

  console.log(strLog);
}

function sendTabInfo(tabs) {
  // this method will send the info of the given tabs as a message
  var infoList = [];

  for (tab of tabs) {
    var tab_domain = blockList.getDomain(tab.url);
    var tabinfo = { "url": tab.url, "listed": Boolean(tab_domain), "postponeTime": -1}
    if (tab_domain)
      tabinfo["postponeTime"] = tab_domain.postponeTime;
    infoList.push(tabinfo);
  }

  console.log("sending tab info");
  browser.runtime.sendMessage({ topic: "tab info", "infoList": infoList });
}

function onQueryError(error) {
  console.log(`Error: ${error}`);
}

var plugin = {

  /*
   * onUpdate
   * Each request pass here on load stage
   */
  onLoad: function (context) {
    log('onLoad event is fired : ' + context.tab.url, 'warn');
  },

  /*
   * beforeEnter
   * Each request pass here on completed stage
   */
  onCompleted: function (context) {
    log('onCompleted event is fired : ' + context.tab.url, 'warn');
  }

};


initialize();
