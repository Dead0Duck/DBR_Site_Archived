var dbr_users = {};
var dbr_users_queue = {};
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

let reqs = {};
function get_user(id) {
    if(id == user.id) {
        return user;
    }

    return dbr_users[id];
}

function get_user_async(id) {
	return new Promise(function (resolve, reject) {
		if(id == user.id) {
			return user;
		}

		if(!dbr_users[id] && !dbr_users_queue[id]) {
			let request = new XMLHttpRequest();
			request.open('GET', `/api/users/get/${id}`);
			request.responseType = 'json';
			request.send();
			dbr_users_queue[id] = request;

			request.onload = () => {
				delete dbr_users_queue[id];

				res = request.response
				if(res && res.ok) {
					dbr_users[id] = res.user;
					return resolve(dbr_users[id])
				} 
		
				return resolve(false);
			}
			request.onerror = () => {
				delete dbr_users_queue[id];
				return resolve(false);
			}
		} else
			return resolve(dbr_users[id]);
	})
}

moment.locale("ru");


var input = document.getElementById('authors');
authors_input = new Tagify(input)

var input = document.getElementById('tags');
tags = new Tagify(input)


function count_drafts() {
    drafts = JSON.parse(localStorage.getItem('drafts'));
if  (drafts == null || drafts.length == 0) {
    document.getElementById("draft_count").innerHTML = "0";
} else {
    document.getElementById("draft_count").innerHTML = drafts.length;
}}

var modal = new bootstrap.Modal(document.getElementById('post'));

function load_draft(id) {
    render_post(drafts[id], true)
}

function load_post(id, queue) {
    if(queue)
        return render_post(posts_q[id]);

    render_post(show_posts[id]);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
}

async function render_post(postm, is_draft) {
    if(is_draft) {
        document.getElementById('image').src = "/images/draft.png";
        document.getElementById('post-authors').innerHTML += `<a rel="noopener noreferrer" target="_blank" href="/id${user.id}" class="badge" style="color: ${user.dark ? "#000" : "#fff"}; background-color: ${user.color}"><img src="${user.avatar}" class="img-ava"> ${user.name}</a>  `;
        document.getElementById('post-link-div').style.display = "none"
    } else {
        document.getElementById('image').src = `/images/blog/${postm.id}.webp`;
        let auth = await get_user(postm.author);
        if(auth)
            document.getElementById('post-authors').innerHTML += `<a rel="noopener noreferrer" target="_blank" href="/id${auth.id}" class="badge" style="color: ${auth.dark ? "#000" : "#fff"}; background-color: ${auth.color}"><img src="${auth.avatar}" class="img-ava"> ${auth.name}</a>  `;

        document.getElementById('post-link-div').style.display = "block"
        document.getElementById('post-link').onclick = () => {
            copyToClipboard(`${document.location.origin}/news/${postm.id}`)
            alert("Ссылка скопирована!")
        }
    }
    document.getElementById('post-title').innerHTML = postm.title;
    document.getElementById('post-date').innerHTML = moment(postm.date || Date.now()).format("DD MMMM YYYY, HH:mm");
    if(postm.last_edit) {
        let editor = await get_user(postm.last_editor);
        document.getElementById('post-date').innerHTML += ` <span class="text-muted user-select-none" data-bs-toggle="tooltip" data-bs-html="true" data-bs-placement="top" title="Изменено: ${moment(postm.last_edit).format("DD MMMM YYYY, HH:mm")}<br>Кем: ${editor.name}">(изменено)</span>`
    }
    for (let i=0; i != postm.coauthors.length; i++) {
        let auth = await get_user(postm.coauthors[i]);
        if(!auth) continue;

        document.getElementById('post-authors').innerHTML += `<a rel="noopener noreferrer" target="_blank" href="/id${auth.id}" class="badge" style="color: ${auth.dark ? "#000" : "#fff"}; background-color: ${auth.color}"><img src="${auth.avatar}" class="img-ava"> ${auth.name}</a>  `;
    }
    if (postm.tags.length != 0) {
    for (let i=0; i != postm.tags.length; i++) {
        document.getElementById('post-tags').innerHTML += `<span class="badge rounded-pill bg-secondary">` + postm.tags[i] + `</span>  `;
    }} else {
        document.getElementById('post-tags').innerHTML = "Нет тегов";
    }
    document.getElementById('post-text').innerHTML = md.render(postm.text);

    tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

	DBR_InitPreProfiles()
    modal.show()
}

