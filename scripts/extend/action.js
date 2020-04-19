function handleDomLoaded() {

	// button is hidden until the tab info is obtained
  document.getElementById('blockBtn').style.display = "none";

	// request the tab info
	browser.runtime.sendMessage({topic: "request current tab info"});
}

function blockPage(){
  var url = document.getElementById("textUrl").innerHTML;
  browser.runtime.sendMessage({topic: "console log",log:"Block"+url});
}

function unblockPage(){
  var url = document.getElementById("textUrl").innerHTML;
  browser.runtime.sendMessage({topic: "console log",log:"Unblock"+url});
}

function toggleButtonType(url, isBlocked){
  // switches between block or unblock button depending to the tab state
  document.getElementById("textUrl").innerHTML = url; // TODO: filter domain

  // set button visible
  var blockBtn = document.getElementById('blockBtn');
  blockBtn.style.display = "block";

  // toggle function of the button
  if(isBlocked){
    blockBtn.value = "Unblock";
    blockBtn.addEventListener('click', unblockPage);

  }else{
    blockBtn.value = "Block";
    blockBtn.addEventListener('click', blockPage);
  }
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
