function handleDomLoaded() {

	// button is hidden until the tab info is obtained
  document.getElementById('blockBtn').style.display = "none";

	// request the tab info
	browser.runtime.sendMessage({topic: "request current tab info"});
}

// this method is called when the tab info is received
// tabinfo contains {url:string, listed:bool, domain:block-list.Domain}
function initPage(tabinfo){
  browser.runtime.sendMessage({topic: "console log",log:"Action received tab info"});

  toggleButtonType(tabinfo.url, tabinfo.listed);

  // show the remaining time if listed
  if(tabinfo.listed)
    showRemainingTime(tabinfo.postponeTime);

}

function blockPage(){
  // hide the button when pressed
  document.getElementById('blockBtn').style.display = "none";
  // request block
  var url = document.getElementById("textUrl").innerHTML;
  browser.runtime.sendMessage({topic: "block url", "url":url});
  // show the new button
  toggleButtonType(url, true);
}

function unblockPage(){
  // hide the button when pressed
  document.getElementById('blockBtn').style.display = "none";
  // request unblock
  var url = document.getElementById("textUrl").innerHTML;
  browser.runtime.sendMessage({topic: "unblock url", "url":url});
  // show the new button
  toggleButtonType(url, false);
}

function toggleButtonType(url, isBlocked){
  // switches between block or unblock button depending to the tab state
  const urlObj = new URL(url);
  document.getElementById("textUrl").innerHTML = urlObj.hostname;

  var blockBtn = document.getElementById('blockBtn');

  // toggle function of the button
  if(isBlocked){
    blockBtn.innerHTML = "Unblock";
    blockBtn.addEventListener('click', unblockPage);

  }else{
    blockBtn.innerHTML = "Block";
    blockBtn.addEventListener('click', blockPage);
  }
  // set button visible
  blockBtn.style.display = "block";
}

function writeSecondsAsMinutes (seconds) {
  var minutesStr = ""+parseInt( Math.floor(seconds/60.0))
  var secondsStr = ""+parseInt( Math.floor(seconds%60.0))
  // add preceding zero
  if (secondsStr.length == 1)
    secondsStr = "0" + secondsStr;
  return minutesStr + ":" + secondsStr;
}

function showRemainingTime (postponeTime) {
  // only shown if actually postponed
  if (postponeTime <= 0)
    return;
  // convert millis (/1000) to seconds
  var remainingSeconds = (postponeTime - Date.now())/1000
  // update html
  document.getElementById("textRemainingTime").innerHTML = writeSecondsAsMinutes(remainingSeconds) + " m remaining";

  setInterval(function(){
    remainingSeconds -= 1;
    document.getElementById("textRemainingTime").innerHTML = writeSecondsAsMinutes(remainingSeconds) + " m remaining";
  }, 1000);
}

// listen for the messages coming from the extension
browser.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    // message topic correct?
    if(request.topic == "tab info") {
		  initPage(request.infoList[0]);
    }
});

document.addEventListener('DOMContentLoaded', handleDomLoaded);
