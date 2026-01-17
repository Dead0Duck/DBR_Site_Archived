rl_imgs.split = new Image()
	rl_imgs.split.src = "./images/rl/split.png"
function downloadCanvas(data) {
	var a = document.createElement('a');
	a.href = data;
	a.download = "ratelist.png";
	document.body.appendChild(a);
	a.click();

	a.remove();
}
function downloadCanvas(data, name) {
	var a = document.createElement('a');
	a.href = data;
	a.download = name;
	document.body.appendChild(a);
	a.click();

	a.remove();
}
async function generate_list() {
	let chars = await prepare_list();
	console.log(chars)
	
	if(chars) {
		var canvas_bg = document.createElement('canvas'),
			ctx_bg = canvas_bg.getContext("2d");
		canvas_bg.width = 1082;
		canvas_bg.height = 1300;
			
		ctx_bg.drawImage(rl_imgs.bg, 0, 0, 1082, 1300)
		ctx_bg.drawImage(rl_imgs.lay, 0, 0)
		ctx_bg.drawImage(rl_imgs.bullets, 0, 0)
			
			
		var canvas_char = document.createElement('canvas'),
			ctx_char = canvas_char.getContext("2d");
		canvas_char.width = 1082;
		canvas_char.height = 1300;
		let x = 5;
		let y = 493;
		console.log("Начинаем...")
		
		for(let i = 0; i < 24; i++) {
			let chara = chars[i]
			if(chara == "br") {
				x-=90;
			} else if(chara) {
				if(typeof chara == 'string')
					chara = [chara];
				
				switch(chara.length) {
					case 1:
						ctx_char.drawImage(await rl_imgs.char(chara[0]), x, y, 172, 172)
						break;
					case 2:
						ctx_char.drawImage(await rl_imgs.char(chara[0]), 0, 0, 168, 344, x, y, 84, 172)
						ctx_char.drawImage(await rl_imgs.char(chara[1]), 176, 0, 168, 344, x+88, y, 84, 172)
						
						ctx_char.drawImage(rl_imgs.split, x, y, 172, 172)
						break;
					default:
						console.error("Ошибка: Массив персонажа может иметь 1-2 записи!");
						return false;
				}
			}
			
			x+=180;
			if(x > 906) {
				x = 5;
				y += 184;
			}
		}
		
		ctx_bg.drawImage(canvas_char, 0, 0)
			
		downloadCanvas(canvas_bg.toDataURL("image/png"), "ratelist.png")
			
		delete canvas_char;
		delete canvas_bg;
	}
}