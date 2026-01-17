bg.onanimationend = function() {
	document.getElementsByClassName('background')[0].style.opacity = 1;
	document.getElementsByClassName('info')[0].style.opacity = 1;
};


if (tips.length == 0) {
	document.getElementById('tips-head').innerText = "Советов нет";
	document.getElementById('tip').style.display = "none";
} else
	document.getElementById('tip-text').innerHTML = tips[0];


if(tips.length > 1) {
	var i = 0;
	
	setInterval(function() {
		i += 1
		if ((tips.length - i) <= 0)
			i = 0
		$(".tip").addClass('tip-out');
		setTimeout(function() {
			$(".tip").removeClass('tip-out');
			document.getElementById('tip-text').innerHTML = tips[i];
			$(".tip").addClass('tip-in');
		}, 1000);
	}, 12000);
}