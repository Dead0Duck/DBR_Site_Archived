(function(){
	let bdg = base_bdg
	let shelf = [...base_shelf]

	// Значки первые
	document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
		return new bootstrap.Tooltip(el, {html: true})
	})

	// Элементы Drag&Drop
	$( ".bdg_drag" ).draggable({
		revert: true,
		revertDuration: 0,
		zIndex: 100,
	});
	$(".bdg_drop").on(
		'click', function (e) {
			const is_main = $( this ).data('id') == 'main'
			$( this )
				.attr("src", "/images/badges/0ther/empty.png")
				.removeAttr('title')
				.removeAttr('data-bs-original-title')
				.removeAttr('aria-label')

			if(is_main)
				bdg = false
			else
				shelf[$( this ).data('id')] = false

			bootstrap.Tooltip.getInstance($( this )[ 0 ]).dispose()
			document.querySelectorAll('.bdg_drop[data-bs-toggle="tooltip"]').forEach(el => {
				return new bootstrap.Tooltip(el, {html: true})
			})

			let changed = check_badges()
			$("#changer").prop('disabled', changed)

			return false
		}
	).droppable({
		accept: '.bdg_drag',
		drop: function(event, ui) {
			$span = $(ui.draggable);
			$(this)
				.attr("src", $span.prop('src'))
				.attr("title", $span.data('bs-original-title'));

				document.querySelectorAll('.bdg_drop[data-bs-toggle="tooltip"]').forEach(el => {
					return new bootstrap.Tooltip(el, {html: true})
				})

			let id = $(this).data('id');
			if(id == 'main')
				bdg = $span.data('id')
			else
				shelf[$( this ).data('id')] = $span.data('id')

			let changed = check_badges()
			$("#changer").prop('disabled', changed)
		}
	});

	// Функция проверки значков
	function check_badges() {
		if(bdg != base_bdg)
			return false;
		for(let i = 0; i < 9; i++) {
			if(base_shelf[i] != shelf[i])
				return false
		}

		return true;
	}

	// Поиск
	let search_bar = document.getElementById("char")
	let search_elems = document.getElementsByClassName('bdg_drag');
	search_bar.addEventListener("input", () => {
		let is_empty = search_bar.value == ""

		for (let item of search_elems) {
			item.style.display = is_empty || (item.dataset.search.toLowerCase().search(search_bar.value.toLowerCase()) != -1) ? "block" : "none"
		}
	});

	// Кнопка подтверждения
	$("#changer").on('click', function() {
		if(check_badges()) return;

		let post_form = new FormData();
		post_form.append('bdg', bdg);
		post_form.append('shelf', JSON.stringify(shelf));

		let request = new XMLHttpRequest();
		request.open('POST', `/api/badges/set`, true);
		request.responseType = 'json';
		request.send(post_form);

		request.onload = () => {
			res = request.response
			if(!res || !res.ok) {
				return show_alert('Ошибка, перезагрузите страницу и попробуйте ещё раз!', "error")
			}

			show_alert('Значки изменены!', 'success')
		}
		request.onerror = () => {
			show_alert('Ошибка, попробуйте снова!', 'error')
		}
	})
})();