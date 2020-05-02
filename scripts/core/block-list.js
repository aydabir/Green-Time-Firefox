console.info('block-list.js is loaded');

var minuteToMillisec = 60*1000; // 1 minute in milliseconds
/*
 BlockList : blueprint for the BlockList
 @return void
 */
var BlockList = function () {
  "use strict";

  // Private Variables [1]
  var _domainList = [];
  var _daytimeList = [];

  /*
   * find : returns index of the found domain if it fails will return false
   * @param url : url of the domain
   */
  this.findDomain = function (url) {
    "use strict";

    if(typeof(url) != "string")
      throw Error("Url has to be a string");

    // return the domain if url is satisfied 
    var _index = _domainList.findIndex(function(domain) {
      return checkDomain(domain.url , url);
    });

    var result = {index: _index, status: parseInt(_index) !== parseInt(-1) ? true : false};
    return result;
  };

  /*
   * Helper function that checks two urls have same domain.
   * @param inputURL: url string that user has blocked
   * @param currentURL: url string at browser tab 
   */
  function checkDomain(inputURL , currentURL) {
    if(typeof(inputURL) != "string")
      throw Error("Input Url has to be a string");

    if(typeof(currentURL) != "string")
      throw Error("Current Url has to be a string");

    var needleURL = inputURL.replace(/\s+/, "").replace(/www\./, "").replace(/https:\/\//, "").replace(/\//, "").toLowerCase();
    var haystackURL = currentURL.replace(/\s+/, "").replace(/www\./, "").replace(/https:\/\//, "").replace(/\//, "").toLowerCase();
    if (needleURL.length > haystackURL.length) { return false; }
     var haystackSubstr = haystackURL.substring(0,needleURL.length);
     return haystackSubstr == needleURL;
  }

  //Public Variables

  // Public Methods [4]
  /*
   * getUrlList : returns the list of urls (not domain objects)
   * @return empty list or a list of strings
   */
  this.getUrlList = function () {
    //console.log("Domain List : " + _domainList);
    if (Util.isEmpty(_domainList)) {
      console.warn("Empty blocked domain list");
      return [];
    } else {
      var urlList = [];
      for(const d of _domainList){
        //console.log("Get URL List : " + d.url);
        urlList.push(d.url);
      }
      return urlList;
    }
  };

  /**
   *
   * @param newList
   */
  this.setUrlList = function (newList, category="General") {
    // override
    _domainList = []
    for(const url of newList){
      _domainList.push(new Domain(url, category));
    }
    this.storeCookies();
  };

  this.getDaytimeList = function () {
      if (Util.isEmpty(_daytimeList)) {
          console.warn("Empty daytime intervals list");
          return [];
      } else {
          return _daytimeList;
      }
  };

  this.setDaytimeList = function (newList) {
    _daytimeList = newList;
    this.storeCookies();
  };

  this.storeCookies = function () {
    browser.storage.local.set({
      "urlList": this.getUrlList(),
      "daytimeList": this.getDaytimeList()
    });
  }

  /*
   addDomain : adds a new domain to the _urlList
   @param domain : must be instance of the Domain object
   @return boolean
   */
  this.addDomain = function (domain) {
    // NOTE: Unused. Needs a fix, or may be removed
    if (!(domain instanceof Domain)) {
      console.error("Domain is not valid");
      return false;
    }
    // domain already exists?
    if (findDomain(domain).status) {
      console.error("this domain already added if you want update a domain, call the .updateDomain() function");
      return false;
    }
    if (Utils.isEmpty(_domainList)) {
      _domainList = [];
    }
    // add to list and save
    _domainList.push(domain);
    this.storeCookies();

    return true;
  };

  /*
   updateDomain : updates given domain from the _urlList
   @param domain : must be instance of the Domain object
   @return boolean
   */
  this.updateDomain = function (domain) {
    // NOTE: Unused. Needs a fix, or may be removed
    if (!(domain instanceof Domain)) {
      console.error("Domain is not valid");
      return false;
    }

    var indexOfDomain = this.findDomain(domain).index;
    if (!indexOfDomain.status) {
      console.error("given domain doesn't exist on the list");
      return false;
    }
    // update and save
    _domainList[indexOfDomain.index] = domain;
    this.storeCookies();

    return true;
  };

  this.addUrl = function (url, category="General") {
    if(typeof(url) != "string")
      throw Error("Url has to be a string");

    _domainList.push(new Domain(url, category));

    this.storeCookies();
  };

  this.removeUrl = function (url) {
    if(typeof(url) != "string")
      throw Error("Url has to be a string");

    // find and destroy
    var result = this.findDomain(url);

    if(result.status){
      _domainList.splice(result.index, 1);
    }
    this.storeCookies();
  };

  /*
   view : it's print a fancy table of the _urlList on the console
   @return void
   */
  this.view = function () {
    console.table(blockList.getUrlList());
  };

  /*
    Returns the domain by url
    @url: url of the domain
    @return domain or null
  */
  this.getDomain = function(url) {
    var result = this.findDomain(url);
    if(result.status)
      return _domainList[result.index];
    else
      return null;
  }

  /*
    waitOnDomain : starts the waiting timer on a domain, this domain can be visited
    during this time, in the end the timer calls endWaiting() method of the domain
    @param url: address to wait on
    @param time : minutes of time to wait
  */
  this.waitOnDomain = function(url, time) {
    // index of domain
    var d_i = this.findDomain(url).index
    _domainList[d_i].startWaiting(time);
  }

};
/*
 Domain : blueprint of domains
 @param paramUrl : the web url of the website
 @return boolean only if false
 */
var Domain = function (_url, _category) {

  if (typeof _url != "string")
    throw Error("Domain url must be a string");
  if (Util.isEmpty(_url))
    throw Error("Domain url must be entered");

  this.url = _url;
  // NOTE: currently category is unused
  this.category = _category || 'General';
  this.isWaiting = false;
  // if the blocking is postponed (waiting), this is the time when it will end
  this.postponeTime = null;

  // starts a timer, until the timeout this domain is not blocked
  this.startWaiting = function(time){
    this.isWaiting = true;
    // remember time to report later
    this.postponeTime = Date.now() + time*minuteToMillisec;
    // start timer for waiting
    setTimeout(this.endWaiting, time*minuteToMillisec);
    console.log("Waiting " + time + "m on " + this.url);
  }

  // Callback to end the waiting
  // Using bind, otherwise JS won't respect 'this' keyword. See below:
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#The_this_problem
  this.endWaiting = (function(){
    console.log("Waiting has finished on " + this.url);
    this.isWaiting = false;
  }).bind(this);

  this.statistics = {
    totalVisitCount: 0,
    totalVisitTime: 0
  }
};
