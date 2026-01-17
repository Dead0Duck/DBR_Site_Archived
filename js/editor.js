var dbr_users = {};
var md = window.markdownit({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
            return '<pre class="hljs"><code>' +
                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                '</code></pre>';
            } catch (__) {}
        }
    
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
        }
    })
    .use(window.markdownitEmoji)
    .use(window.markdownitFootnote)
    .use(window.markdownitVideo)
    .use(window.markdownitMentions);

md.renderer.rules.emoji = (token, idx) => {
    if(/^-?\d+$/.test(token[idx].content)) {
        return `<img src="https://cdn.discordapp.com/emojis/${token[idx].content}.webp?quality=lossless" alt=":${token[idx].markup}:" draggable="false" class="emoji">`
    }

    return twemoji.parse(token[idx].content, {
        ext: '.svg',
        folder: 'svg'
    });
};
md.renderer.rules.table_open = (tokens, idx) => {
    return '<table class="table table-striped table-bordered table-theme">';
};

moment.locale("ru");
document.getElementById("date").min = moment(Date.now()).format("YYYY-MM-DDTHH:mm");
const time_offset = new Date().getTimezoneOffset()*60000

function check() {
    var checkbox = document.getElementById('delayed');

    document.getElementById('date').disabled = !checkbox.checked;
    if (checkbox.checked) {
        document.getElementById('date').classList.remove('text-muted');
	} else {
        document.getElementById('date').value = "";
        document.getElementById('date').classList.add('text-muted');
	}

    if(document.getElementById("button-send").innerHTML != "Отредактировать")
        document.getElementById("button-send").innerHTML = checkbox.checked ? "Отложить" : "Опубликовать";
}


var input = document.getElementById('tags');
tags = new Tagify(input)

var input = document.getElementById('access');
access = new Tagify(input, {
    whitelist: ["Тестеры", "Кураторы", "Модераторы", "Администраторы", "Разработчики", "Стримеры", "Высокая планка", "Бустеры", "Старшие роли"],
    userInput: false
})

var input = document.getElementById('authors');
authors_input = new Tagify(input, {
    editTags: false,
})

authors_input.on('add', function(e){
    if(!pre_post && e.detail.data.value == user.id || pre_post && e.detail.data.value == pre_post.author) {
        authors_input.removeTags(e.detail.tag)
        return show_alert("Вам не нужно указывать Автора как Со-Автора.", "error");
    }

    var res = dbr_users[e.detail.data.value];
    function load() {
        e.detail.tag.childNodes[1].style.setProperty('--block-bg', res.user.color);
        e.detail.tag.childNodes[1].classList.add("data_use")
        e.detail.tag.childNodes[1].childNodes[0].innerHTML = `<img src="${res.user.avatar}" class="img-ava-1"> ${res.user.name}`
        if(!res.user.dark) {
            e.detail.tag.childNodes[1].childNodes[0].style.color = "#fff"
        }

        dbr_users[e.detail.data.value] = res;
    }

    if(res && res.ok) {
        load();
    }

    let request = new XMLHttpRequest();
    request.open('GET', `/api/users/get/${e.detail.data.value}`);
    request.responseType = 'json';
    request.send();

    request.onload = () => {
        res = request.response
        if(!res || !res.ok) {
            authors_input.removeTags(e.detail.tag)
            return show_alert("Пользователь не найден, используйте Discord ID.", "error")
        }

        load();
    }
    request.onerror = () => {
        show_alert("Не получилось получить данные от сервера...", "error")
    }
})

function createpost(x) {
    let title = document.getElementById('title').value;
    let tags_ = tags.value;
    let access_ = access.value;
    let authors_ = authors_input.value;
    let text = document.getElementById('text').value;
    let date = document.getElementById('date'); 
    if (title == "" || text == "") {
        show_alert("Заполните поле заголовок и текст.", "error");
        return 101;
    }
    const checked = document.getElementById('delayed') && document.getElementById('delayed').checked
    if (checked && x !== 55) {
        if (document.getElementById('date').value == "") {
            show_alert("Выберите дату отложенной публикации.", "error");
            return 101;
        }
    }
    
    if (date.value == "") {
        date = 0;
    } else {
        date = date.valueAsNumber+time_offset;
    }
    let preview = document.getElementById('preview');
    if (preview.files.length > 0) {
        preview = preview.files[0];
    } else {
        preview = false;
        if (x !== 55 && !pre_post) {
            show_alert("Выберите изображение для превью.", "error");
            return 101;
        }
    }

    var authorsclean = [];
    var tagsclean = [];
    var accessclean = [];
    for (let i=0; i != authors_.length; i++) {
        authorsclean.push(authors_[i]["value"]);
    }
    for (let i=0; i != tags_.length; i++) {
        tagsclean.push(tags_[i]["value"]);
    }
    for (let i=0; i != access_.length; i++) {
        accessclean.push(access_[i]["value"]);
    }
    if (x !== 55) {
        post = {
            title,
            tags: tagsclean,
            access: accessclean,
            coauthors: authorsclean,
            text,
            date,
            preview,
        }
    } else {
        let id = false;

        if (localStorage.getItem('drafts') != null) {
            localdrafts = JSON.parse(localStorage.getItem('drafts'))
            for (let u=0; u < localdrafts.length; u++) {
                if(!localdrafts[u])
                    id = u;
            }
            if(id == false)
                id = localdrafts.length;
        } else {
            id = 0
        }
        post = {
            title: title,
            tags: tagsclean,
            access: accessclean,
            coauthors: authorsclean,
            text: text,
            id,
        }
    }
    
    return post
}

