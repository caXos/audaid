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
https://pje.trt9.jus.br/pje-comum-api/api/processos/id/1254700/partes

pega dados do processo
https://pje.trt9.jus.br/pje-comum-api/api/processos/id/IDDOPROCESSO

pega todas as auds designadas de um determinado período -> precisa estar logado no Aud4
https://pje.trt9.jus.br/audapi/rest/pje/audpje/pautas?dataInicio=2022-08-04&dataFim=2022-08-04&orgaoJulgador=49

pega as auds do dia, separado por sala, incluindo vagas cadastradas no PJe e também dados das partes
https://pje.trt9.jus.br/pje-comum-api/api/pautasaudiencias/classificacoes/dia?idSalaAudiencia=162&data=2022-08-09

pega os perfis do usuário
https://pje.trt9.jus.br/pje-seguranca/api/token/perfis

pega assuntos dos processos
https://pje.trt9.jus.br/pje-comum-api/api/processos/id/1325099/assuntos


estudar sobre laço "for await ... of"





$('#pauta-modal-titulo').dialog({
        autoOpen: false,
        show: {
            effect: "fadeIn",
            duration: 250
        },
        hide: 250,
        resizable: false,
        height: "auto",
        width: "auto",
        modal: true,
    });



*/
var iconeEditarTemplate = `<svg title="Redesignar" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
</svg>`;
var iconeCancelarTemplate = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`;

let cookieDoPje = null;

let tribunal = 0;

$(document).ready(async function () {
    $('#botao').click(limpa);
    $('#pauta-modal-titulo').dialog({
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
    });
    // $(document).tooltip();
    await encontraTribunal().then(() => {
        constroiAbas();
    });
});

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
// function pegaUrlParaAbrir(suffix) {
//     if (suffix === null || suffix === undefined) suffix = '';
//     var urlAtual = window.location.href.toString();
//     var urlParaAbrir = '';
//     if (urlAtual.includes("homologacao")) urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/' + suffix;
//     else if (urlAtual.includes("treinamento")) urlParaAbrir = 'https://pje-treinamento.trt9.jus.br/' + suffix;
//     else urlParaAbrir = 'https://pje.trt9.jus.br/' + suffix;
//     return urlParaAbrir;
// }

function pegaUrlParaAbrir(suffix) {
    if (suffix === null || suffix === undefined) suffix = '';
    var urlParaAbrir = '';
    urlParaAbrir = 'https://pje.trt'+tribunal+'.jus.br/' + suffix;
    // console.log(urlParaAbrir)
    return urlParaAbrir;
}

function limpa() {
   location.reload()
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
    var containerPrimario = $('#abas-salas');

    for (i = 0; i < salas.length; i++) {
        for (j = 0; j < salas[i].length; j++) {
            var mesesContainer = $('<div />').attr('id', 'aba-sala-id-' + salas[i][j].id + '-abas-meses').attr('aba', 'aba');
            // var mesesContainerListaMeses = $('<ul />').attr('id', 'aba-sala-id-' + salas[i][j].id + '-lista-meses');
            var mesesContainerListaMeses = $('<ul />').attr('id', 'aba-sala-id-' + salas[i][j].id + '-lista-meses').addClass('sticky-tab');
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
        active: false
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
    var containerTexto = '#conteudo-aba-sala-id-' + id + '-' + objetoData.getMonth() + '-' + objetoData.getFullYear();
    var container = $(containerTexto);

    let diasUteis = await fetch(pegaUrlParaAbrir('pje-comum-api/api/pautasaudiencias/classificacoes?idSala='+id+'&ano='+objetoData.getFullYear()+'&mes='+(objetoData.getMonth()+1)))
    diasUteis = await diasUteis.json()

    if ($(container).text() === 'pautaVazia') {
        $(container).text('');
        //pauta vazia, constroi a tabela
        for (d = diaInicio; d <= diaFim; d++) {
            // var novaData = new Date(objetoData.getFullYear(), objetoData.getMonth(), new Date().setDate(d));
            var novaData = objetoData;
            novaData.setDate(d);
            var dataIso = novaData;
            novaData = novaData.toISOString().substring(0, 10);
            var url = pegaUrlParaAbrir('pje-comum-api/api/pautasaudiencias/classificacoes/dia?idSalaAudiencia=' + id + '&data=' + novaData);
            var dados = await fetch(url);
            var auds = await dados.json().then(async function (auds) {
                var advs = [];
                if (auds.pautasDoDia != undefined) {
                    advs.push(await pegaAdvogados(auds));
                }
                
                var resultadoConsolidado = {
                    auds: auds,
                    advs: advs,
                    dataIso: dataIso,
                    diaUtil: diasUteis[objetoData.getDate()-1]
                };
                return resultadoConsolidado;
            }).then(async function (resultadoConsolidado) {
                await constroiTabela(resultadoConsolidado, id, containerTexto);
            });
        }
        //tira o overlay
    }
    //senão, nem faz nada
}

async function pegaAdvogados(auds) {
    var advs = [];
    for (i = 0; i < auds.pautasDoDia.length; i++) {
        //verifica se tem pauta programada no PJe (daí não vai ter idProcesso)
        if (auds.pautasDoDia[i].idProcesso !== null && auds.pautasDoDia[i].idProcesso !== undefined && auds.pautasDoDia[i].idProcesso !== '') {
            var url = pegaUrlParaAbrir('pje-comum-api/api/processos/id/' + auds.pautasDoDia[i].idProcesso + '/partes');
            var resposta = await fetch(url, {
                credentials: 'include'
            });
            var processo = await resposta.json().then(async function (processo) {
                var advogados = {
                    id: auds.pautasDoDia[i].idProcesso,
                    autor: processo.ATIVO[0].representantes,
                    reu: processo.PASSIVO[0].representantes
                };
                advs.push(advogados);
            });
        } else {
            var advogados = {
                id: 0,
                autor: 0,
                reu: 0
            };
            advs.push(advogados);
        }
    }
    return advs;
    //await constroiTabela(auds, advs, id, containerTexto);
}

async function constroiTabela(resultadoConsolidado, id, containerTexto) {
    console.log(resultadoConsolidado);
    var container = $(containerTexto);
    let diaPorExtenso = resultadoConsolidado.dataIso.toLocaleDateString() + ', ' + resultadoConsolidado.dataIso.toLocaleString('pt-BR', { weekday: 'long' })
    var header = $('<div />').addClass('h6 border-bottom');
    if ((diaPorExtenso.split(", ")[1] === "sábado") || (diaPorExtenso.split(", ")[1] === "domingo")) $(header).addClass('bg-warning')
    if ( resultadoConsolidado.diaUtil.tipo === "F" ) {
        diaPorExtenso += " - Dia não útil (feriado, recesso). Caso haja audiências, será necessário redesignar"
        // $(header).addClass('bg-danger')
        $(header).addClass('diaNaoUtil')
    }
    $(header).text(diaPorExtenso);

    if (resultadoConsolidado.auds.pautasDoDia !== null && resultadoConsolidado.auds.pautasDoDia !== undefined && resultadoConsolidado.auds.pautasDoDia !== '') {
        var tabela = $('<table />').addClass('table table-light table-striped table-hover align-middle');
        var tabelaHead = $('<thead />');
        $(tabelaHead).append($('<th />').html('Tipo'));
        $(tabelaHead).append($('<th />').html('Modalidade'));
        $(tabelaHead).append($('<th />').html('Horário'));
        $(tabelaHead).append($('<th />').html('Autos'));
        $(tabelaHead).append($('<th />').html('Rito'));
        $(tabelaHead).append($('<th />').html('Autor'));
        $(tabelaHead).append($('<th />').html('Advogado(s) Autor'));
        $(tabelaHead).append($('<th />').html('Réu(s)'));
        $(tabelaHead).append($('<th />').html('Advogado(s) Réu(s)'));
        $(tabelaHead).append($('<th />').html('GIGS'));
        $(tabelaHead).append($('<th />').html('Ações'));
        $(tabela).append(tabelaHead);

        var tabelaBody = $('<tbody />');
        
        let totalAudienciasDoDiaVagas = resultadoConsolidado.auds.pautasDoDia.length
        let totalAudienciasDoDia = 0
        let qtdeIniciais = 0
        let qtdeIniciaisVagas = 0
        let qtdeConciliacoes = 0
        let qtdeConciliacoesVagas = 0
        let qtdeInstrucoes = 0
        let qtdeInstrucoesVagas = 0
        let qtdeEncerramentos = 0
        let qtdeEncerramentosVagos = 0
        let qtdeJulgamentos = 0
        let qtdeJulgamentosVagos = 0
        let titulo = ''
        let tipoAud = ''
        // console.log('zerésima: ', totalAudienciasDoDia, totalAudienciasDoDiaVagas, qtdeIniciais, qtdeIniciaisVagas, qtdeConciliacoes, qtdeConciliacoesVagas, qtdeInstrucoes, qtdeInstrucoesVagas, qtdeEncerramentos, qtdeEncerramentosVagos, qtdeJulgamentos, qtdeJulgamentosVagos)
        for (a = 0; a < resultadoConsolidado.auds.pautasDoDia.length; a++) {
            var tabelaLinha = $('<tr />');
            tipoAud = resultadoConsolidado.auds.pautasDoDia[a].tipo.descricao.split(" ")[0]
            //Verifica se a linha tem uma audiência ou uma vaga
            if (resultadoConsolidado.auds.pautasDoDia[a].idProcesso !== null && resultadoConsolidado.auds.pautasDoDia[a].idProcesso !== undefined && resultadoConsolidado.auds.pautasDoDia[a].idProcesso !== '') {
                //Constrói linha com audiência
                $(tabelaLinha).append($('<td />').html(tipoAud));
                if (tipoAud === "Inicial") {
                    qtdeIniciais++
                    qtdeIniciaisVagas++
                    // console.log('Achei uma inicial', qtdeIniciais, qtdeIniciaisVagas)
                }
                if (tipoAud === "Conciliação") {
                    qtdeConciliacoes++
                    qtdeConciliacoesVagas++
                    // console.log('Achei uma conciliação', qtdeConciliacoes, qtdeConciliacoesVagas)
                }
                if (tipoAud === "Instrução") {
                    qtdeInstrucoes++
                    qtdeInstrucoesVagas++
                    // console.log('Achei uma instrução', qtdeInstrucoes, qtdeInstrucoesVagas)
                }
                if (tipoAud === "Encerramento") {
                    qtdeEncerramentos++
                    qtdeEncerramentosVagos++
                    // console.log('Achei um encerramento', qtdeEncerramentos, qtdeEncerramentosVagos)
                }
                if (tipoAud === "Julgamento") {
                    qtdeJulgamentos++
                    qtdeJulgamentosVagos++
                    // console.log('Achei um julgamento', qtdeJulgamentos, qtdeJulgamentosVagos)
                }
                if (resultadoConsolidado.auds.pautasDoDia[a].processo.juizoDigital) {
                    $(tabelaLinha).append($('<td />').html('Vídeo'));
                    $(tabelaLinha).addClass('table-success');
                }
                else $(tabelaLinha).append($('<td />').html('Presencial'));
                // $(tabelaLinha).append($('<td />').html(resultadoConsolidado.auds.pautasDoDia[a].pautaAudienciaHorario.horaInicial.substring(0, 5) + ' a ' + resultadoConsolidado.auds.pautasDoDia[a].pautaAudienciaHorario.horaFinal.substring(0, 5)));
                $(tabelaLinha).append($('<td />').html(resultadoConsolidado.auds.pautasDoDia[a].pautaAudienciaHorario.horaInicial.substring(0, 5)));
                $(tabelaLinha).append($('<td />').attr('title', 'Abrir processo').addClass('pointer').click({ idProcesso: resultadoConsolidado.auds.pautasDoDia[a].idProcesso }, abreProcesso).html(resultadoConsolidado.auds.pautasDoDia[a].nrProcesso));
                $(tabelaLinha).append($('<td />').html(resultadoConsolidado.auds.pautasDoDia[a].processo.classeJudicial.sigla));
                var poloAtivo = $('<td />');
                // for (a=0; a<auds.pautasDoDia[i].poloAtivo.length; a++) {
                //     var poloAtivoNome = $('<span />').text(auds.pautasDoDia[i].poloAtivo[a].nome);
                //     $(poloAtivo).append(poloAtivoNome);
                // }
                $(poloAtivo).text(resultadoConsolidado.auds.pautasDoDia[a].poloAtivo.nome);
                $(tabelaLinha).append(poloAtivo);
                if (resultadoConsolidado.advs[0][a].autor !== null && resultadoConsolidado.advs[0][a].autor !== undefined && resultadoConsolidado.advs[0][a].autor !== '')
                    $(tabelaLinha).append($('<td />').html(resultadoConsolidado.advs[0][a].autor[0].nome));
                else
                    // $(tabelaLinha).append($('<td />').html('Sem advogado(a)(s)'));
                    $(tabelaLinha).append($('<td />').html(''));
                var poloPassivo = $('<td />');
                //             // for (a=0; a<auds.pautasDoDia[i].poloPassivo.length; a++) {
                //             //     var poloPassivoNome = $('<span />').text(auds.pautasDoDia[i].poloPassivo[a].nome);
                //             //     $(poloPassivo).append(poloPassivoNome);
                //             // }
                $(poloPassivo).text(resultadoConsolidado.auds.pautasDoDia[a].poloPassivo.nome);
                $(tabelaLinha).append(poloPassivo);
                if (resultadoConsolidado.advs[0][a].reu !== null && resultadoConsolidado.advs[0][a].reu !== undefined && resultadoConsolidado.advs[0][a].reu !== '')
                    $(tabelaLinha).append($('<td />').html(resultadoConsolidado.advs[0][a].reu[0].nome));
                else
                    // $(tabelaLinha).append($('<td />').html('Sem advogado(a)(s)'));
                    $(tabelaLinha).append($('<td />').html(''));
                // $(tabelaLinha).append($('<td />').text('Obs'));
                var iconeObservacao = $('<i />').addClass('bi bi-card-text mx-1').attr('title', 'Abrir GIGS').attr('role', 'button').click(abreAviso);
                $(tabelaLinha).append($('<td />').append(iconeObservacao));
                // $(tabelaLinha).append($('<td />').text('Act'));
                var iconeAdiarAud = $('<i />').addClass('bi bi-arrow-bar-right mx-1').attr('title', 'Adiar audiência').attr('role', 'button').click(abreAviso);
                var iconeDesmarcarAud = $('<i />').addClass('bi bi-x-circle mx-1').attr('title', 'Desmarcar audiência').attr('role', 'button').click({ aud: resultadoConsolidado.auds.pautasDoDia[a] }, abreAvisoCancelarAud);
                $(tabelaLinha).append($('<td />').append(iconeAdiarAud).append(iconeDesmarcarAud));
                $(tabelaBody).append(tabelaLinha);
                totalAudienciasDoDia++
            } else {
                //constrói linha com vaga
                $(tabelaLinha).append($('<td />').html(tipoAud));
                if (tipoAud === "Inicial") {
                    qtdeIniciaisVagas++
                    // console.log('Achei uma Inicial vaga', qtdeIniciais, qtdeIniciaisVagas)
                }
                if (tipoAud === "Conciliação") {
                    qtdeConciliacoesVagas++
                    // console.log('Achei uma Conciliação vaga', qtdeConciliacoes, qtdeConciliacoesVagas)
                }
                if (tipoAud === "Instrução") {
                    qtdeInstrucoesVagas++
                    // console.log('Achei uma instrução vaga', qtdeInstrucoes, qtdeInstrucoesVagas)
                }
                if (tipoAud === "Encerramento") {
                    qtdeEncerramentosVagos++
                    // console.log('Achei um encerramento vago', qtdeEncerramentos, qtdeEncerramentosVagos)
                }
                if (tipoAud === "Julgamento") {
                    qtdeJulgamentosVagos++
                    // console.log('Achei um julgamento vago', qtdeJulgamentos, qtdeJulgamentosVagos)
                }
                $(tabelaLinha).append($('<td />').html('V/P'));
                $(tabelaLinha).append($('<td />').html(resultadoConsolidado.auds.pautasDoDia[a].pautaAudienciaHorario.horaInicial.substring(0, 5)));
                $(tabelaLinha).append($('<td />').attr('colspan', '6').html('vaga'));
                // $(tabelaLinha).append($('<td />').text('Obs'));
                var iconeObservacao = $('<i />').addClass('bi bi-card-text mx-1').attr('title', 'Adicionar observação').attr('role', 'button').click(abreAviso);
                $(tabelaLinha).append($('<td />').append(iconeObservacao));
                // $(tabelaLinha).append($('<td />').text('Act'));
                var iconeAdicionarAud = $('<i />').addClass('bi bi-plus-circle mx-1').attr('title', 'Designar audiência').attr('role', 'button').click(preparaParaDesignarAudiencia);
                $(tabelaLinha).append($('<td />').append(iconeAdicionarAud));
                $(tabelaBody).append(tabelaLinha);
            }
        }
        // console.log('resultado: ', totalAudienciasDoDia, totalAudienciasDoDiaVagas, qtdeIniciais, qtdeIniciaisVagas, qtdeConciliacoes, qtdeConciliacoesVagas, qtdeInstrucoes, qtdeInstrucoesVagas, qtdeEncerramentos, qtdeEncerramentosVagos, qtdeJulgamentos, qtdeJulgamentosVagos)
        titulo = `Total: ${totalAudienciasDoDia}/${totalAudienciasDoDiaVagas}\n`
        if (qtdeIniciaisVagas > 0) titulo += `Iniciais: ${qtdeIniciais}/${qtdeIniciaisVagas}\n`
        if (qtdeConciliacoesVagas > 0) titulo += `Conciliações: ${qtdeConciliacoes}/${qtdeConciliacoesVagas}\n`
        if (qtdeInstrucoesVagas > 0) titulo += `Instruções: ${qtdeInstrucoes}/${qtdeInstrucoesVagas}\n`
        if (qtdeEncerramentosVagos > 0) { titulo += `Encerramentos: ${qtdeEncerramentos}/${qtdeEncerramentosVagos}\n`; /*console.log('eizem2')*/ }
        if (qtdeJulgamentosVagos > 0) {
            titulo += `Julgamentos: ${qtdeJulgamentos}/${qtdeJulgamentosVagos}\n`
            // console.log('eizem')
        }
        var iconeEstatistica = $('<i />').addClass('bi bi-bar-chart ms-1').attr('title', titulo)//.tooltip();

        //Se tiver audiências no dia, constrói o ícone das estatísticas
        for (a = 0; a < resultadoConsolidado.auds.pautasDoDia.length; a++) {
            if (tipoAud === "Inicial") qtdeIniciais++
            if (tipoAud === "Conciliação") qtdeConciliacoes++
            if (tipoAud === "Instrução") qtdeInstrucoes++
            if (tipoAud === "Encerramento") qtdeEncerramentos++
            if (tipoAud === "Julgamento") qtdeJulgamentos++
            
        }
        $(header).append(iconeEstatistica)
        $(tabela).append(tabelaBody);
    } else {
        //$(header).append($('<span />').text(' - Não há pautas programadas para este dia.'));
    }
    $(container).append(header);
    $(container).append(tabela);
}

function abreAviso(titulo, mensagem) {
    $('#pauta-modal-content').html('Função ainda não implementada!');
    $('#pauta-modal-titulo').dialog({
        title: 'Aviso',
        buttons: {
            'Ok': function () {
                $(this).dialog('close');
            },
        },
    }).dialog('open');
    /*
    $('#aud-aid-alert-container').dialog({
        title: titulo,
        buttons: {
            'Atualizar': function () {
                location.reload();
            },
            'Não agora': function () {
                $(this).dialog('close');
            },
        },
    }).dialog('open');
    */
}

function abreAvisoCancelarAud(evt) {
    var aud = evt.data.aud;
    $('#pauta-modal-content').html('Tem certeza que deseja cancelar a audiência do processo ' + aud.nrProcesso + '?');
    $('#pauta-modal-titulo').dialog({
        title: 'Cancelar audiência',
        buttons: {
            'Sim, cancelar': function () {
                // cancelaAudiencia(aud.pautaAudienciaHorario.id);
                prepareCancelPayload(aud);
            },
            'Não, manter': function () {
                $(this).dialog('close');
            },
        },
    }).dialog('open');
}

//https://pje.trt9.jus.br/audapi/rest/pje/audpje/pautas?dataInicio=2022-08-03&dataFim=2022-08-31&orgaoJulgador=49

function abreProcesso(evt) {
    var id = evt.data.idProcesso;
    var url = pegaUrlParaAbrir('pjekz/processo/' + id + '/detalhe');
    // window.open("https://pje.trt9.jus.br/pjekz/processo/" + id + "/detalhe", "_blank");
    window.open(url, "_blank");
}

function preparaParaDesignarAudiencia() {
    let payloadJson = {
        "considerarIntersticio": true,
        "buscarProximoHorarioVago": false,
        "validarHorario": true,
        "idTipoAudiencia": 3,
        "data": "2022-10-14T03:00:00.000Z",
        "horarioInicial": '14:00:00',
        "horarioFinal": '14:01:00',
        "idProcesso": 1280296,
        "idSalaFisica": 162
    };
    browser.tabs
    // .query({url: "*://pje.trt9.jus.br/pjekz/*"})
    .query({url: "*://pje.trt"+tribunal+".jus.br/pjekz/*"})
    .then(function (abaDoPje) {
        browser.tabs
        .executeScript(abaDoPje[0].id,{code:scriptLogaCookie})
        .then(function (respostaDaAbaDoPje){
            sendBookHearingPostRequest(payloadJson, respostaDaAbaDoPje);
        }, onError);
    }, onError);
}

async function sendBookHearingPostRequest(payload, respostaDaAbaDoPje) {
    // console.log("payload", payload);
    // console.log("cookie", respostaDaAbaDoPje);

    var myHeaders = new Headers({
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
        'Connection': 'keep-alive',
        'Content-Length': new TextEncoder().encode(JSON.stringify(payload)).length,
        'Content-type': 'application/json',
        'Cookie': respostaDaAbaDoPje[0],
        'Host': 'pje.trt'+tribunal+'.jus.br',
        'Origin': 'https://pje.trt'+tribunal+'.jus.br',
        'Referer': 'https://pje.trt'+tribunal+'.jus.br/pjekz/pauta-audiencias',
        'TE': 'Trailers',
        'User-Agent': window.navigator.userAgent,
        'X-XSRF-TOKEN': respostaDaAbaDoPje[0].substr(respostaDaAbaDoPje[0].toString().search('Xsrf-Token='), 111).split('=')[1]
    });

    var myInit = { method: 'POST',
                   headers: myHeaders,
                   mode: 'cors',
                   cache: 'default',
                   body: payload
                };
    
    fetch('https://pje.trt'+tribunal+'.jus.br/pje-comum-api/api/pautasaudiencias/audiencias',myInit)
    .then(function(response) {
        // console.log(response);
    });
    
}

function redesignaAudiencia(evt) {

}

async function prepareCancelPayload(aud) {
    var payloadJson = [aud.pautaAudienciaHorario.id];
    // console.log("PayloadJSON:",payloadJson);
    browser.tabs

    // .query({url: "*://pje.trt9.jus.br/pjekz/*"})
    .query({url: "*://pje.trt"+tribunal+".jus.br/pjekz/*"})
    .then(function (abaDoPje) {
        browser.tabs
        .executeScript(abaDoPje[0].id,{code:scriptLogaCookie})
        .then(function (respostaDaAbaDoPje){
            // console.log("payload", payloadJson);
            // console.log("cookie", respostaDaAbaDoPje);
            sendCancelHearingPatchRequest(payloadJson, respostaDaAbaDoPje);
        }, onError);
    }, onError);
}

browser.webRequest.onBeforeSendHeaders.addListener(
    sendCancelHearingPatchRequest,
    { urls: [browser.runtime.getURL('pauta/pauta.html')] },
    ["blocking", "requestHeaders"]
);

async function sendCancelHearingPatchRequest(payload, respostaDaAbaDoPje) {
    let urlParaAbrir = 'https://pje.trt'+tribunal+'.jus.br/pje-comum-api/api/pautasaudiencias/audiencias/cancelamento'
    let novoxhr = new XMLHttpRequest();
    novoxhr.open('PATCH', urlParaAbrir);
    novoxhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    novoxhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
    novoxhr.setRequestHeader('Accept-Language', 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3');
    novoxhr.setRequestHeader('Connection', 'keep-alive');
    novoxhr.setRequestHeader('Content-Length', new TextEncoder().encode(payload.length));
    novoxhr.setRequestHeader('Content-type', 'application/json');
    novoxhr.setRequestHeader('Cookie', respostaDaAbaDoPje[0]);
    novoxhr.setRequestHeader('Host', 'pje-homologacao.trt9.jus.br');
    novoxhr.setRequestHeader('Origin', 'https://pje.trt'+tribunal+'.jus.br');
    novoxhr.setRequestHeader('Referer', 'https://pje.trt'+tribunal+'.jus.br/pjekz/pauta-audiencias');
    novoxhr.setRequestHeader('TE', 'Trailers');
    novoxhr.setRequestHeader('User-Agent', window.navigator.userAgent);
    novoxhr.setRequestHeader('X-XSRF-TOKEN', respostaDaAbaDoPje[0].substr(respostaDaAbaDoPje[0].toString().search('Xsrf-Token='), 111).split('=')[1]);
    novoxhr.onload = () => {
        // console.log(JSON.parse(novoxhr.responseText));
        responseJson = JSON.parse(novoxhr.responseText);
        if (responseJson != null) {
            alert('Audiência cancelada. Recarregue a pauta para ver a mudança.');
            // abreAviso('Sucesso', 'Audiência cancelada. Recarregue a pauta para ver a mudança.')
        } else {
            alert(responseJson.mensagem);
        }
    }
    novoxhr.send(JSON.stringify(payload));
    // if (debugLevel >= 3) console.log("AudAid - XHR de Cancel", novoxhr, new Date());


    // var urlParaAbrir = '';
    // var urlHost = '';
    // var urlOrigin = '';
    // var urlReferer = '';
    // var responseJson = '';

    // //------------------------------------- retirar na versão produção
    // var urlAtual = 'homologacao';
    // var idProcesso = 727829;
    // urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias/cancelamento';
    // //------------------------------------- retirar na versão produção

    // // if (urlAtual.includes("homologacao")) {
    // //     urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias/cancelamento';
    // //     urlHost = 'pje-homologacao.trt9.jus.br';
    // //     urlOrigin = 'https://pje-homologacao.trt9.jus.br';
    // //     urlReferer = 'https://pje-homologacao.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    // // }
    // // else if (urlAtual.includes("treinamento")) {
    // //     urlParaAbrir = 'https://pje-treinamento.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias/cancelamento';
    // //     urlHost = 'pje-treinamento.trt9.jus.br';
    // //     urlOrigin = 'https://pje-treinamento.trt9.jus.br';
    // //     urlReferer = 'https://pje-treinamento.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    // // }
    // // else {
    // //     urlParaAbrir = 'https://pje.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias/cancelamento';
    // //     urlHost = 'pje.trt9.jus.br';
    // //     urlOrigin = 'https://pje.trt9.jus.br';
    // //     urlReferer = 'https://pje.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    // // }
    // //Faz requisiçao PATCH para cancelar a audiência que já estava designada
    // let novoxhr = new XMLHttpRequest();
    // novoxhr.open('PATCH', urlParaAbrir);
    // // novoxhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    // // novoxhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
    // // novoxhr.setRequestHeader('Accept-Language', 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3');
    // // novoxhr.setRequestHeader('Connection', 'keep-alive');
    // // novoxhr.setRequestHeader('Content-Length', new TextEncoder().encode(payload.length));
    // // novoxhr.setRequestHeader('Content-type', 'application/json');
    // // novoxhr.setRequestHeader('Cookie', document.cookie);
    // // novoxhr.setRequestHeader('Host', urlHost);
    // // novoxhr.setRequestHeader('Origin', urlOrigin);
    // // novoxhr.setRequestHeader('Referer', urlReferer);
    // // novoxhr.setRequestHeader('TE', 'Trailers');
    // // novoxhr.setRequestHeader('User-Agent', window.navigator.userAgent);
    // // novoxhr.setRequestHeader('X-XSRF-TOKEN', document.cookie.substr(document.cookie.search('Xsrf-Token='), 111).split('=')[1]);
    // novoxhr.onload = () => {
    //     console.log(JSON.parse(novoxhr.responseText));
    //     responseJson = JSON.parse(novoxhr.responseText);
    //     if (responseJson != null) {
    //         abreAviso('Sucesso', 'Audiência cancelada. Recarregue a pauta para ver a mudança.')
    //     } else {
    //         alert(responseJson.mensagem);
    //     }
    // }
    // novoxhr.send(JSON.stringify(payload));
    // // if (debugLevel >= 3) console.log("AudAid - XHR de Cancel", novoxhr, new Date());
}

// browser.webRequest.onBeforeSendHeaders.addListener(
//     sendCancelHearingPatchRequest,
//     { urls: [browser.runtime.getURL('pauta/pauta.html')] },
//     ["blocking", "requestHeaders"]
// );


const scriptLogaCookie = `function logaCookie() { return document.cookie; } logaCookie();`;

// function achaAbaDoPje() {
//     browser.tabs
//     .query({url: "*://pje.trt9.jus.br/pjekz/*"})
//     .then(executaScript, onError);
// }

// function executaScript(abaDoPje) {
//     browser.tabs
//     .executeScript(abaDoPje[0].id,{code:scriptLogaCookie})
//     .then(pegaCookie, onError);
// }

// function pegaCookie(respostaDaAbaDoPje) {
//     cookieDoPje = respostaDaAbaDoPje[0];
//     console.log(cookieDoPje);
// }

function onError(error) {
    console.error(`Error: ${error}`);
}
