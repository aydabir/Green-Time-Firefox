function handleDomLoaded() {

	// button is hidden until the tab info is obtained
  document.getElementById('blockBtn').style.display = "none";

	// request the tab info
	browser.runtime.sendMessage({topic: "request current tab info"});
}

function blockPage(){
  // hide the button when pressed
  document.getElementById('blockBtn').style.display = "none";
  // request block
  var url = document.getElementById("textUrl").innerHTML;
  browser.runtime.sendMessage({topic: "block url", "url":url});
  // show the new button
  this.toggleButtonType(url, true);
}

function unblockPage(){
  // hide the button when pressed
  document.getElementById('blockBtn').style.display = "none";
  // request unblock
  var url = document.getElementById("textUrl").innerHTML;
  browser.runtime.sendMessage({topic: "unblock url", "url":url});
  // show the new button
  this.toggleButtonType(url, false);
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

// listen for the messages coming from the extension
browser.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// undefined?
		if(request.topic == "tab info") {
      toggleButtonType(request.infoList[0].url, request.infoList[0].listed);

			browser.runtime.sendMessage({topic: "console log",log:"Action received tab info"});
		}
});

document.addEventListener('DOMContentLoaded', handleDomLoaded);
