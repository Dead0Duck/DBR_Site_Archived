$(function() {  
    var socket = io();
    socket.emit("url_send", document.location.href)
    socket.on("url_done", () => {
        socket.emit("game_init")
    })

    socket.on('game_upd', msg => {
        let in_game = false

    //Особые слоты
        let html = ""
        if(msg.special_players.length > 0) {
            html += "<h3>Вне каста(Сюжетки и т.д):</h3><p>"
            for(let i = 0; i < msg.special_players.length; i++) {
                if(msg.special_players[i].user.id == my_id)
                in_game = 'special'
                html += `${i+1}. <a href="/id${msg.special_players[i].user.id}"><img src="${msg.special_players[i].user.avatar}" class="img-ava"> ${msg.special_players[i].user.name}</a>: <img src="/chars_pixel/${msg.special_players[i].char}.png" class="img-pix-inline"> ${chs[msg.special_players[i].char]}</br>`
            }
            html += "</p>"
        }

    //Каст
        html += `<h3>Каст:</h3><p>`
        for(let i = 0; i < msg.players.length; i++) {
            const pl = msg.players[i]
            if(pl) {
                if(pl.user.id == my_id)
                    in_game = 'players'
                html += `${i+1}. <a href="/id${pl.user.id}"><img src="${pl.user.avatar}" class="img-ava"> ${pl.user.name}</a>${ pl.slot == "adm" ? ` <i class="bi bi-wrench" title="Сотрудник" style="color: var(--theme-color);"></i>` : (pl.slot ? ` <i class="bi bi-star" title="Использован слот" style="color: var(--theme-color);"></i>` : "") }: <img src="/chars_pixel/${pl.char}.png" class="img-pix-inline"> ${chs[pl.char]}</br>`
            } else
                html += `${i+1}. Пусто</br>`
        }

    //Очередь
    if(msg.queue.length > 0) {
            html += "<h3>Очередь:</h3>"
            for(let i = 0; i < msg.queue.length; i++) {
                if(msg.queue[i].user.id == my_id)
                    in_game = 'queue'

                html += `${i+1}. <a href="/id${msg.queue[i].user.id}"><img src="${msg.queue[i].user.avatar}" class="img-ava"> ${msg.queue[i].user.name}</a>: <img src="/chars_pixel/${msg.queue[i].char}.png" class="img-pix-inline"> ${chs[msg.queue[i].char]}</br>`
            }
            html += "</p>"
        }

    //Запас
        if(msg.reserve.length > 0) {
            html += "<h3>Запас:</h3>"
            for(let i = 0; i < msg.reserve.length; i++) {
                if(msg.reserve[i].user.id == my_id)
                    in_game = 'reserve'

                html += `${i+1}. <a href="/id${msg.reserve[i].user.id}"><img src="${msg.reserve[i].user.avatar}" class="img-ava"> ${msg.reserve[i].user.name}</a>: <img src="/chars_pixel/${msg.reserve[i].char}.png" class="img-pix-inline"> ${chs[msg.reserve[i].char]}</br>`
            }
            html += "</p>"
        }

        $('#list').html(html);
        $('#subm').prop('disabled', in_game == "special");
        $('#subm').html(in_game ? "Перезаписаться" : "Записаться")
        $('#exit').prop('disabled', !in_game || in_game == "special");

        $('html, body').scrollTop($(document).height());

		DBR_InitPreProfiles()
    });

    socket.on('err', function(msg) {
        $('#err').html(msg);
        $('#err').addClass('alert-danger');
        $('#err').removeClass('alert-success');
        $('#err').show();
    })

    socket.on('suc', function(msg) {
        $('#err').html(msg);
        $('#err').addClass('alert-success');
        $('#err').removeClass('alert-danger');
        $('#err').show();
    })

    socket.on("disconnect", () => {
        $('#list').html("<h1>Соединение потеряно, перезагрузите страницу</h1>");
        $('#subm').prop('disabled', true);
        $('#exit').prop('disabled', true);
    });

    function EnterSubmit(act) {
        var to_send = {
            act
        }
        if(to_send.act == "enter") {
            to_send.char = $('#char_sel').val(),
            to_send.type = $('input[name=zap_type]:checked').val()
        }
    
        $('#subm').prop('disabled', true);
        $('#exit').prop('disabled', true);
    
        socket.emit('game_zapis', to_send)
    }
    $('#subm').click(() => EnterSubmit('enter'))
    $('#exit').click(() => EnterSubmit('exit'))
});