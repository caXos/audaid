async function gravarOpcoes() {
    await browser.storage.local.set({ "audAidConcordo": false });
    let alteraConcordo = browser.storage.local.get('audAidConcordo');
    alteraConcordo.then(function (resposta) {
        alert(resposta.audAidConcordo);
    })
}

$(document).ready(function () {
    $('#aud-aid-options-footer > button').click(gravarOpcoes);
    $('#aud-aid-debug-level-select').change(changeDebugLevel);
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

$(document).ready(function () {
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
});