document.getElementById('post').addEventListener('hidden.bs.modal', (e) => {
	modal.hide()
    document.getElementById('post-authors').innerHTML = "";
    document.getElementById('post-tags').innerHTML = "";
    document.getElementById('post-text').innerHTML = "";
})

const adm = document.getElementById('admin-button')
if(document.getElementById('admin-button')) {
    var posts_q = [];

    function admin() {
        $("#admin-view").show("slow")
        $("#editor-button").attr( "style", "display: block !important;" )
        document.getElementById('admin-button').setAttribute("onclick", "exitadmin()");
        document.getElementById('admin-button').innerHTML = `<i class="bi bi-x-circle-fill"></i>`;
        $("#admin-button").animate({
            "outline-width": "10000px",
            "outline-offset": "5000px"
        }, 1000).animate({
            "outline-width": "0px", 
        }, 0)
    }

    function exitadmin() {
        $("#admin-view").hide("slow")
        $("#editor-button").fadeOut()
        document.getElementById('admin-button').setAttribute("onclick", "admin()");
        document.getElementById('admin-button').innerHTML = `<i class="bi bi-star-fill"></i>`;
        document.getElementById('admin-button').style.outlineWidth = "10000px";
        $("#admin-button").animate({
            "outline-width": "0px",
            "outline-offset": "0px"
        }, 700)
    }
}

async function load_drafts() {
    drafts = JSON.parse(localStorage.getItem('drafts'));
    if (drafts != null && drafts != [] && drafts != "") {
        for (let i=0; i != drafts.length; i++) {
            let author = ""
            let tagss = ""
            if(drafts[i].coauthors.length > 0) {
                for (let ii=0; ii != drafts[i].coauthors.length; ii++) {
                    let auth = await get_user_async(drafts[i].coauthors[ii]);
                    if(!auth) continue;

                    author += `<a rel="noopener noreferrer" target="_blank" href="/id${auth.id}" class="badge" style="color: ${auth.dark ? "#000" : "#fff"}; background-color: ${auth.color}"><img src="${auth.avatar}" class="img-ava"> ${auth.name}</a>  `;
                }
            } else {
                author = "Нет Со-Авторов."
            }

            if (drafts[i].tags.length != 0) {
                for (let iii=0; iii != drafts[i].tags.length; iii++) {
                    tagss += `<span class="badge rounded-pill bg-secondary">` + drafts[i].tags[iii] + `</span>  `;
                }} else {
                tagss = "Нет тегов";
            }
            document.getElementById('drafts').innerHTML += `<div class="col" id="post-${drafts[i].id}">
            <div class="card">
                <img src="/images/draft.png" class="card-img-top news-preview">
                <div class="card-body">
                <div class="card-text">
                    <span class="fs-4">${drafts[i].title}</span>
                <div><i class="bi bi-person-fill"></i> Со-Автор(ы): ${author}</div>
            <div>${tagss}</div>
            </div>
                <button class="btn btn-neon mt-2" onclick="load_draft(${i})"><i class="bi bi-eye-fill"></i> Читать</button> <a href="/editor/draft_${i}" class="btn btn-warning mt-2"><i class="bi bi-pencil-square"></i> Редактировать</a> <button class="btn btn-danger mt-2" onclick="delete_draft(${drafts[i].id})"><i class="bi bi-trash-fill"></i> Удалить</button>
                </div>
            </div>
            </div>`
        }
    }
}

