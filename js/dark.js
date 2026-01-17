var darkMode

var darkLabel = "darkModeLabel";
var darkLang = "Светлая тема";
var lightLang = "Темная тема";

window.addEventListener('DOMContentLoaded', function () {
  darkMode = document.getElementById('darkMode') || 'dark';
  if (darkMode) {
    initTheme();
    darkMode.addEventListener('change', function () {
      resetTheme();
    });
  }
  
  document.getElementById("thumb-"+bg).classList.add("bg-prefer-green")
});

function initTheme() {
	var darkThemeSelected = false
  if(localStorage.getItem('darkMode') != null)
    darkThemeSelected = localStorage.getItem('darkMode') === 'dark'
  else if(window.matchMedia)
    darkThemeSelected = window.matchMedia('(prefers-color-scheme: dark)').matches
    
	darkMode.checked = darkThemeSelected;
	darkThemeSelected ? document.body.setAttribute('data-theme', 'dark') : document.body.removeAttribute('data-theme');
	darkThemeSelected ? 
		document.getElementById(darkLabel).innerHTML = lightLang 
	: 
		document.getElementById(darkLabel).innerHTML = darkLang;
}

function resetTheme() {
  if (darkMode.checked) {
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('darkMode', 'dark');
    document.getElementById(darkLabel).innerHTML = lightLang;
  } else {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('darkMode', 'light');
    document.getElementById(darkLabel).innerHTML = darkLang;
  }
}

var bg = localStorage.getItem('bg')
if (bg == null) {
    localStorage.setItem('bg', '1');
    bg = 1
}

function changebg(nbg) {
    var bgnow = localStorage.getItem('bg')
    if (bgnow == nbg || nbg > bgs || nbg < 1)
        return
    else
		bg = nbg
	
	document.getElementsByClassName('bg-prefer-green')[0].classList.remove('bg-prefer-green')
	document.getElementById("thumb-"+bg).classList.add("bg-prefer-green")
	document.body.setAttribute('data-bg', bg);
	localStorage.setItem('bg', bg);
}