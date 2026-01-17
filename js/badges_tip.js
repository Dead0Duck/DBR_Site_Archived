(function(){
	let modal_err = new bootstrap.Modal(document.getElementById('alert_err'));
	const error_player = document.getElementById("error");
	const success_player = document.getElementById("success");

	function show_alert(text, type) {
		document.getElementById("alert_info").innerHTML = text;
		switch (type) {
			case 'error':
				error_player.parentElement.style.display = "block";
				error_player.seek(0);
				error_player.play();
				success_player.parentElement.style.display = "none";
				break;
			case 'success':
				success_player.parentElement.style.display = "block";
				success_player.seek(0);
				success_player.play();
				error_player.parentElement.style.display = "none";
				break;
		}
		modal_err.show()
	};
	window.show_alert = show_alert
	
	let tip = new bootstrap.Modal(document.getElementById('badges_tip'), {})

	if (!localStorage.getItem("badges_tip")) {
		showTip()
	}
	
	function showTip(){
		document.getElementById("tip").play()
		document.getElementById("tip").seek(0)
		tip.show()
	}

	document.getElementById('badges_tip').addEventListener('hidden.bs.modal', function (event) {
		localStorage.setItem("badges_tip", 1)
	})

	document.getElementById("chars_tip").addEventListener("click", showTip)
})();