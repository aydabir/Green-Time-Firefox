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
      throw Error("Url has to be a string")

    // TODO: strip url to the bare domain before searching
    // return the domain if url is satisfied (search >= 0)
    var _index = _domainList.findIndex(function(domain) {return (url.search(domain.url)>=0)});
    var result = {index: _index, status: parseInt(_index) !== parseInt(-1) ? true : false};
    return result;
  };

  //Public Variables

  // Public Methods [4]
  /*
   * getUrlList : returns the list of urls (not domain objects)
   * @return empty list or a list of strings
   */
  this.getUrlList = function () {
    if (Util.isEmpty(_domainList)) {
      console.warn("Empty blocked domain list");
      return [];
    } else {
      var urlList = [];
      for(const d of _domainList){
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
  };

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
    // add to list
    _domainList.push(domain);
    // save as a cookie
    browser.storage.local.set({"urlList": this.getUrlList()});

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

    var indexOfDomain = this.findDomain(domain);
    if (!indexOfDomain.status) {
      console.error("given domain doesn't exist on the list");
      return false;
    }
    // update
    _domainList[indexOfDomain.index] = domain;
    // save as a cookie
    browser.storage.local.set({"urlList": this.getUrlList()});

    return true;
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

  this.startWaiting = function(time){
    this.isWaiting = true;
    // start timer for waiting
    setTimeout(this.endWaiting, time*minuteToMillisec);
    console.log("Waiting " + time + "m on " + this.url);
  }

  // Callback to end the waiting
  this.endWaiting = function(){
    console.log("Waiting has finished on " + this.url);
    this.isWaiting = false;
  }

  this.statistics = {
    totalVisitCount: 0,
    totalVisitTime: 0
  }
};
