var passUrl = "google.com";

document.addEventListener('DOMContentLoaded', function() {
	browser.runtime.sendMessage({topic:"green-pass url"});
	// Leave Button
  var leaveBtn = document.getElementById('btnLeave');
  leaveBtn.addEventListener('click', function() {
      window.close();
  });
	// Visit Button
	var visitBtn = document.getElementById('btnVisit');
  visitBtn.addEventListener('click', function() {
	// If the user decides to visit anyway, background should be informed
	// to wait a while until user will be asked again
	var selectedTime = document.querySelector('input[name="time"]:checked').value;
	browser.runtime.sendMessage({topic: "start waiting",time:selectedTime});
      window.location=passUrl;
  });
});

// listen for the messages coming from the extension
browser.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// ignore messages from tabs (including this)
		if(sender.tab) {
			return;
		}
		// undefined?
		if(!request.passUrl) {
			browser.runtime.sendMessage({topic: "console log",log:"green-pass:\
			No passUrl param in message"});
			return;
		}

		passUrl = request.passUrl;
});
