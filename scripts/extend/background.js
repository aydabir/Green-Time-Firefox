console.info('Background is loaded');

// Properties of background script
var isWaiting = false; // waiting now? control variable
var minuteMultiplier = 60*1000; // bekleme süresi: 5 dakika

// TODO: Waiting time options
var blockList = new BlockList();

var passUrlList = [];

// This function is called once in the start of the browser
function initialize(){
  // default values (in case of the first run)
  blockList.setUrlList(["facebook.com"]);
  blockList.setDaytimeList([{from:"00:00", to:"23:59"}]);

  load_options();
}

// Funcitons of background script
function tabUpdate(tabId, changeInfo, tab){
  console.log("onUpdated "+tab.url);
  // check if the page should be filtered
  doFilter = filterTab(tab);
  console.log(tabId);
  // show green-pass if it does
  if(doFilter){
    bringGreenPass(tab);
  }
}

// this is called when a tab is created
function tabCreate(tabId, changeInfo, tab){
  // check if the page should be filtered
  doFilter = filterTab(tab);
  // show green-pass if it does
  if(doFilter){
    bringGreenPass(tab);
  }
}

// handle the messages coming from content scripts
function handleMessage(request, sender, sendResponse){
  console.log("Message received: " + request.topic);
  if(!request.topic){
    console.log("BG message request.topic should be specified!");
  }
  // Act according to request.topic
  switch (request.topic) {
    case "start waiting":
      startWaiting(request.time);
      break;

    case "console log":
      printLog(request.log);
      break;

    case "update options":
      updateOptions(request.options);
      break;

    case "green-pass url":
      sendGreenPassUrl(sender.tab.id);
      break;

    case "close tab":
      closeTab(sender.tab.id);
      break;

    default:
      console.log("BG message request.topic is not understood!");
  }
}

// a general function to restore options
// it is called at initialization
function load_options() {
  // cookies of interest
  var cookie_names = ["urlList","daytimeList"];
  // NOTE: we are using the 'chrome' way of reading the storage
  browser.storage.local.get(cookie_names, function(items) {
    // control the undefined case
    if(!items || items.length < 2){
      console.error("Option items are not proper.");
      return;
    }
    // in the first run they will be 'undefined'. Keep the default values then.
    if(!Util.isEmpty(items.urlList))
      blockList.setUrlList(items.urlList);
    if(!Util.isEmpty(items.daytimeList))
      blockList.setDaytimeList(items.daytimeList);
  });

  // log the bg console
  console.log("Options loaded:");
  // report the loaded cookies
  console.log(blockList.getUrlList());
  console.log(blockList.getDaytimeList());
}

// Decides if the tab should be filtered or not
// Checks the user URL-list
// Also controls the waiting time
function filterTab(tab){

  // check undefined (new tab situation)
  if(!tab || !tab.url){
    return false;
  }

  // check waiting time
  if(isWaiting) return false;

  // check daytime
  if(!filterDaytime()) return false;

  urlList = blockList.getUrlList();
  // iterate all urls in list
  len = urlList.length;
  for(var i=0; i<len; i++){
    // if empty then skip
    if(urlList[i].length <= 0) continue;

    var n = tab.url.search(urlList[i]);
    // does it match to the url?
    if (n >= 0) return true;
  }

  return false;
}

// compare current time if it fits to 'any' of the daytime intervals
function filterDaytime() {
  // get current time and create a string of HH:SS format
  var currentDate = new Date();
  var strTime = currentDate.getHours()+":"+currentDate.getMinutes()+":00";

  daytimeList = blockList.getDaytimeList();
  // compare if it fits to 'any' of the interval
  //iterate all intervals in list
  len = daytimeList.length;
  for(var i=0; i<len; i++){
    // TODO: check empty/improper daytime
    var strFrom = daytimeList[i].from+":00";
    var strTo = daytimeList[i].to+":00";

    // in this interval? then filter applies
    if (strTime > strFrom && strTime < strTo){
      return true
    }
  }
  return false;
}

// Show green-pass.html in the tab
function bringGreenPass(tab){
  // Show the green-pass view
  browser.tabs.update(tab.id, {url: "views/green-pass.html"});
  // record passUrl to inform green-pass later
  passUrlList[tab.id] = tab.url;
}

// starts waiting the given time*minutes
function startWaiting(time){
  isWaiting = true;
  var totalWait = time*minuteMultiplier;
  // start timer for waiting
  setTimeout(endWaiting, totalWait);
  console.log(totalWait + " Waiting has started");
}

// Procedure to call in the end of the waiting
function endWaiting(){
  console.log("Waiting has ended");
  isWaiting = false;
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

// sends green-pass page the url to direct, if user choses to 'visit'
function sendGreenPassUrl(tabId){
  // undefined?
  if (!tabId) {
    console.log("Green-pass tab id is undefined!");
    return;
  }
  // inform Green-pass
  browser.tabs.sendMessage(tabId, {passUrl: passUrlList[tabId]});
}

// updates the options with the option values coming with message
function updateOptions(options){
  // undefined?
  if (!options) {
    console.log("Options are undefined!");
    return;
  }
  // assign bg variables
  urlList = options.urlList;

  console.log("Options are updated.");
}

// prints the logs coming from other scripts
// to background console for easier debug
function printLog(strLog){
  if (!strLog) {
    console.log("Please assign the request.log field \
    in \"console log\" messages");
    return;
  }

  console.log(strLog);
}


var plugin = {

  /*
   * onUpdate
   * Each request pass here on load stage
   */
  onLoad: function(context) {
    log('onLoad event is fired : ' + context.tab.url, 'warn');
  },

  /*
   * beforeEnter
   * Each request pass here on completed stage
   */
  onCompleted: function(context) {
    log('onCompleted event is fired : ' + context.tab.url, 'warn');
  }

};


initialize();