function refresh_drafts() {
    if(!adm) return
    
    $("#drafts").empty()
    load_drafts()
    count_drafts()
}
refresh_drafts()

function delete_draft(id) {
    if (!confirm('Вы точно хотите удалить этот черновик?')) {
        return false
    }

    for (let v=0; v != drafts.length; v++) {
        if (drafts[v].id == id) {
            index = drafts.indexOf(drafts[v])
        }
    }
    drafts.splice(index, 1);
    localStorage.setItem('drafts', JSON.stringify(drafts));
    refresh_drafts()
}
function delete_post(id) {
    if (!confirm('Вы точно хотите удалить этот пост?')) {
        return false
    }

    let request = new XMLHttpRequest();
    request.open('POST', `/api/blog/remove/${id}`, true);
    request.responseType = 'json';
    request.send();

    request.onload = () => {
        res = request.response
        if(!res || !res.ok) {
            return alert("Не удалось удалить пост.", "error")
        }

        posts = posts.filter(p => p.id != id);
        posts_q = posts_q.filter(p => p.id != id);
        blog_search()

        alert("Пост удалён.", "success");
    }
    request.onerror = () => {
        alert("Не получилось отправить данные на сервер...", "error")
    }
}


const debugcheck = document.getElementById('debugadminview')
if(debugcheck) {
    debugcheck.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        localStorage.setItem('admindebugblog', 1);
    } else {
        localStorage.setItem('admindebugblog', 0);
    }
    })

    if (localStorage.getItem('admindebugblog') == null) {
        localStorage.setItem('admindebugblog', 0);
    }

    if (localStorage.getItem('admindebugblog') === '1') {
        debugcheck.checked = true;
        admin()
    }
}

