function handleDomLoaded() {

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
   tabcontent[i].innerHTML = ""; // free the html
   tabcontent[i].style.display = "none";
 }

 // Show the specific tab content
 document.getElementById(pageName).innerHTML = '<object type="text/html" data="../../views/'+pageName+'.html"></object>'
 document.getElementById(pageName).style.display = "block";
}

document.addEventListener('DOMContentLoaded', handleDomLoaded);
// switch to action by default
document.getElementById("actionBtn").click();
