$(function() {  
	moment.locale('ru');
	moment.updateLocale('ru', {
		weekdays : {
			standalone: 'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота'.split('_'),
			format: 'Воскресенье_Понедельник_Вторник_Среду_Четверг_Пятницу_Субботу'.split('_'),
			isFormat: /\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?\] ?dddd/
		},
		weekdaysShort: 'Вс_Пн_Вт_Ср_Чт_Пт_Сб'.split('_'),
		weekdaysMin: 'Вс_Пн_Вт_Ср_Чт_Пт_Сб'.split('_'),
	});

	$("time[type]").each(function() {
		const type = $(this).attr("type");
		let txt = "???";
		const full = moment(parseInt($(this).attr("ts")) || 0).format("dddd, DD MMMM YYYY, HH:mm");
		switch($(this).attr("type")) {
			case "f": {
				txt = full;
				break;
			}
			case "D": {
				txt = moment(parseInt($(this).attr("ts")) || 0).format("DD MMMM YYYY");
				break;
			}
			case "r": {
				txt = moment(parseInt($(this).attr("ts")) || 0).fromNow();
				break;
			}
			default: {
				txt = moment(parseInt($(this).attr("ts")) || 0).format("DD.MM.YYYY, HH:mm");
			}
		}

		$(this).html(txt);
		if(type != "f")
			$(this).attr('title', full);
	})

	document.querySelectorAll('time[type]:not([type="f"])').forEach(el => {
		return new bootstrap.Tooltip(el)
	})

	const rs = $("time[type='r']")
	if(rs.length > 0) {
		setInterval(() => {
			rs.each(function() {
				$(this).html(moment(parseInt($(this).attr("ts")) || 0).fromNow())
			})
		}, 10000)
	}
})