var posts = [];
var show_posts = [];
let page_changing = true;
let open_post = true;
async function page(pg = 0, ignore) {
    if(pg < 0) return;
	if(!ignore && page_changing) return;
	
    const pg_items = 9;
    const pages = Math.max(Math.floor((show_posts.length-1)/pg_items)+1, 1)
    if(pg > pages-1) return

	$("#published").fadeOut("fast", async () => {
		page_changing = true
		
		let pb = document.getElementById("published");
        if(show_posts.length > 0) {
            pb.innerHTML = "";
            for(let i = pg_items*pg; i < pg_items+pg_items*pg; i++) {
                if(!show_posts[i]) continue;

                let post = show_posts[i];

                let author = ""
                let tags = ""
                let auth = await get_user(post.author);
                if(auth)
                    author += `<a rel="noopener noreferrer" target="_blank" href="/id${auth.id}" class="badge" style="color: ${auth.dark ? "#000" : "#fff"}; background-color: ${auth.color}"><img src="${auth.avatar}" class="img-ava"> ${auth.name}</a>  `;  
                for (let ii=0; ii != post.coauthors.length; ii++) {
                    let auth = await get_user(post.coauthors[ii]);
                    if(!auth) continue;

                    author += `<a rel="noopener noreferrer" target="_blank" href="/id${auth.id}" class="badge" style="color: ${auth.dark ? "#000" : "#fff"}; background-color: ${auth.color}"><img src="${auth.avatar}" class="img-ava"> ${auth.name}</a>  `;
                }
                if(author == "")
                    author = "Не найдены."

                if (post.tags.length != 0) {
                    for (let iii=0; iii != post.tags.length; iii++) {
                        tags += `<span class="badge rounded-pill bg-secondary">` + post.tags[iii] + `</span>  `;
                    }
                } else {
                    tags = "Нет тегов";
                }

                let to_add = `
                <div class="col">
                    <div class="card">
                        <img src="/images/blog/${post.id}.webp" class="card-img-top news-preview">
                        <div class="card-body">
                            <div class="card-text">
                                <span class="fs-4">${post.title}</span>
                                <div><i class="bi bi-person-fill"></i> Автор(ы): ${author}</div>
                                <div> <i class="bi bi-calendar-fill"></i> ${moment(post.date || Date.now()).format("DD MMMM YYYY, HH:mm")}`

                if(post.last_edit) {
                    let editor = await get_user(post.last_editor);
                    to_add += ` <span class="text-muted user-select-none" data-bs-toggle="tooltip" data-bs-html="true" data-bs-placement="top" title="Изменено: ${moment(post.last_edit).format("DD MMMM YYYY, HH:mm")}<br>Кем: ${editor.name}">(изменено)</span>`
                }

                to_add += `</div>
                                <div>${tags}</div>
                            </div>
                            <button class="btn btn-neon mt-2" onclick="load_post(${i})"><i class="bi bi-eye-fill"></i> Читать</button>`
                if(!user.mobile && post.can_edit)
                    to_add += ` 
                            <a href="/editor/${post.id}" class="btn btn-warning mt-2"><i class="bi bi-pencil-square"></i> Редактировать</a> 
                            <button class="btn btn-danger mt-2" onclick="delete_post(${post.id})"><i class="bi bi-trash-fill"></i> Удалить</button>`
                        
                to_add += `
                        </div>
                    </div>
                </div>`

                pb.innerHTML += to_add
            }

            tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl)
            })
            

            if(pages == 1) {
                $(".blog_pages").html("")
            } else {
                let to_add_search = ""
                
                if(pg > 0) {
                    to_add_search += `<li class="page-item"><button class="page-link" onclick="page()">1</button></li>`

                    if(pg > 2) {
                        if(pg == 3)
                            to_add_search += `<li class="page-item">
                                <button class="page-link" onclick="page(1)">2</button>
                            </li>`
                        else
                            to_add_search += `<li class="page-item disabled"><span class="page-link"><i class="bi bi-three-dots"></i></span></li>`

                        to_add_search += `<li class="page-item">
                                <button class="page-link" onclick="page(${pg-1})">${pg}</button>
                            </li>`
                    } else if(pg > 1) {
                        to_add_search += `<li class="page-item">
                                <button class="page-link" onclick="page(${pg-1})">${pg}</button>
                            </li>`
                    }
                }
                
                
                to_add_search += `<li class="page-item active">
                    <span class="page-link">${pg+1}</span>
                </li>`

                if(pages-pg > 1) {
                    to_add_search += `<li class="page-item">
                        <button class="page-link" onclick="page(${pg+1})">${pg+2}</button>
                    </li>`
                    if(pages-pg > 2) {
                        if(pages-pg > 3) {
                            if(pages-pg == 4)
                                to_add_search += `<li class="page-item">
                                    <button class="page-link" onclick="page(${pages-2})">${pages-1}</button>
                                </li>`
                            else
                                to_add_search += `<li class="page-item disabled"><span class="page-link"><i class="bi bi-three-dots"></i></span></li>`
                        }
                            
                        to_add_search += `<li class="page-item">
                            <button class="page-link" onclick="page(${pages-1})">${pages}</button>
                        </li>`
                    }
                }

                $(".blog_pages").html(to_add_search);
            }
        } else {
            pb.innerHTML = `<div></div><h1 align="center">Пустота...</h1>`
        }
		
		$("#published").fadeIn("fast");

        if(open_post) {
            let h = window.location.hash.substr(1);
            if(h.startsWith("post_")) {
                h = h.substring(5);

                h = posts.findIndex(p => p.id == h)
                if(h > -1) {
                    load_post(h);
                }
            }

            open_post = false;
        }

		DBR_InitPreProfiles()
		
		page_changing = false
	})
}

{
    let request = new XMLHttpRequest();
    request.open('POST', `/api/blog/get`);
    request.responseType = 'json';
    request.send();

    request.onload = () => {
        if(request.response.ok) {
			dbr_users = request.response.users;

            posts = request.response.posts;
            if(!user.mobile) {
                posts_q = request.response.queue;
                draw_queue()
            }
            show_posts = posts;

            page(0, true);
        } else {
            request.onerror();
        }
    }
    request.onerror = () => {
        delete reqs[id];

        alert("Не получилось список постов от сервера...");
    }
}


