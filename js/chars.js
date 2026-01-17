// поиск
let search_bar = document.getElementById("search")
let search_elems = document.getElementsByClassName('char_card');

search_bar.addEventListener("input", () => {
    $.each($(".char_card"), function(i) {
        const v = $(' .char_name', this).text().toLowerCase()
        
        if(search_bar.value == "" || v.search(search_bar.value.toLowerCase()) != -1) {
            $(this).fadeIn('fast')
        } else {
            $(this).fadeOut('fast')
        }
    });
});

// убираем картинку modal, когда он закрывается
$('#modal').on('hidden.bs.modal', function (e) {
    document.getElementById('modalchar_art').removeAttribute('src')
})

// создаем modal с информацией о персонаже
var modal = new bootstrap.Modal(document.getElementById('modal')); 
function modalChar(char) {
    var request = new XMLHttpRequest();
    request.open('GET', `/chars_data/${char}.json`);
    request.responseType = 'json';
    request.send();
    $("#modalrow").hide()
    $("#err").hide()
    $("#loading").show()
    $("#mod_size").removeClass("modal-xl")
    document.getElementById("spybar").style.width = 0 + "%";
    modal.show()
    request.onload = function() {
        if(!request.response || !request.response.prepared) {
            $("#loading").hide()
            $("#err").show()
            $("#modalrow").hide()
            $("#mod_size").removeClass("modal-xl")
            return
        }

        const data = request.response.data;
        document.getElementById('modalchar_name').innerText = data.name
        if(data.real_name) {
            document.getElementById('modalchar_name').innerText += `(${data.real_name})`
        }
        document.getElementById('modalchar_talant').innerText = data.talents[0]
        if(data.talents.length > 1) {
            document.getElementById('modalchar_talants').style.display = "block";

            document.getElementById('modalchar_talants').innerText = data.talents[1]
            for(let i = 2; i < data.talents.length; i++) {
                document.getElementById('modalchar_talants').innerText += `<br>${data.talents[i]}`
            }
        } else {
            document.getElementById('modalchar_talants').style.display = "none";
        }
        document.getElementById('modalchar_art').setAttribute('src',`/chars/${char}.png`)

        document.getElementById('modalchar_blood').innerText = data.info.blood
        document.getElementById('modalchar_chest').innerText = data["info"]["chest"]
        document.getElementById('modalchar_bd').innerText = data["info"]["bd"]
        document.getElementById('modalchar_weight').innerText = data["info"]["weight"]
        document.getElementById('modalchar_height').innerText = data["info"]["height"]
        document.getElementById('modalchar_likes').innerText = data["info"]["likes"]
        document.getElementById('modalchar_dislikes').innerText = data["info"]["dislikes"]
        document.getElementById('modalchar_content').innerHTML = ""
        
        const doc_content = document.getElementById('modalchar_content')
        for(let i = 0; i < data.content.length; i++) {
            let element = data.content[i];
            if(typeof(element) === 'string'){
                element = element.replaceAll(`<b>`, `<b class="text-theme">`)
                doc_content.innerHTML += `<p>${element}</p>`;}
            else {
                doc_content.innerHTML += `<br><b class="fs-4">${element[0]}:</b>`
                doc_content.innerHTML += `<ul>`
                element.splice(0,1)
                element.forEach(another => {
                    another = another.replaceAll(`<b>`, `<b class="text-theme">`)
                    doc_content.innerHTML += `<li>${another}</li>`
                });
                doc_content.innerHTML += `</ul>`
                if(i < data.content.length-1 && typeof data.content[i+1] != 'object') 
                    doc_content.innerHTML += `<br>`
            }
        };
        
        $("#err").hide()
        $("#loading").hide()
        $("#modalrow").show()
        $("#mod_size").addClass("modal-xl")
		DBR_InitPreProfiles()
      }
    request.onerror = function() {
        $("#loading").hide()
        $("#err").show()
        $("#modalrow").hide()
        $("#mod_size").removeClass("modal-xl")
    }
}


// скроллбар
document.getElementById('modalbody').onscroll = scrollIndicator;

function scrollIndicator() {
    var winScroll = document.getElementById('modalbody').scrollTop;
    var height = document.getElementById('modalbody').scrollHeight - document.getElementById('modalbody').clientHeight;
    var scrolled = (winScroll / height) * 100;
    document.getElementById("spybar").style.width = scrolled + "%";
}

// открытие памятки по якорю
function newHash() {
    if(window.location.hash)
        modalChar(window.location.hash.substr(1))	
}

window.onhashchange = newHash
newHash();