var modal = new bootstrap.Modal(document.getElementById('post'));
var modal_err = new bootstrap.Modal(document.getElementById('alert_err'));

function pred() {
    post = createpost();
    if (post == 101) {
        return
    }
    if (post.preview && post.preview != null) {
        document.getElementById('image').src = window.URL.createObjectURL(post.preview);
    } else if(pre_post) {
		document.getElementById('image').src = `/images/blog/${pre_post.id}.webp`
	}
    document.getElementById('post-title').innerHTML = post.title;
    document.getElementById('post-date').innerHTML = moment(post.date || Date.now()).format("DD MMMM YYYY, HH:mm");
    document.getElementById('post-authors').innerHTML += `<a rel="noopener noreferrer" target="_blank" href="/id${user.id}" class="badge" style="color: ${user.dark ? "#000" : "#fff"}; background-color: ${user.color}"><img src="${user.avatar}" class="img-ava"> ${user.name}</a>  `;
    for (let i=0; i != post.coauthors.length; i++) {
        let user = dbr_users[post.coauthors[i]] && dbr_users[post.coauthors[i]].ok ? dbr_users[post.coauthors[i]].user : false
        if(!user)
            continue;

        document.getElementById('post-authors').innerHTML += `<a rel="noopener noreferrer" target="_blank" href="/id${user.id}" class="badge" style="color: ${user.dark ? "#000" : "#fff"}; background-color: ${user.color}"><img src="${user.avatar}" class="img-ava"> ${user.name}</a>  `;
    }
    if (post.tags.length != 0) {
        for (let i=0; i != post.tags.length; i++) {
            document.getElementById('post-tags').innerHTML += `<span class="badge rounded-pill bg-secondary">` + post.tags[i].toLowerCase() + `</span>  `;
        }
    } else {
        document.getElementById('post-tags').innerHTML = "Нет тегов";
    }
    document.getElementById('post-text').innerHTML = md.render(post.text);

	DBR_InitPreProfiles()
    modal.show()
}

document.getElementById('post').addEventListener('hidden.bs.modal', (e) => {
	modal.hide()
    document.getElementById('post-authors').innerHTML = "";
    document.getElementById('post-tags').innerHTML = "";
    document.getElementById('post-text').innerHTML = "";
})

function savetoLocalStorage() {
    post = createpost(55);
    if (post == 101) {
        return
    }
    var drafts = JSON.parse(localStorage.getItem('drafts')) || [];
    if(typeof start_draft != "undefined") {
        post.id = start_draft;
        drafts[post.id] = post;
    } else {
        drafts.push(post);

        start_draft = post.id;

        document.getElementById('draft_btn').innerHTML = "Обновить черновик";
    }

    localStorage.setItem('drafts', JSON.stringify(drafts));
    show_alert("Черновик сохранен.", "success");
}

let saved_drafts = JSON.parse(localStorage.getItem('drafts'));
function load_start_post(draft) 
{
    document.getElementById('title').value = draft.title;
    document.getElementById('text').value = draft.text;
    
    draft.coauthors.forEach(a => {
        authors_input.addTags([a])
    })

    draft.tags.forEach(a => {
        tags.addTags([a])
    })

    draft.access.forEach(a => {
        access.addTags([a])
    })
}
if(typeof start_draft != "undefined") {
    draft = saved_drafts[start_draft];
    if(draft)
        load_start_post(draft);
} else if(pre_post) {
    load_start_post(pre_post);
    document.getElementById('date').valueAsNumber = Math.floor((pre_post.date-time_offset)/60000)*60000;
    if(!pre_post.is_released) {
        document.getElementById('delayed').checked = true
        check()
    }
}

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
}



function send() {
    let post = createpost();
    if (post == 101) {
        return
    }
    delete post.id;
    try {
        if(pre_post && pre_post.id)
            post.id = pre_post.id;
    } catch(e) {}

    let post_form = new FormData();
    for ( let key in post ) {
        if(key == "preview") continue;
        if(["coauthors", "tags", "access"].includes(key)) {
            for( let key2 in post[key] ) {
                post_form.append(`${key}[${key2}]`, post[key][key2]);
            }
        } else {
            post_form.append(key, post[key]);
        }
    }
    if(post.preview)
        post_form.append("preview", post.preview, post.preview.name);

    let request = new XMLHttpRequest();
    request.open('POST', `/api/blog/add`, true);
    request.responseType = 'json';
    request.send(post_form);

    request.onload = () => {
        res = request.response
        if(!res || !res.ok) {
            if(pre_post) {
                return show_alert("Не удалось отредактировать пост.", "error")
            } else {
                return show_alert("Не удалось создать новый пост.", "error")
            }
        }

        document.getElementById('alert_err').addEventListener('hidden.bs.modal', (e) => {
            document.location.href = `/editor/${res.post.id}`
        })
        if(pre_post) {
            show_alert("Пост отредактирован.", "success")
        } else {
            show_alert("Новый пост создан!", "success")
        }
    }
    request.onerror = () => {
        show_alert("Не получилось отправить данные на сервер...", "error")
    }
}