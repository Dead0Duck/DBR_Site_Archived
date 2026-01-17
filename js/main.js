function get_count(n) {
	let div = ((n / 6) % 1 == 0) ? (n / 6 - 1) : Math.floor(n / 6)
	let h = Math.floor(n/(div+1)*10)/10
	let h2 = 0,
		h3 = 0;
	
	if(h % 1 > .5) {
		h2 = 1
		h3 = 1
	} else if(h % 1 > .2)
		h3 = 1
	
	h = Math.floor(h)
	h2 += h
	h3 += h
	if(n <= 6) {
		h2 = 0
		h3 = 0
	} else if(n <= 12) {
		h2 = h3
		h3 = 0
	}
	return [h, h2, h3]
}

function AllPers(first_time) {
	let all = document.getElementById("all")
	if(!all)
		return
    for (persone of persu) {
        var p = document.createElement('button');
        p.type = "button";
        p.id = persone[0];
        p.setAttribute("onclick","addtolist('" + persone[0] + "')");
        p.classList.add("list-group-item");
        p.classList.add("list-group-item-action");
        p.innerText = persone[1];
        all.appendChild(p)
		
		if(first_time) {
			var opt = document.createElement('option');
			opt.value = persone[0];
			opt.innerHTML = persone[1];
		}
    }
}

AllPers(true)


var counter = 0;
var danger = 0;
var dangerhelpers = false;

var onlist = [];
var helpers = [];


function addtolist(persname) {
    $("input[name=chk]").change(function(){
        var max= 6;
        if( $("input[name=chk]:checked").length == max ){
            $("input[name=chk]").attr('disabled', 'disabled');
            $("input[name=chk]:checked").removeAttr('disabled');
        }else{
             $("input[name=chk]").removeAttr('disabled');
        }
    });
    if (counter < 22 && counter - helpers.length < 17) {
        document.getElementById(persname).remove()
        var tbodyRef = document.getElementById('ratelist').getElementsByTagName('tbody')[0];
        var newRow = tbodyRef.insertRow();
        var pers = newRow.insertCell(0);
        var list = newRow.insertCell(1, 'col');
        var helper = newRow.insertCell(2, 'col');
        var name = persu.get(persname)
        var newText = document.createTextNode(name);
        var selector = document.createElement('SELECT')
        selector.innerHTML = '<select class="form-select form-select-sm" aria-label=".form-select-double"><option selected="">Нет</option></select>';
        for (persone of persu) {
            var opt = document.createElement('option');
            opt.value = persone[0];
            opt.innerHTML = persone[1];
            selector.appendChild(opt);
        }
        selector.classList.add("form-select");
        selector.classList.add("form-select-sm");
        selector.setAttribute("onchange", "adddivide('" + persname + "selector')");
        selector.id = persname + "selector";
        var checkmono = document.createElement('input');
        checkmono.classList.add("form-check-input");
        checkmono.classList.add("helpercheck");
        checkmono.type = 'checkbox';
        checkmono.name = 'chk';
        checkmono.id = persname + "check";
        checkmono.value = persname;
        if (!(helpers.length < 6 )) {
            checkmono.setAttribute('disabled', 'disabled')
        }
        checkmono.setAttribute("onchange","sethelper('" + persname + "')");
        helper.appendChild(checkmono);
        list.appendChild(selector);
        pers.appendChild(newText);
        counter += 1;
        document.getElementById('numberchoice').textContent = counter;
        onlist.push([persname]);
		return
    } 
	if(danger == 0) {
		if (counter-helpers.length > 16) {
			new bootstrap.Collapse(document.getElementById('notmorethan16'));
			danger = 1;
		} else {
			new bootstrap.Collapse(document.getElementById('notmorethan22'));
			danger = 1;
		}
	}
}

function search() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('search_pers');
    filter = input.value.toUpperCase();
    ul = document.getElementById("all");
    li = ul.getElementsByTagName('button');
  
    for (i = 0; i < li.length; i++) {
      a = li[i]
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }

function sethelper(persname) {
    if (helpers.length < 6) {
        if (helpers.includes(persname)) {
            delete helpers[persname]
            if (dangerhelpers == true) {
                new bootstrap.Collapse(document.getElementById('notmorethan6'));
                dangerhelpers = false;
            }
        } else 
        helpers.push(persname)
    } else if (dangerhelpers == false) {
        $("input[name=chk]").attr('disabled', 'disabled');
        $("input[name=chk]:checked").removeAttr('disabled');
        new bootstrap.Collapse(document.getElementById('notmorethan6'));
        dangerhelpers = true;
    }

}

function clearmodallist() {
    document.getElementById('ratelist').innerHTML = '\n                              <thead>\n                                <tr>\n                                  <th scope=\"col\">Персонаж</th>\n                                  <th scope=\"col\">Объединение</th>\n                                  <th scope=\"col\">Первая строка?</th>\n                                </tr>\n                              </thead>\n                              <tbody>\n                              </tbody>\n ';
    onlist = [];
    helpers = [];
    counter = 0;
    document.getElementById("all").innerHTML = "";
    AllPers(false);
    document.getElementById('numberchoice').textContent = 0;

}

