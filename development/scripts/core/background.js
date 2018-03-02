"use strict";

// This script should not be modified
// unless some core operations are needed.
// It basically is a substructure
// to call functions of extend/background.js script

/*
 BlockList : blueprint for the BlockList
 @return void
 */
var BlockList = function () {
  "use strict";

  // Private Variables [1]
  var _list = [];

  // Private Methods [3]
  /*
   * loadStorage : load stored data from browser api and set to the _list
   * @return filled or empty array
   */
  var loadStorage = function () {
    browser.storage.local.get("blockList", function (data) {
      if (Util.isEmpty(data)) {
        console.warn("Null blocked domain list");
        return [];
      } else {
        _list = data.blockList;
        return {
          "list": data.blockList
        };
      }
    });
  };
  var constructor = (function () {
    loadStorage();
  })();
  /*
   * find : it's return index of the founded domain if it's fail will be return false
   * @param domain : it must be instance of Domain
   */
  var find = function (domain) {
    "use strict";
    if (!(domain instanceof Domain)) {
      console.error("Domain is not valid");
      return false;
    }
    var _index = _.findIndex(_list, {url: domain.url});
    var result = {index: _index, status: parseInt(_index) !== parseInt(-1) ? true : false};
    return result;
  };

  //Public Variables

  // Public Methods [4]
  /*
   * getList : it's return the _list
   * @return empty array or the _list
   */
  this.getList = function () {
    if (Util.isEmpty(_list)) {
      console.warn("Null blocked domain list");
      return [];
    } else {
      return _list;
    }
  };
  /*
   addaddDomain : it's add a new domain to the _list
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
    if (_list.length > 0) {
      tempList = this.getList();
    } else {
      tempList = [];
    }
    tempList.push(domain);
    browser.storage.local.set({"blockList": tempList}, function () {
      _list.push(domain);
      loadStorage();
      console.info("Added");
    });
    return true;
  };
  /*
   updateDomain : it's update given domain from the _list
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
      console.error("given domain doesn't exist on the _list");
      return false;
    }
    _list[indexOfDomain.index] = domain;

    browser.storage.local.set({"blockList": _list}, function () {
      console.info("Updated");
    });
    return true;
  };
  /*
   view : it's print a fancy table of the _list on the console
   @return void
   */
  this.view = function () {
    console.table(blockList.getList());
  };
  /*
   clear : clear all domains in _list
   @param areYouDrunk : you must provide you're not drunk
   @return boolean
   */
  this.clear = function (areYouDrunk) {
    if (!Util.isEmpty(areYouDrunk) && areYouDrunk.toString() == "Nope") {
      _list = [];
      browser.storage.local.set({"blockList": _list}, function () {
        console.info("Cleaned");
      });
      return true;
    } else {
      console.error("System.Exception.TooMuchBeer");
      console.warn("Please shut the PC and go to the bed.");
      return false;
    }
  }

};

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



document.addEventListener('DOMContentLoaded', function() {
  browser.tabs.onCreated.addListener(tabCreate);

  browser.tabs.onUpdated.addListener(tabUpdate);

  browser.runtime.onMessage.addListener(handleMessage);

  initialize();

});
