const bgs = 3;
var bg = localStorage.getItem('bg')
var font = localStorage.getItem('font')

bg = bg || 1
if(bg < 1 || bg > bgs) {
	bg = 1
}
document.body.setAttribute('data-bg', bg);

window.onload = function () {if(font !== null) {
	WebFont.load({
		google: {
		  families: [font]
		}
	  });
	document.getElementsByTagName('body')[0].style.fontFamily = font;
// document.getElementById('font').value = font;
}}

function checkfont(value) {
	data.forEach(a => {
		if (a["label"].toLowerCase() == value.toLowerCase()) {return true}
		
	})
}



function change_font(value) {
	document.getElementsByTagName('body')[0].style.fontFamily = value;
	if(value != "") {
		WebFont.load({
			google: {
			  families: [value]
			}
		  });
		localStorage.setItem('font', value)
		return
	}
    localStorage.removeItem('font')
}

var data = []
var i = 0

var request = new XMLHttpRequest();
request.open('GET', 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAKc40PcGjf3YntlESFQAApGbbmfxk9BXI')
request.responseType = 'json';
request.send();
request.onload = function() {
	request.response["items"].forEach(item => {
		if (item["subsets"].includes('cyrillic')) {
			data.push({label: item["family"], value: i })
			i++
		}
	})
}