function adddivide(persname) { 
    var value = document.getElementById(persname).value;
    persname = persname.substring(0, persname.length - 8);
    for (persone of onlist) {
        if (persone[0] == persname) {
            persone[1] = value;
        }
    }
}

function download(dataurl) {
	var a = document.createElement("a");
	a.href = dataurl;
	a.setAttribute("download", "ratelist.png");
	a.click();
}

function readFileAsync(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result);
		};

		reader.onerror = reject;

		reader.readAsDataURL(file);
	})
}

var rl_imgs = {
	"bg": false,
	"lay": false,
	"bullets": new Image(),
	"char": async function(id) {
		let char_img = new Image();
			char_img.src = `./chars_pixel/${id}.png`;
		console.log(`Загружаю "./chars_pixel/${id}.png"...`)
		await char_img.decode();
		
		return char_img;
	}
}
rl_imgs.bullets.src = "./images/rl/text.png"
let def_bg = new Image()
	def_bg.src = "./images/rl/bg.png"
rl_imgs.bg = def_bg;

let dark_lay = new Image()
	dark_lay.src = "./images/rl/dark.png"
let light_lay = new Image()
	light_lay.src = "./images/rl/light.png"

function BG_DataUri(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result);
		};

		reader.onerror = reject;

		reader.readAsDataURL(file);
	})
}

/* Собираем данные... */
async function prepare_list() {
	try {
		let formData = {};
		
		formData.helpers = helpers
		formData.dark = document.getElementById('darkcheck').checked
		formData.chars = onlist
		if (document.getElementById('custombgcheck').checked) {
			var custombg = document.getElementById('custombgfile').files[0]
			if (custombg !== undefined) {
				formData.bg = new Image();
				formData.bg.src = await BG_DataUri(custombg)
			} else {
				return alert("Фон не загружен");
			}
		} else
			formData.bg = false
		
		rl_imgs.bg = formData.bg || def_bg;
		console.log(rl_imgs)
		rl_imgs.lay = formData.dark && dark_lay || light_lay
		
	//А теперь готовим список, аааа
		//Перенесём для начала хелперов из персонажей
		for(let i = 0; i < formData.chars.length; i++) {
			let id = formData.helpers.findIndex(ind => ind == formData.chars[i][0]);
			if(id > -1)
				formData.helpers[id] = formData.chars.splice(i, 1)[0]
		}
		
		//Подготавливаем первую строку с ММ'и
		if(formData.helpers.length < 6) {
			let begin = true
			let start = 0
			if(formData.helpers.length % 2 != 0) {
				formData.helpers.unshift('br')
				start = 1
			}
			
			let l = 6-formData.helpers.length
			for(let i = 0; i < l; i++) {
				if(begin)
					formData.helpers.splice(start, 0, false)
				else
					formData.helpers.push(false)
				begin = !begin
			}
		}
		
		
		// Подготавливаем массив участников кг || ВНИМАНИЕ, Говнокод!
		//// Получаем как расставить участников по строкам
		let c = get_count(formData.chars.length);
		for(let i = 0; i < c.length; i++) {
			let row_c = c[i]
			if(row_c < 6) {
				let begin = true
				let start = 0
				if(row_c % 2 != 0) {
					formData.chars.splice(6*i, 0, 'br')
					row_c++
					start = 1
				}
				
				let l = 6-row_c
				for(let j = 0; j < l; j++) {	
					if(begin) {
						formData.chars.splice(6*i+start, 0, false)
						row_c++
					} else
						formData.chars.splice(6*i+row_c, 0, false)
					begin = !begin
				}
			}
		}
		
		// Соединяем эту стряпню в одну.
		let rl = formData.helpers.concat(formData.chars)

		return rl
	} catch(e) {
		return false
	}
}




function newoption(count) {
    var li = document.createElement('li');
    li.classList.add("list-group-item");
    var select = document.createElement('select');
    oldcount = count.toString()
    document.getElementById("selectprohibit" + oldcount).removeAttribute('onchange');
    count = count + 1;
    select.id = "selectprohibit" + count.toString();
    select.classList.add("form-select");
    select.classList.add("form-select-sm");
    select.setAttribute('onchange', 'newoption(' + count + ');')
    li.appendChild(select)
    var opt = document.createElement('option');
    opt.innerHTML = "Нет";
    opt.setAttribute('selected', 'selected')
    select.appendChild(opt);
    for (persone of persu) {
        var opt = document.createElement('option');
        opt.value = persone[0];
        opt.innerHTML = persone[1];
        select.appendChild(opt);
    }    
    document.getElementById('prohibitdev12').appendChild(li)
}