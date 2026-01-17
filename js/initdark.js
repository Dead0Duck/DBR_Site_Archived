let darkThemeSelected = true
if(localStorage.getItem('darkMode') != null)
	darkThemeSelected = localStorage.getItem('darkMode') === 'dark'
else if(window.matchMedia)
	darkThemeSelected = window.matchMedia('(prefers-color-scheme: dark)').matches

darkThemeSelected ? document.body.setAttribute('data-theme', 'dark') : document.body.removeAttribute('data-theme');