$(document).ready(function () {
    $('#botao-abre-pauta-aud-aid').click(abrePautaAudAid);
    $('#botao-abre-pauta-pje').click(abrePautaPje);
    $('#botao-abre-opcoes').click(abreOpcoes);
    $('#botao-abre-historico').click(abreHistorico);
    $('#botao-abre-termos').click(abreTermos);
});

function abrePautaAudAid() {
    window.open("./../pauta/pauta.html", "_blank");
}

function abrePautaPje() {
    window.open(getOptionsUrlToOpen('pjekz/pauta-audiencias'), "_blank");
}

function abreOpcoes() {
    window.open("./../options/options.html", "_blank");
}

function abreHistorico() {
    window.open("./../history/history.html", "_blank");
}

function abreTermos() {
    window.open("./../termos/termos.html", "_blank");
}

function getOptionsUrlToOpen(suffix) {
    console.log("getOptionsUrlToOpen")
    if (suffix === null || suffix === undefined) suffix = '';
    var urlAtual = window.location.href.toString();
    var urlParaAbrir = '';
    var tribunal = urlAtual.substring(urlAtual.search("trt"),urlAtual.search("trt")+5)
    if (tribunal.endsWith(".")) tribunal.slice(0,-1)
    if (urlAtual.includes("homologacao")) urlParaAbrir = 'https://pje-homologacao.'+tribunal+'.jus.br/' + suffix;
    else if (urlAtual.includes("treinamento")) urlParaAbrir = 'https://pje-treinamento.'+tribunal+'.jus.br/' + suffix;
    else urlParaAbrir = 'https://pje.'+tribunal+'.jus.br/' + suffix;
    return urlParaAbrir;
}