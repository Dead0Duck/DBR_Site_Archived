if (!window.chrome && (localStorage.getItem('browser') == null)) {
    document.getElementById('top').innerHTML = `<div class="alert alert-danger d-flex align-items-center justify-content-center" role="alert" style="border-radius:0">
	<div style="text-center">
	  Сайт может некорректно работать на браузерах основанных не на Chromium (Firefox, Safari, Internet Explorer).
	  <button type="button" class="btn bg-theme text-white" data-bs-dismiss="alert" aria-label="Close" onclick="dismiss()">Хорошо, я понял</button>
	</div>
  </div>` + document.getElementById('top').innerHTML;
}

function dismiss(){
    localStorage.setItem('browser', 1)
}