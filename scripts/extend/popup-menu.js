function handleDomLoaded() {
  // to avoid the dead object error
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Dead_object

	// start listening the buttons
  document.getElementById('actionBtn').addEventListener('click', switchTab);
  document.getElementById('optionsBtn').addEventListener('click', switchTab);

	// log the bg console
	browser.runtime.sendMessage({topic: "console log", log: "popup menu loaded"});
}


function switchTab() {
 var pageName = this.getAttribute('data-page');
 console.log('Clicked ' + pageName);
 // Hide all elements with class="tabcontent" by default */
 var i, tabcontent, tablinks;
 tabcontent = document.getElementsByClassName("tabcontent");
 for (i = 0; i < tabcontent.length; i++) {
   tabcontent[i].style.display = "none";
 }

 // Show the specific tab content
 document.getElementById(pageName).style.display = "block";
}

document.addEventListener('DOMContentLoaded', handleDomLoaded);
// switch to action by default
document.getElementById("actionBtn").click();
