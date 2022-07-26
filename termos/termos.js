document.getElementsByTagName('input')[0].addEventListener("change", habilitaBotaoConcordar);
document.getElementsByTagName('button')[0].addEventListener("click", concordaTermos);

function habilitaBotaoConcordar() {
    if ($('#aud-aid-terms-agreement-checkbox')[0].checked) {
        $('#aud-aid-terms-agreement-button').removeAttr('disabled');
        $('#aud-aid-terms-agreement-button').attr('title', 'Clique para concordar com os termos');
    } else {
        $('#aud-aid-terms-agreement-button').attr('disabled', 'disabled');
        $('#aud-aid-terms-agreement-button').attr('title', 'Clique na caixa acima para habilitar o botão');
    }
}

function concordaTermos() {
    if ($('#aud-aid-terms-agreement-checkbox')[0].checked) {
        browser.storage.local.set({'concordo': true});
        alert("concordei");
    } else
        browser.storage.local.set({'concordo': false});
}


function debugTermos() {
    browser.storage.local.set({'concordo': false});
}

$(document).ready(function () {
    $('#aud-aid-terms-disagreement-button').click(debugTermos);
});