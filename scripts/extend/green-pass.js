var targetUrl = "about:home";

var onClickedLeave = function(){
	browser.runtime.sendMessage({topic:"close tab"});
}

var onClickedVisit = function(){
	// If the user decides to visit anyway, background should be informed
	// to wait a while until user will be asked again
	var selectedTime = document.querySelector('input[name="time"]:checked').value;
	browser.runtime.sendMessage({topic: "start waiting",time:selectedTime});
	// load the target page
	window.location=targetUrl;
}

document.addEventListener('DOMContentLoaded', function() {
	// request url of the green-pass page
	browser.runtime.sendMessage({topic:"request green-pass url"});
	// Leave Button
  var leaveBtn = document.getElementById('btnLeave');
  leaveBtn.addEventListener('click', onClickedLeave);
	// Visit Button
	var visitBtn = document.getElementById('btnVisit');
  visitBtn.addEventListener('click', onClickedVisit);
});

// listen for the messages coming from the extension
browser.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// ignore messages from tabs (including this)
		if(sender.tab) {
			return;
		}
		// undefined?
		if(!request.targetUrl) {
			browser.runtime.sendMessage({topic: "console log",log:"green-pass:\
			No targetUrl param in message"});
			return;
		}

		targetUrl = request.targetUrl;
});
