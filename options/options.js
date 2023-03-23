var tribunal = 0;
var perfisDoUsuario = [];

async function gravarOpcoes() {
    await browser.storage.local.set({ "audAidConcordo": false });
    let alteraConcordo = browser.storage.local.get('audAidConcordo');
    alteraConcordo.then(function (resposta) {
        alert(resposta.audAidConcordo);
    })
}

async function encontraTribunal() {
    for (i=1; i<=24; i++) {
        await browser.tabs.query({
            url: "*://pje.trt"+i+".jus.br/*"
        })
        .then(function (res) {
            // console.log(res)
            if (res.length > 0) {
                // console.log("Encontrei TRT "+i)
                tribunal = i
            }
        })
    }    
}

function pegaUrlParaAbrir(suffix) {
    if (suffix === null || suffix === undefined) suffix = '';
    var urlParaAbrir = '';
    urlParaAbrir = 'https://pje.trt'+tribunal+'.jus.br/' + suffix;
    // console.log(urlParaAbrir)
    return urlParaAbrir;
}

$(document).ready(async function () {
    $('#aud-aid-alert-container').hide().dialog({
        autoOpen: false,
        show: {
            effect: "fadeIn",
            duration: 250
        },
        hide: 250,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Concordar": function () {
                $(this).dialog("close");
            }
        }
    });

    $('#aud-aid-options-footer > button').click(gravarOpcoes);
    
    $('#aud-aid-debug-level-select').change(changeDebugLevel);

    await encontraTribunal().then(async () => {
        var url = pegaUrlParaAbrir('pje-seguranca/api/token/perfis');
        var resposta = await fetch(url);
        var perfis = await resposta.json().then(function (perfis) {
            // console.log('Perfis do usuário logado', perfis);
            perfisDoUsuario = perfis
            var orgaos = [];
            for (i = 0; i < perfis.length; i++) {
                orgaos.push(perfis[i].idOrgaoJulgador);
            }
            return orgaos;
        }).then(async function (orgaos) {
            // console.log('Orgãos Julgadores dos perfis', orgaos);
            var idsSalas = [];
            for (i = 0; i < orgaos.length; i++) {
                var url = pegaUrlParaAbrir('pje-comum-api/api/salasaudiencias?idOrgaoJulgador=' + orgaos[i]);
                var salas = await fetch(url);
                var salasJson = await salas.json();
                idsSalas.push(salasJson);
            }
            // console.log(idsSalas)
            buildDefaultHearingRoomSelectOptions(idsSalas);
        })
    });    
});

//criar um listener para adicionar o evento de click no html puro

async function changeDebugLevel() {
    var audAidDebugLevelSelectedIndex = $('#aud-aid-debug-level-select')[0].selectedIndex;
    await browser.storage.local.set({ "audAidDebugLevel": audAidDebugLevelSelectedIndex });
    let alteraDebugLevel = browser.storage.local.get('audAidDebugLevel');
    alteraDebugLevel.then(function (resposta) {
        openAlert();
        console.log(resposta);
    })
}

function openAlert() {
    $('#aud-aid-alert-container').dialog('open');
}

function buildDefaultHearingRoomSelectOptions(roomsArray) {
    // console.log('RoomsArray', roomsArray, perfisDoUsuario);
    let defaultRoomSelect = $('#aud-aid-default-hearing-room-select')
    let profileIterator
    let roomIterator

    for (profileIterator = 0; profileIterator < perfisDoUsuario.length; profileIterator++) {
        let option = $('<option />').attr('value',0).attr('disabled','disabled').text(perfisDoUsuario[profileIterator].orgaoJulgador)
        $(defaultRoomSelect).append(option)
        for (roomIterator = 0; roomIterator < roomsArray[profileIterator].length; roomIterator++) {
            let option = $('<option />').attr('value',roomsArray[profileIterator][roomIterator].id).text(roomsArray[profileIterator][roomIterator].nome)
            $(defaultRoomSelect).append(option)
        }
    }
}
// $(document).ready(function () {
    // $('#aud-aid-alert-container').hide().dialog({
    //     autoOpen: false,
    //     show: {
    //         effect: "fadeIn",
    //         duration: 250
    //     },
    //     hide: 250,
    //     resizable: false,
    //     height: "auto",
    //     width: 400,
    //     modal: true,
    //     buttons: {
    //         "Concordar": function () {
    //             $(this).dialog("close");
    //         }
    //     }
    // });
// });