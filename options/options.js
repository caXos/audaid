function gravarOpcoes() {
    alert('Opções gravadas!');
}

$(document).ready(function () {
    $('#aud-aid-options-footer > button').click(gravarOpcoes);
});

//criar um listener para adicionar o evento de click no html puro