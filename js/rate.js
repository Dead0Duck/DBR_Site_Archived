const rate_txt = ["Обожаю", "Любимчик", "Нравится", "Нейтрально", "Не нравится", "Ненавижу"];
function show_modal(id, type, name) {
    $("#rates_modal").modal('show');
    $('#rates_modal_content').html('<div class="d-flex justify-content-center"><font class="me-2 align-middle">Загрузка данных:</font><div class="spinner-border text-neon" role="status" style="color: var(--theme-color)"><span class="sr-only"></span></div></div>');
    $('#rates_modal_name').html(name || "unknown")

    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('GET', `/api/rates/get/${id}?type=${type}`);
    xhr.send();

    xhr.onload = () => {
        if(xhr.status != 200) {
            $('#rates_modal_content').html('Произошла ошибка.')
        } else {
            const body = xhr.response

            try {
                if(!body.ok) {
                    return $('#rates_modal_content').html('Произошла ошибка, возможно Вы играли с кодом страницы.')
                }
            } catch(e) {
                $('#rates_modal_content').html('Произошла ошибка.')
            }

            let r_html = `<table class="table"><thead><tr><th scope="col">Ник</th>`
            if(type == "you")
                r_html += `<th scope="col">Персонаж</th>`

            r_html += `<th scope="col">Оценка</th><th scope="col">Комментарий</th></tr></thead><tbody>`
            body.rates.forEach(rate => {
                let u = rate.who || rate.to_rate
                if(u == "game") {
                    r_html += `<tr><th>Игра</th>`
                    if(type == "you")
                        r_html += `<th></th>`
                } else {
                    r_html += `<tr><th><a href="/id${u}" class="text-dark">${body.users[u] && body.users[u].name || "Неизвестно"}</a></th>`
                    if(type == "you")	
                        r_html += `<th>${rate.char}</th>`
                }
                switch(rate.rate) {
                    case -1:
                        r_html += `<td><span class="badge rate-0-bg">Нет оценки</span></td>`
                        break;
                    case 0:
                        r_html += `<td><span class="badge rate-0-bg">Пропуск</span></td>`
                        break;
                    default:
                        r_html += `<td><span class="badge rate-${rate.rate}-bg">${rate_txt[6-rate.rate]} (${rate.rate-3})</span></td>`
                }
                r_html += `<td>${rate.comment || '<font class="text-muted">*Не оставлен*</font>'}</td>`
                r_html += `</tr>`
            });
            r_html += `</tbody></table>`

            $('#rates_modal_content').html(r_html)

			DBR_InitPreProfiles()
        }
    }

    xhr.onerror = () => {
        $('#rates_modal_content').html('Повторите попытку позже.')
    }
}