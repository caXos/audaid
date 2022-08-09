// var auds = [];
/*
var today = new Date();
var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
-------
pegar quantidade de dias em um mês
function daysInMonth(iMonth, iYear)
{
    return 32 - new Date(iYear, iMonth, 32).getDate();
}
----------

pega dados das partes
https://pje.trt9.jus.br/audapi/rest/pje/audpje/processos/1385415/partes
https://pje.trt9.jus.br/audapi/rest/pje/audpje/processos/IDDOPROCESSO/partes

pega dados do processo
https://pje.trt9.jus.br/pje-comum-api/api/processos/id/IDDOPROCESSO

pega todas as auds designadas de um determinado período -> precisa estar logado no Aud4
https://pje.trt9.jus.br/audapi/rest/pje/audpje/pautas?dataInicio=2022-08-04&dataFim=2022-08-04&orgaoJulgador=49

pega as auds do dia, separado por sala, incluindo vagas cadastradas no PJe e também dados das partes
https://pje.trt9.jus.br/pje-comum-api/api/pautasaudiencias/classificacoes/dia?idSalaAudiencia=162&data=2022-08-09

pega os perfis do usuário
https://pje.trt9.jus.br/pje-seguranca/api/token/perfis



estudar sobre laço "for await ... of"
*/
var iconeEditarTemplate = `<svg title="Redesignar" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
</svg>`;
var iconeCancelarTemplate = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`;

$(document).ready(function () {
    $('#botao').click(pegaProcessos);
    $('#botao2').click(constroiAbas);
});

function pegaUrlParaAbrir(suffix) {
    if (suffix === null || suffix === undefined) suffix = '';
    var urlAtual = window.location.href.toString();
    var urlParaAbrir = '';
    if (urlAtual.includes("homologacao")) urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/' + suffix;
    else if (urlAtual.includes("treinamento")) urlParaAbrir = 'https://pje-treinamento.trt9.jus.br/' + suffix;
    else urlParaAbrir = 'https://pje.trt9.jus.br/' + suffix;
    return urlParaAbrir;
}

async function constroiAbas() {
    var url = pegaUrlParaAbrir('pje-seguranca/api/token/perfis');
    var resposta = await fetch(url);
    var perfis = await resposta.json().then(function (perfis) {
        // console.log('Perfis do usuário logado', perfis);
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
        return idsSalas;
    }).then(function (salas) {
        return constroiAbasSalas(salas);
    }).then(async function (salas) {
        // console.log('vai criar os meses', salas);
        /*return*/ await constroiAbasMeses(salas);
    });
}

function constroiAbasSalas(salas) {
    // console.log('constroiAbasSalas', salas);
    var abasSalasLista = $('<ul />').attr('id', 'abas-salas-lista');
    for (i = 0; i < salas.length; i++) {
        for (j = 0; j < salas[i].length; j++) {
            //<li id="aba1"><a href="#aba-sala1-abas-meses">Sala 01</a></li>
            var aba = $('<li />').attr('id', 'aba-sala-id-' + salas[i][j].id);
            var textoSplit = salas[i][j].nome.split(" ");
            var texto = salas[i][j].orgaoJulgador.sigla + ' ' + textoSplit[0] + ' ' + textoSplit[1];
            var titulo = salas[i][j].orgaoJulgador.sigla + ' ' + salas[i][j].nome;
            $(aba).append($('<a />').attr('href', '#aba-sala-id-' + salas[i][j].id + '-abas-meses').attr('title', titulo).html(texto));
            $(abasSalasLista).append(aba);
        }
    }
    $('#abas-salas').attr('aba', 'aba').html(abasSalasLista);
    return salas;
}

async function constroiAbasMeses(salas) {

    // var hoje = new Date();
    // var anoQueVem = new Date(hoje.setFullYear(hoje.getFullYear() + 1));
    // hoje = hoje.toISOString();
    // anoQueVem = anoQueVem.toISOString();
    // var meses = [
    //     'Janeiro',
    //     'Fevereiro',
    //     'Março',
    //     'Abril',
    //     'Maio',
    //     'Junho',
    //     'Julho',
    //     'Agosto',
    //     'Setembro',
    //     'Outubro',
    //     'Novembro',
    //     'Dezembro'
    // ];
    // console.log(hoje, anoQueVem);

    var containerPrimario = $('#abas-salas');

    for (i = 0; i < salas.length; i++) {
        for (j = 0; j < salas[i].length; j++) {
            var mesesContainer = $('<div />').attr('id', 'aba-sala-id-' + salas[i][j].id + '-abas-meses').attr('aba', 'aba');
            var mesesContainerListaMeses = $('<ul />').attr('id', 'aba-sala-id-' + salas[i][j].id + '-lista-meses');
            for (m = 0; m < 12; m++) {
                var mesDate = new Date(new Date().setMonth(new Date().getMonth() + m));
                var mesTexto = mesDate.toLocaleString('pt-BR', { month: 'long' }) + mesDate.toLocaleString('pt-BR', { year: 'numeric' })
                // var pautaVazia = $('<div />').attr('id', 'conteudo-aba-sala-id-' + salas[i][j].id + '-' + mesDate.getMonth() + '-' + mesDate.getFullYear()).text('pautaVazia ' + mesTexto);
                var pautaVazia = $('<div />').attr('id', 'conteudo-aba-sala-id-' + salas[i][j].id + '-' + mesDate.getMonth() + '-' + mesDate.getFullYear()).addClass('container-fluid').text('pautaVazia');
                $(mesesContainer).append(pautaVazia);
            }
            for (m = 0; m < 12; m++) {
                var mesDate = new Date(new Date().setMonth(new Date().getMonth() + m));
                var mesTexto = mesDate.toLocaleString('pt-BR', { month: 'long' }) + mesDate.toLocaleString('pt-BR', { year: 'numeric' })
                var mes = $('<li />').attr('id', 'aba-sala-id-' + salas[i][j].id + '-' + mesTexto).attr('mesDate', mesDate.toISOString().substring(0, 10));
                $(mes).click({
                    id: salas[i][j].id,
                    objetoData: mesDate
                }, pegaProcessos);
                var anchor = $('<a />').attr('href', '#conteudo-aba-sala-id-' + salas[i][j].id + '-' + mesDate.getMonth() + '-' + mesDate.getFullYear()).text(mesTexto);
                $(mes).append(anchor);
                $(mesesContainerListaMeses).append(mes);
            }
            $(mesesContainer).prepend(mesesContainerListaMeses);
            $(containerPrimario).append(mesesContainer);
        }
    }
    $('[aba="aba"]').tabs({
        collapsible: true,
    });
}

async function pegaProcessos(evt) {
    var id = evt.data.id;
    var objetoData = evt.data.objetoData;
    var isoData = objetoData.toISOString().substring(0, 10);
    var hoje = new Date().toISOString().substring(0, 10);
    var diaInicio = 1;
    if (hoje === isoData) diaInicio = objetoData.getDate();
    var diaFim = new Date(new Date().setFullYear(objetoData.getFullYear(), objetoData.getMonth() + 1, 0));
    diaFim = diaFim.getDate();
    console.log(diaInicio, diaFim, 'mes', objetoData.getMonth());
    var container = $('#conteudo-aba-sala-id-' + id + '-' + objetoData.getMonth() + '-' + objetoData.getFullYear());
    if ($(container).text() === 'pautaVazia') {
        $(container).text('');
        //pauta vazia, constroi a tabela
        var url = pegaUrlParaAbrir('pje-comum-api/api/pautasaudiencias/classificacoes/dia?idSalaAudiencia=' + id + '&data=2022-08-09');
        console.log(url);
        var dados = await fetch(url);
        var auds = await dados.json().then(function (auds) {
            console.log(auds);
            if (auds.pautasDoDia.length > 0) {
                console.log('bora construir a tabela');
                var header = $('<div />').addClass('h6 border-bottom').text(objetoData.toLocaleDateString() + ', ' + objetoData.toLocaleString('pt-BR', { weekday: 'long' }));
                var tabela = $('<table />').addClass('table table-striped table-hover align-middle');
                var tabelaHead = $('<thead />');
                $(tabelaHead).append( $('<th />').html('Tipo') );
                $(tabelaHead).append( $('<th />').html('Modalidade') );
                $(tabelaHead).append( $('<th />').html('Horário') );
                $(tabelaHead).append( $('<th />').html('Autos') );
                $(tabelaHead).append( $('<th />').html('Rito') );
                $(tabelaHead).append( $('<th />').html('Autor') );
                $(tabelaHead).append( $('<th />').html('Advogado(s) Autor') );
                $(tabelaHead).append( $('<th />').html('Réu(s)') );
                $(tabelaHead).append( $('<th />').html('Advogado(s) Réu(s)') );
                $(tabelaHead).append( $('<th />').html('Observações') );
                $(tabelaHead).append( $('<th />').html('Ações') );
                
                var tabelaBody = $('<tbody />');
                for (i=0; i<auds.pautasDoDia.length; i++) {
                    var tabelaLinha = $('<tr />');
                    $(tabelaLinha).append( $('<td />').html(auds.pautasDoDia[i].tipo.descricao.split(" ")[0]) );
                    if (auds.pautasDoDia[i].processo.juizoDigital) $(tabelaLinha).append( $('<td />').html('Vídeo') );
                    else $(tabelaLinha).append( $('<td />').html('Presencial') );
                    $(tabelaLinha).append( $('<td />').html(auds.pautasDoDia[i].pautaAudienciaHorario.horaInicial.substring(0,5)+'-'+auds.pautasDoDia[i].pautaAudienciaHorario.horaFinal.substring(0,5)) );
                    $(tabelaLinha).append( $('<td />').html(auds.pautasDoDia[i].nrProcesso) );
                    $(tabelaLinha).append( $('<td />').html(auds.pautasDoDia[i].processo.classeJudicial.sigla) );
                    var poloAtivo = $('<td />');
                    // for (a=0; a<auds.pautasDoDia[i].poloAtivo.length; a++) {
                    //     var poloAtivoNome = $('<span />').text(auds.pautasDoDia[i].poloAtivo[a].nome);
                    //     $(poloAtivo).append(poloAtivoNome);
                    // }
                    $(poloAtivo).text(auds.pautasDoDia[i].poloAtivo.nome);
                    $(tabelaLinha).append(poloAtivo);
                    $(tabelaLinha).append( $('<td />').html('Ainda não peguei advogados') );
                    var poloPassivo = $('<td />');
                    // for (a=0; a<auds.pautasDoDia[i].poloPassivo.length; a++) {
                    //     var poloPassivoNome = $('<span />').text(auds.pautasDoDia[i].poloPassivo[a].nome);
                    //     $(poloPassivo).append(poloPassivoNome);
                    // }
                    $(poloPassivo).text(auds.pautasDoDia[i].poloPassivo.nome);
                    $(tabelaLinha).append(poloPassivo);
                    $(tabelaLinha).append( $('<td />').html('Ainda não peguei advogados') );
                    $(tabelaLinha).append( $('<td />').text('Obs') );
                    $(tabelaLinha).append( $('<td />').text('Act') );
                    $(tabelaBody).append(tabelaLinha);
                }
                console.log(tabelaBody);
                $(tabela).append(tabelaHead);
                $(tabela).append(tabelaBody);
                
                $(container).append(header);
                $(container).append(tabela);
            } else
                $(container).text('Não há pautas programadas para este dia.');
        });
    }
    //senão, nem faz nada





    // console.log('pegaProcessos do mês ', id, dataCompleta);
    // var diaInicio = 1;
    // if (mes === new Date().getMonth()) diaInicio = new Date().getDate();

    // var ultimoDiaMes = new Date(new Date().setFullYear(ano, mes + 1, 0));
    // ultimoDiaMes = ultimoDiaMes.getDate();

    // console.log('hoje ', diaInicio, 'ultimo dia deste mes', ultimoDiaMes);
    /*

    <div id="data" class="container-fluid">
                        <div class="h6 border-bottom">04/08/2022 - quinta feira</div>
                        <table class="table table-striped table-hover align-middle">
                            <thead>
                                <th>Tipo</th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                    
    */
}

async function pegaProcessosbckp() {
    var dataAtual = new Date().toISOString().substring(0, 10);
    // var urlParaAbrir = pegaUrlParaAbrir("audapi/rest/pje/audpje/pautas?dataInicio=2022-08-11&dataFim=2022-08-11&orgaoJulgador=49");
    var urlParaAbrir = pegaUrlParaAbrir("audapi/rest/pje/audpje/pautas?dataInicio=" + dataAtual + "&dataFim=" + dataAtual + "&orgaoJulgador=49");
    // var urlParaAbrir = "https://pje.trt9.jus.br/audapi/rest/pje/audpje/pautas?dataInicio=2022-08-04&dataFim=2022-08-04&orgaoJulgador=49"
    let resposta = await fetch(urlParaAbrir);
    let auds = await resposta.json();
    var processos = [];
    for (i = 0; i < auds.length; i++) {
        var processo = await obterDadosProcessoViaApi(auds[i].idProcesso);
        processos.push(processo);
    }
    await preencheTabela(auds, processos);
}

async function obterDadosProcessoViaApi(idProcesso) {
    let url = pegaUrlParaAbrir("pje-comum-api/api/processos/id/" + idProcesso);
    let resposta = await fetch(url);
    let dados = await resposta.json();
    return dados;
}

function preencheTabela(auds, processos) {
    for (i = 0; i < auds.length; i++) {
        var tableRow = $('<tr />');
        // if (auds[i].tipoAudiencia.includes('videoconferência')) $(tableRow).addClass('text-primary');//buscar no processo é mais seguro
        // if (auds[i].tipoAudiencia.includes('videoconferência')) $(tableRow).addClass('table-primary');//buscar no processo é mais seguro
        if (processos[i].juizoDigital) $(tableRow).addClass('table-success');
        var tableDataTipo = $('<td />').html(auds[i].tipoAudiencia.split(" ")[0]);
        var tableDataModalidade = $('<td />');
        if (processos[i].juizoDigital) $(tableDataModalidade).html("Vídeo");//buscar no processo é mais seguro
        else $(tableDataModalidade).html("Presencial");//buscar no processo é mais seguro
        var tableDataHorario = $('<td />').html(auds[i].dataAudiencia.substr(11, 5));
        var tableDataAutos = $('<td />').html(auds[i].numeroProcesso).click({ idProcesso: auds[i].idProcesso }, abreProcesso).attr('title', 'Abrir detalhes do processo').css('cursor', 'pointer');
        var tableDataRito = $('<td />').html(auds[i].siglaClasseJudicial);
        var tableDataAutor = $('<td />').html("buscar o processo");
        var tableDataAdvAutor = $('<td />').html("buscar o processo");
        var tableDataReu = $('<td />').html("buscar o processo");
        var tableDataAdvReu = $('<td />').html("buscar o processo");
        var tableDataObs = $('<td />').html("--");

        var tableDataAcoes = $('<td />');
        var tableActionsContainer = $('<div />').addClass('row');
        var tableActionRedesignar = $('<div />').addClass('col');
        var tableActionRedesignarIcon = $('<span />').attr('title', 'Redesignar').addClass('text-warning').append(iconeEditarTemplate);
        var tableActionCancelar = $('<div />').addClass('col');
        var tableActionCancelarIcon = $('<span />').attr('title', 'Cancelar').append(iconeCancelarTemplate);
        $(tableActionRedesignar).append(tableActionRedesignarIcon);
        $(tableActionCancelar).append(tableActionCancelarIcon);
        $(tableActionsContainer).append(tableActionRedesignar);
        $(tableActionsContainer).append(tableActionCancelar);
        $(tableDataAcoes).append(tableActionsContainer);

        var tableDataAdvReu = $('<td />').html("buscar o processo");
        $(tableRow).append(tableDataTipo);
        $(tableRow).append(tableDataModalidade);
        $(tableRow).append(tableDataHorario);
        $(tableRow).append(tableDataAutos);
        $(tableRow).append(tableDataRito);
        $(tableRow).append(tableDataAutor);
        $(tableRow).append(tableDataAdvAutor);
        $(tableRow).append(tableDataReu);
        $(tableRow).append(tableDataAdvReu);
        $(tableRow).append(tableDataObs);
        $(tableRow).append(tableDataAcoes);
        $('#data > table:nth-child(2) > tbody').append(tableRow);
    }
    for (i = 0; i < auds.length; i++) {
        var tableRow = $('<tr />');
        // if (auds[i].tipoAudiencia.includes('videoconferência')) $(tableRow).addClass('text-primary');//buscar no processo é mais seguro
        // if (auds[i].tipoAudiencia.includes('videoconferência')) $(tableRow).addClass('table-primary');//buscar no processo é mais seguro
        if (processos[i].juizoDigital) $(tableRow).addClass('table-success');
        var tableDataTipo = $('<td />').html(auds[i].tipoAudiencia.split(" ")[0]);
        var tableDataModalidade = $('<td />');
        if (processos[i].juizoDigital) $(tableDataModalidade).html("Vídeo");//buscar no processo é mais seguro
        else $(tableDataModalidade).html("Presencial");//buscar no processo é mais seguro
        var tableDataHorario = $('<td />').html(auds[i].dataAudiencia.substr(11, 5));
        var tableDataAutos = $('<td />').html(auds[i].numeroProcesso).click({ idProcesso: auds[i].idProcesso }, abreProcesso).attr('title', 'Abrir detalhes do processo').css('cursor', 'pointer');
        var tableDataRito = $('<td />').html(auds[i].siglaClasseJudicial);
        var tableDataAutor = $('<td />').html("buscar o processo");
        var tableDataAdvAutor = $('<td />').html("buscar o processo");
        var tableDataReu = $('<td />').html("buscar o processo");
        var tableDataAdvReu = $('<td />').html("buscar o processo");
        var tableDataObs = $('<td />').html("--");

        var tableDataAcoes = $('<td />');
        var tableActionsContainer = $('<div />').addClass('row');
        var tableActionRedesignar = $('<div />').addClass('col');
        var tableActionRedesignarIcon = $('<span />').attr('title', 'Redesignar').addClass('text-warning').append(iconeEditarTemplate);
        var tableActionCancelar = $('<div />').addClass('col');
        var tableActionCancelarIcon = $('<span />').attr('title', 'Cancelar').append(iconeCancelarTemplate);
        $(tableActionRedesignar).append(tableActionRedesignarIcon);
        $(tableActionCancelar).append(tableActionCancelarIcon);
        $(tableActionsContainer).append(tableActionRedesignar);
        $(tableActionsContainer).append(tableActionCancelar);
        $(tableDataAcoes).append(tableActionsContainer);

        var tableDataAdvReu = $('<td />').html("buscar o processo");
        $(tableRow).append(tableDataTipo);
        $(tableRow).append(tableDataModalidade);
        $(tableRow).append(tableDataHorario);
        $(tableRow).append(tableDataAutos);
        $(tableRow).append(tableDataRito);
        $(tableRow).append(tableDataAutor);
        $(tableRow).append(tableDataAdvAutor);
        $(tableRow).append(tableDataReu);
        $(tableRow).append(tableDataAdvReu);
        $(tableRow).append(tableDataObs);
        $(tableRow).append(tableDataAcoes);
        $('#data2 > table:nth-child(2) > tbody').append(tableRow);
    }
}
//https://pje.trt9.jus.br/audapi/rest/pje/audpje/pautas?dataInicio=2022-08-03&dataFim=2022-08-31&orgaoJulgador=49

function abreProcesso(evt) {
    var id = evt.data.idProcesso;
    window.open("https://pje.trt9.jus.br/pjekz/processo/" + id + "/detalhe", "_blank");
}

function redesignaAudiencia(evt) {

}