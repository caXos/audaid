$(document).ready(function () {
    $('#botao-abre-opcoes').click(abreOpcoes);
    $('#botao-abre-termos').click(abreTermos);
});

function abreOpcoes() {
    window.open("./../options/options.html", "_blank");
}

function abreTermos() {
    window.open("./../termos/termos.html", "_blank");
}