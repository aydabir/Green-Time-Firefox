console.info('BlockList is loaded');

/*
 BlockList : blueprint for the BlockList
 @return void
 */
var BlockList = function () {
  "use strict";

  // Private Variables [1]
  var _urlList = [];
  var _daytimeList = [];

  /*
   * find : returns index of the found domain if it fails will return false
   * @param domain : it must be instance of Domain
   */
  var find = function (domain) {
    "use strict";
    if (!(domain instanceof Domain)) {
      console.error("Domain is not valid");
      return false;
    }
    var _index = _.findIndex(_urlList, {url: domain.url});
    var result = {index: _index, status: parseInt(_index) !== parseInt(-1) ? true : false};
    return result;
  };

  //Public Variables

  // Public Methods [4]
  /*
   * getUrlList : returns the _urlList
   * @return empty array or the _urlList
   */
  this.getUrlList = function () {
    if (Util.isEmpty(_urlList)) {
      console.warn("Empty blocked domain list");
      return [];
    } else {
      return _urlList;
    }
  };

  /**
   *
   * @param newList
   */
  this.setUrlList = function (newList) {
    _urlList = newList;
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
    if (!(domain instanceof Domain)) {
      console.error("Domain is not valid");
      return false;
    }
    if (find(domain).status) {
      console.error("this domain already added if you want update a domain, call the .update(domain) function");
      return false;
    }
    var tempList;
    if (!Utils.isEmpty(_urlList)) {
      tempList = this.getUrlList();
    } else {
      tempList = [];
    }
    tempList.push(domain);
    browser.storage.local.set({"urlList": tempList}, function () {
      _urlList.push(domain);
      loadStorage();
      console.info("Added");
    });
    return true;
  };

  /*
   updateDomain : updates given domain from the _urlList
   @param domain : must be instance of the Domain object
   @return boolean
   */
  this.updateDomain = function (domain) {
    if (!(domain instanceof Domain)) {
      console.error("Domain is not valid");
      return false;
    }

    var indexOfDomain = find(domain);
    if (!indexOfDomain.status) {
      console.error("given domain doesn't exist on the _urlList");
      return false;
    }
    _urlList[indexOfDomain.index] = domain;

    browser.storage.local.set({"blockList": _urlList}, function () {
      console.info("Updated");
    });
    return true;
  };

  /*
   view : it's print a fancy table of the _urlList on the console
   @return void
   */
  this.view = function () {
    console.table(blockList.getUrlList());
  };

};
/*
 Domain : blueprint of domains
 @param paramUrl : the web url of the website
 @return boolean only if false
 */
var Domain = function (_url, _waitTime, _category) {
  "use strict";
  if (typeof _url === "string") {

    if (Util.isEmpty(_url)) {
      throw Error("Domain url must be entered");
    }

    this.url = _url;
    this.waitTime = _waitTime || 5;
    this.category = _category || 'General';

  } else if (typeof _url === "object") {

    if (Util.isEmpty(_url.url)) {
      throw Error("Domain url must be entered");
    }

    var obj = _url;
    this.url = obj.url;
    this.waitTime = obj.waitTime || 5;
    this.category = obj.category || 'General';
  }

  this.statistics = {
    totalVisitCount: 0,
    totalVisitTime: 0
  }
};

}
