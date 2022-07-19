function gravarOpcoes() {
    alert('Opções gravadas!');
}

setTimeout(() => {
    $('#aud-aid-options-footer > button').click(gravarOpcoes);
}, 1000);

//criar um listener para adicionar o evento de click no html puro