function blog_search() {
    if(page_changing) return;
    page_changing = true;

    show_posts = posts
    let t = document.getElementById("title").value
    if(t != "") {
        show_posts = show_posts.filter(p => p.title.toLowerCase().search(t.toLowerCase()) != -1)
    }

    let date = document.getElementById("date").valueAsNumber
    if(date) {
        show_posts = show_posts.filter(p => p.date >= date && p.date <= date+86400000)
    }

    let tags_arr = []
    tags.value.forEach(tag => {
        tags_arr.push(tag.value)
    })
    if(tags_arr.length > 0) {
        show_posts = show_posts.filter(p => tags_arr.every(ttt => p.tags.includes(ttt.toLowerCase())))
    }

    let authors_arr = []
    authors_input.value.forEach(aut => {
        authors_arr.push(aut.value)
    })
    if(authors_arr.length > 0) {
        show_posts = show_posts.filter(p => 
			authors_arr.every(aut => 
				get_user(p.author).name.toLowerCase().search(aut.toLowerCase()) != -1 ||
				get_user(p.author).tag.toLowerCase().search(aut.toLowerCase()) != -1 ||
				p.coauthors.some(coaut =>
					get_user(coaut).name.toLowerCase().search(aut.toLowerCase()) != -1 ||
					get_user(coaut).tag.toLowerCase().search(aut.toLowerCase()) != -1
				)
			)
		)
    }

    page(0, true)
}


async function draw_queue() {
    let queue = document.getElementById("delayed")
    
    if(posts_q.length == 0) 
        return;

    queue.innerHTML = "";
    for(let i = 0; i < posts_q.length; i++) {
        if(!posts_q[i]) continue;

        let post = posts_q[i];

        let author = ""
        let tags = ""
        let auth = await get_user(post.author);
        if(auth)
            author += `<a rel="noopener noreferrer" target="_blank" href="/id${auth.id}" class="badge" style="color: ${auth.dark ? "#000" : "#fff"}; background-color: ${auth.color}"><img src="${auth.avatar}" class="img-ava"> ${auth.name}</a>  `;  
        for (let ii=0; ii != post.coauthors.length; ii++) {
            let auth = await get_user(post.coauthors[ii]);
            if(!auth) continue;

            author += `<a rel="noopener noreferrer" target="_blank" href="/id${auth.id}" class="badge" style="color: ${auth.dark ? "#000" : "#fff"}; background-color: ${auth.color}"><img src="${auth.avatar}" class="img-ava"> ${auth.name}</a>  `;
        }
        if(author == "")
            author = "Не найдены"

        if (post.tags.length != 0) {
            for (let iii=0; iii != post.tags.length; iii++) {
                tags += `<span class="badge rounded-pill bg-secondary">` + post.tags[iii] + `</span>  `;
            }
        } else {
            tags = "Нет тегов";
        }

        let to_add = `
        <div class="col">
            <div class="card">
                <img src="/images/blog/${post.id}.webp" class="card-img-top news-preview">
                <div class="card-body">
                    <div class="card-text">
                        <span class="fs-4">${post.title}</span>
                        <div><i class="bi bi-person-fill"></i> Автор(ы): ${author}</div>
                        <div> <i class="bi bi-calendar-fill"></i> ${moment(post.date || Date.now()).format("DD MMMM YYYY, HH:mm")}</div>
                        <div>${tags}</div>
                    </div>
                    <button class="btn btn-neon mt-2" onclick="load_post(${i}, true)"><i class="bi bi-eye-fill"></i> Читать</button>
                    <a href="/editor/${post.id}" class="btn btn-warning mt-2"><i class="bi bi-pencil-square"></i> Редактировать</a> 
                    <button class="btn btn-danger mt-2" onclick="delete_post(${post.id})"><i class="bi bi-trash-fill"></i> Удалить</button>
                </div>
            </div>
        </div>`

        queue.innerHTML += to_add
    }
}