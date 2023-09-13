var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       // Typical action to be performed when the document is ready:
       console.log(xhttp.responseText);
    }
};
xhttp.open("GET", "data/count-dimensions-within-dates.json", true);
xhttp.send();

function activateTab(tabname, navtab) {
  console.log(tabname);
  var tabs = document.getElementsByClassName('content-tab');
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains('hidden')) {

    } else {
      tabs[i].classList.add('hidden');
    }
  }
  var tab = document.getElementById(tabname);
  tab.classList.remove('hidden');
}
