document.getElementsByTagName('button')[0].addEventListener("click", concordaTermos);

async function concordaTermos() {
    $("#aud-aid-alert-message").dialog('open');
}

function getSuccess(tabInfo) {
    console.log("Success Tab Info", tabInfo);
    browser.tabs.remove(tabInfo.id);
}
function getError(error) {
    console.log("Erro", error);
}

$(function () {
    $("#aud-aid-alert-message").dialog({
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
                browser.storage.local.set({ 'audAidConcordo': true });
                // await Swal.fire({
                //     icon: 'success',
                //     text: 'Você concordou com os termos.\nEsta aba será fechada e você\njá pode trabalhar com a extensão.'
                // });
                const abaAtual = browser.tabs.getCurrent();
                abaAtual.then(getSuccess, getError);
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
});