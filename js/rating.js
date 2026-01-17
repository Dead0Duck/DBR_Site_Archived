$(function() { 
	const txts = ["Нет оценки", "Пропуск", "Ненавижу", "Не нравится", "Нейтрально", "Нравится", "Любимчик", "Обожаю"]
	let fullrate = {};
	let counter = 0;

	function get_rate(to_rate, char) {
		let first_rate = old_rates.filter(r => (char && r.char == char || !char) && r.to_rate == to_rate)[0]
		if(!first_rate || typeof first_rate.rate != "number") {
			first_rate = first_rate || {};
			first_rate.rate = -1
			first_rate.comment = ""
		}

		return first_rate
	}

	function submit() {
		// Синхронизация оценок
		old_rates.forEach(r => {
			let id = r.to_rate
			if(r.char)
				id += "_" + r.char
			
			if(fullrate[id])
				return


			fullrate[id] = [r.rate, r.comment];
		})

		let body = document.getElementById("Cardbody");
		body.innerHTML = "Отправляем ваши оценки..."
		
		let http = new XMLHttpRequest();
		http.open('POST', '/api/rate', true);
		
		fullrate['id'] = game_id

		http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		
		http.onload = function() {
			if(http.status == 200) {
				let txt = JSON.parse(http.responseText);
				
				if(txt == true)
					document.location.href = "/rates"
				else
					body.innerHTML = `Ошибка: <p>${txt}</p><button type="button" onclick="document.location.reload()" class="btn btn-primary">Перезагрузить страницу</button>`
			} else {
				body.innerHTML = `Ошибка: <p>${http.statusText}</p><button type="button" onclick="document.location.reload()" class="btn btn-primary">Перезагрузить страницу</button>`
			}
		}
		http.send(JSON.stringify(fullrate));
	}

	function back() {
		if(counter == 0) return false

		$( "#title" ).animate({
			opacity: "-=1",
			left: "+=50",
			height: "toggle"
		}, 200, () => {
			if (to_rate[counter] == "game") {
				document.getElementById('title_clear').innerHTML = `Как вы оцените каноничность <b id="char"></b>? (<a id="nickname" href="/id"></a>)`;	
			}
			counter--;

			let old_rate
			document.getElementById('nickname').innerText = to_rate[counter][0];
			document.getElementById('nickname').href = `/id${inner_code[counter][0]}`;
			document.getElementById('char').innerText = to_rate[counter][1]; 

			old_rate = get_rate(inner_code[counter][0], inner_code[counter][1])
			document.getElementById('comment').value = old_rate.comment
			old_rate = old_rate.rate

			DBR_InitPreProfiles()

			const currate = document.getElementById('currate')
			currate.innerText = txts[old_rate+1]
			currate.className = currate.className.replace(/\brate-\d-bg\b/g, `rate-${Math.max(0, old_rate)}-bg`)

			const cirlce = document.getElementById(`crc_${counter+2}`)
			cirlce.className = cirlce.className.replace(/\bbi-.+\b/, 'bi-circle')

			$( "#title" ).animate({
				opacity: "+=1",
				left: "+=50",
				height: "toggle"
			}, 200)
		})
	}

	function next() {
		if(counter+1 == to_rate.length) return false

		$( "#title" ).animate({
			opacity: "-=1",
			left: "+=50",
			height: "toggle"
		}, 200, () => {
			counter++;

			let old_rate
			if (to_rate[counter] == "game") {
				document.getElementById('title_clear').innerText = "Как вы оцените игру?";	

				old_rate = get_rate("game")
				document.getElementById('comment').value = old_rate.comment
				old_rate = old_rate.rate
			} else {
				document.getElementById('nickname').innerText = to_rate[counter][0];
				document.getElementById('nickname').href = `/id${inner_code[counter][0]}`;
				document.getElementById('char').innerText = to_rate[counter][1]; 

				old_rate = get_rate(inner_code[counter][0], inner_code[counter][1])
				document.getElementById('comment').value = old_rate.comment
				old_rate = old_rate.rate

				DBR_InitPreProfiles()
			}

			const currate = document.getElementById('currate')
			currate.innerText = txts[old_rate+1]
			currate.className = currate.className.replace(/\brate-\d-bg\b/g, `rate-${Math.max(0, old_rate)}-bg`)

			const cirlce = document.getElementById(`crc_${counter+1}`)
			cirlce.className = cirlce.className.replace(/\bbi-.+\b/, 'bi-circle-fill')

			$( "#title" ).animate({
				opacity: "+=1",
				left: "+=50",
				height: "toggle"
			}, 200)
		})
	}

	function nextstep(rate) {
		$( "#title" ).animate({
			opacity: "-=1",
			left: "+=50",
			height: "toggle"
		}, 200, () => {
			if(rate > -1) {
				let comment = document.getElementById('comment').value;
				document.getElementById('comment').value = "";
				if(to_rate[counter] == "game")
					fullrate["game"] = [rate, comment];
				else
					fullrate[inner_code[counter][0]+'_'+inner_code[counter][1]] = [rate, comment];
				
				counter++;
			}
			
			if(to_rate.length == counter) {
				return submit()
			}
			
			let old_rate
			if (to_rate[counter] == "game") {
				document.getElementById('title_clear').innerText = "Как вы оцените игру?";	

				old_rate = get_rate("game")
				document.getElementById('comment').value = old_rate.comment
				old_rate = old_rate.rate
			} else {
				document.getElementById('nickname').innerText = to_rate[counter][0];
				document.getElementById('nickname').href = `/id${inner_code[counter][0]}`;
				document.getElementById('char').innerText = to_rate[counter][1]; 

				old_rate = get_rate(inner_code[counter][0], inner_code[counter][1])
				document.getElementById('comment').value = old_rate.comment
				old_rate = old_rate.rate

				DBR_InitPreProfiles()
			}

			const currate = document.getElementById('currate')
			currate.innerText = txts[old_rate+1]
			currate.className = currate.className.replace(/\brate-\d-bg\b/g, `rate-${Math.max(0, old_rate)}-bg`)

			const cirlce = document.getElementById(`crc_${counter + 1}`)
			cirlce.className = cirlce.className.replace(/\bbi-.+\b/, 'bi-circle-fill')

			$( "#title" ).animate({
				opacity: "+=1",
				left: "+=50",
				height: "toggle"
			}, 200)
		});
	}

	
	document.getElementById('rate0').addEventListener("click", () => nextstep(0))
	document.getElementById('rate1').addEventListener("click", () => nextstep(1))
	document.getElementById('rate2').addEventListener("click", () => nextstep(2))
	document.getElementById('rate3').addEventListener("click", () => nextstep(3))
	document.getElementById('rate4').addEventListener("click", () => nextstep(4))
	document.getElementById('rate5').addEventListener("click", () => nextstep(5))
	document.getElementById('rate6').addEventListener("click", () => nextstep(6))

	if(document.getElementById('btn_back')) {
		document.getElementById('btn_back').addEventListener("click", back)
		document.getElementById('btn_next').addEventListener("click", next)
		document.getElementById('btn_submit').addEventListener("click", submit)
	}
});