var urlAtual = window.location.href.toString();
var idProcesso = urlAtual.split("/")[5];
var processo = null;
var tiposDeAudiencia = null;
var salas = null;
var idSalaFisica = null;
var debugLevel = null;
var audAidAgreement = null;

/*
Funções de utilidade geral
*/
async function audAidStart() {
    let getDebugLevel = browser.storage.local.get('audAidDebugLevel');
    getDebugLevel.then(function (resposta) {
        debugLevel = resposta.audAidDebugLevel;
        if (debugLevel > 0) console.log("AudAid - Nível de Debug", debugLevel, new Date());
    });

    let getAgreement = browser.storage.local.get('audAidConcordo');
    getAgreement.then(gotAgreement, didNotGetAgreement);
}

async function gotAgreement(termos) {
    if (debugLevel >= 3) console.log('gotAGreement');
    if (termos.audAidConcordo) {
        if (debugLevel >= 3) console.log("AudAid - Carregado. Limpando...", new Date());

        //Fecha a modal, se estiver aberta (em caso de recarregar a página)
        toggleModal(false);

        //Remove o botão para abrir a modal
        $('#aud-aid-open-modal-button').remove();
        $('#aud-aid-modal').remove();
        $('#aud-aid-modal-overlay').remove();
        $('#aud-aid-alert-container').remove();


        if (debugLevel >= 3) console.log("AudAid - Limpo!", new Date());

        if ((urlAtual.includes('processo')) && (urlAtual.includes('detalhe'))) {
            if (debugLevel >= 3) console.log("AudAid - Vou criar a modal.", new Date());
            processo = await getProcessData();
            tiposDeAudiencia = await getHearingTypes();
            salas = await getRoomIds();
            await buildModal();

            if (debugLevel >= 3) console.log("AudAid - Modal criada! Criando botão...", new Date());
            var buttonTemplate = $('<i />').addClass('fas fa-calendar-check aud-aid-icon').attr('id', 'aud-aid-open-modal-button').click(true, toggleModal);
            $('body').append(buttonTemplate);
            if (debugLevel >= 3) console.log("AudAid - Botão criado e anexado à página! Pronto para uso!", new Date());
        }
    } else {
        console.log('pegou o termo (fufilled promise), mas seu valor é falso');
    }
}

async function didNotGetAgreement(error) {
    console.log('did not get AGreement');
}

function getUrlToOpen(suffix) {
    if (suffix === null || suffix === undefined) suffix = '';
    var urlAtual = window.location.href.toString();
    var urlParaAbrir = '';
    if (urlAtual.includes("homologacao")) urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/' + suffix;
    else if (urlAtual.includes("treinamento")) urlParaAbrir = 'https://pje-treinamento.trt9.jus.br/' + suffix;
    else urlParaAbrir = 'https://pje.trt9.jus.br/' + suffix;
    return urlParaAbrir;
}


function openPjeSchedule() {
    var urlParaAbrir = getUrlToOpen('pjekz/pauta-audiencias');
    const win = window.open(urlParaAbrir, '_blank');
}

function openAudAidAlert(titulo, mensagem) {
    console.log(titulo, mensagem);
    $('#aud-aid-alert-message').text(mensagem);
    $('#aud-aid-alert-container').dialog({
        title: titulo,
        buttons: {
            'Ok': function () {
                $(this).dialog('close');
            },
        },
    }).dialog('open');
}

function openReloadConfirm(titulo, mensagem) {
    $('#aud-aid-alert-message').text(mensagem);
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
}

function openRebookConfirm(titulo, mensagem, id) {
    $('#aud-aid-alert-message').text(mensagem);
    $('#aud-aid-alert-container').dialog({
        title: titulo,
        buttons: {
            'Redesignar': function () {
                $(this).dialog('close');
                prepareCancelPayload(id);
            },
            'Não redesignar': function () {
                $(this).dialog('close');
            },
        },
    }).dialog('open');
}


function openAudAidSchedule() {
    //browser.runtime.getURL('termos/termos.html'),
    // var urlParaAbrir = browser.runtime.getURL('pauta/pauta.html');
    // urlParaAbrir = urlParaAbrir.toString();
    // if (debugLevel >= 3) console.log("AudAid - URL da Pauta", urlParaAbrir, new Date());
    // let openSchedule = browser.tabs.create({
    //     url: urlParaAbrir,
    //     active: true
    // });
    // openSchedule.then(function (aba) {
    //     console.log(aba);
    // }, function (erro) {
    //     console.log('erro ao abrir aba: ', erro);
    // });
    // const win = window.open(urlParaAbrir, '_self');
    var titulo = 'Função ainda não implementada';
    var texto = 'Use o menu de opções para acessar a pauta';
    // openAudAidAlert(titulo, texto);
    alert(titulo + '\n' + texto);
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
/*
Funções de coleta de dados, preparação para montar a modal
*/
async function getHearingTypes() {
    var urlParaAbrir = getUrlToOpen('pje-comum-api/api/dominio/tiposaudiencias');
    let resposta = await fetch(urlParaAbrir);
    let tipos = await resposta.json();
    return tipos;
}

async function getProcessData() {
    var urlParaAbrir = getUrlToOpen('pje-comum-api/api/processos/id/' + idProcesso);
    let resposta = await fetch(urlParaAbrir);
    let dados = await resposta.json();
    return dados;
}

async function getRoomIds() {
    var urlParaAbrir = getUrlToOpen("pje-comum-api/api/salasaudiencias?idOrgaoJulgador=" + processo.orgaoJulgador.id);
    var resposta = await fetch(urlParaAbrir);
    var salas = await resposta.json();
    return salas;
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------

/*
Funções de execução do módulo
*/
//1º Limpa tudo
setTimeout(audAidStart, 2000);

async function buildModal() {
    if (debugLevel >= 3) console.log("AudAid - Criando modal...", new Date());

    //Início da construção da modal
    var modalContainer = $('<div />').addClass('aud-aid-modal aud-aid-modal-shrinked').attr('id', 'aud-aid-modal').hide();
    // var modalBackground = $('<img />').attr('src',browser.runtime.getURL('icons/audaid.svg')).addClass('aud-aid-modal-background');
    // $(modalContainer).append(modalBackground);

    //Modal Header
    var modalHeader = $('<div />').addClass('aud-aid-modal-header').append($('<h4 />').text('AudAid'));
    if (debugLevel >= 3) console.log("AudAid - Modal Header Built!");

    //Modal Content
    var modalContent = $('<div />').addClass('aud-aid-modal-content');

    var number = $('<span />').attr('id', 'aud-aid-process-number').text('Número: ' + processo.numero);
    var phase = $('<span />').attr('id', 'aud-aid-process-phase').text("Fase: " + processo.labelFaseProcessual);
    $(modalContent).append(number);
    $(modalContent).append(phase);

    if (processo.juizoDigital) {
        var juizoDigitalContainer = $('<span />').attr('id', 'aud-aid-process-100-digital').addClass('aud-aid-color-100-digital').text("100% Digital")
        $(modalContent).append(juizoDigitalContainer);
    }

    //Select das salas de audiência
    var courtRoomSelectContainer = $('<div />');
    var courtRoomSelect = $('<select />').attr('id', 'aud-aid-court-room-select').change(changedSuggestedCourtRoom);
    var stdOption = $('<option />').attr('value', 0).html('Selecione a sala').attr('disabled', 'disabled').attr('selected', 'selected');
    $(courtRoomSelect).append(stdOption);

    var rooms = await getRoomIds();
    for (i = 0; i < rooms.length; i++) {
        var roomOption = $('<option />').attr('value', rooms[i].id).html(rooms[i].nome);
        $(courtRoomSelect).append(roomOption);
    }

    $(courtRoomSelectContainer).append(courtRoomSelect);
    $(modalContent).append(courtRoomSelectContainer);

    if (debugLevel >= 3) console.log("AudAid - Modal Content Court Room Select Built!");

    //Inputs de data e hora
    var dateContainer = $('<div />').addClass('aud-aid-date-time-container');
    var dateInput = $('<input />').attr('type', 'date').attr('id', 'aud-aid-date-input');
    var hourInput = $('<input />').attr('type', 'time').attr('id', 'aud-aid-time-input');

    $(dateContainer).append($('<span />').text('Data:'));
    $(dateContainer).append(dateInput);
    $(dateContainer).append($('<span />').text('Hora:'));
    $(dateContainer).append(hourInput);
    $(modalContent).append(dateContainer);

    if (debugLevel >= 3) console.log("AudAid - Modal Content Date and Time Inputs Built!");

    //Input do tipo de audiência
    var hearingTypeSelectContainer = $('<div />');
    var hearingTypeSelect = $('<select />').attr('id', 'aud-aid-hearing-type-select').change(changeSuggestedHearingType).change(buildSuggestion);
    $(hearingTypeSelect).append($('<option />').attr('value', 0).html('Selecione o tipo de audiência').attr('disabled', 'disabled').attr('selected', 'selected'));
    $(hearingTypeSelect).append($('<option />').attr('value', 1).html('Conciliação'));
    $(hearingTypeSelect).append($('<option />').attr('value', 2).html('Inicial'));
    $(hearingTypeSelect).append($('<option />').attr('value', 3).html('Instrução'));
    $(hearingTypeSelect).append($('<option />').attr('value', 4).html('Encerramento'));
    $(hearingTypeSelect).append($('<option />').attr('value', 5).html('Julgamento'));
    $(hearingTypeSelect).append($('<option />').attr('value', 6).html('Una'));
    $(hearingTypeSelect).append($('<option />').attr('value', 7).html('Inquirição de testemunha'));
    $(hearingTypeSelectContainer).append($('<label />').attr('for', 'aud-aid-hearing-type-select').html('Tipo: ')).append(hearingTypeSelect);
    $(modalContent).append(hearingTypeSelectContainer);

    if (debugLevel >= 3) console.log("AudAid - Modal Content Type Select Built!");

    //Checkboxes -> videoconferência? semana conciliação?
    var inputsContainer = $('<div />');

    var videoCallContainer = $('<div />').addClass('aud-aid-check-container').attr('id', 'aud-aid-videocall-container');
    var videoCallText = $('<span />').addClass('aud-aid-question').text("Videoconferência?");
    var videoCallCheckbox = $('<input />').attr('type', 'checkbox').attr('id', 'aud-aid-video-call-checkbox').change(buildSuggestion);
    $(videoCallContainer).append(videoCallText);
    $(videoCallContainer).append(videoCallCheckbox).hide();

    var specialWeeksFormContainer = $('<div />').attr('id', 'aud-aid-special-weeks-form-container');
    var specialWeeksForm = $('<form />').attr('id', 'aud-aid-special-weeks-form');
    var agreementWeekCheckboxContainer = $('<div />').attr('id', 'aud-aid-agreement-week-checkbox-container');
    var agreementWeekCheckboxLabel = $('<label />').attr('for', 'aud-aid-agreement-week-checkbox').html('Semana da Conciliação?');
    var agreementWeekCheckbox = $('<input />').attr('type', 'checkbox').attr('id', 'aud-aid-agreement-week-checkbox').attr('name', 'special-weeks').change(buildSuggestion).click({ week: 'agreement' }, verifyOtherCheckbox);
    $(agreementWeekCheckboxContainer).append(agreementWeekCheckboxLabel);
    $(agreementWeekCheckboxContainer).append(agreementWeekCheckbox);

    var executionWeekCheckboxContainer = $('<div />').attr('id', 'aud-aid-execution-week-checkbox-container');
    var executionWeekCheckboxLabel = $('<label />').attr('for', 'aud-aid-execution-week-checkbox').html('Semana da Execução?');
    var executionWeekCheckbox = $('<input />').attr('type', 'checkbox').attr('id', 'aud-aid-execution-week-checkbox').attr('name', 'special-weeks').change(buildSuggestion).click({ week: 'execution' }, verifyOtherCheckbox);
    $(executionWeekCheckboxContainer).append(executionWeekCheckboxLabel);
    $(executionWeekCheckboxContainer).append(executionWeekCheckbox);

    $(specialWeeksForm).append(agreementWeekCheckboxContainer);
    $(specialWeeksForm).append(executionWeekCheckboxContainer);
    $(specialWeeksFormContainer).append(specialWeeksForm).hide();

    $(inputsContainer).append(videoCallContainer);
    $(inputsContainer).append(specialWeeksFormContainer);

    $(modalContent).append(inputsContainer);

    //Audiência Sugerida
    var suggestedDiv = $('<div />').attr('id', 'aud-aid-suggested-container');
    $(modalContent).append(suggestedDiv);

    //GIGS
    var appendGigsContainer = $('<div />').addClass('aud-aid-gigs-select-container');
    var appendGigsTextAndSelectContainer = $('<div />').attr('id', 'aud-aid-gigs-text-and-select-container');
    var appendGigsText = $('<label />').attr('for', 'aud-aid-append-gigs-select').text("Acionar GIGS?");
    var appendGigsSelect = $('<select />').attr('id', 'aud-aid-append-gigs-select').attr('name', 'aud-aid-append-gigs-select').change(changeGigsSelect);
    var stdOpt = $('<option />').attr('value', '-1').attr('selected', 'selected').html('Nenhum');
    var rj1Opt = $('<option />').attr('value', '1').html('@RJ1');
    var cumprir1Opt = $('<option />').attr('value', '2').html('Cumprir');
    var digitarOpt = $('<option />').attr('value', '3').html('Digitar observação');
    var observacaoInput = $('<input />').attr('type', 'text').attr('id', 'aud-aid-observacao-input').attr('disabled', 'disabled');
    $(appendGigsSelect).append(stdOpt);
    $(appendGigsSelect).append(rj1Opt);
    $(appendGigsSelect).append(cumprir1Opt);
    $(appendGigsSelect).append(digitarOpt);
    $(appendGigsTextAndSelectContainer).append(appendGigsText);
    $(appendGigsTextAndSelectContainer).append(appendGigsSelect);
    $(appendGigsContainer).append(appendGigsTextAndSelectContainer);
    $(appendGigsContainer).append(observacaoInput);
    $(modalContent).append(appendGigsContainer);

    //Modal Footer
    var modalFooter = $('<div />').addClass('aud-aid-modal-footer');
    var closeButton = $('<div />').text('Fechar').addClass('aud-aid-button').click(false, toggleModal);
    var openPJeScheduleButton = $('<div />').text('Pauta PJe').addClass('aud-aid-button').click(openPjeSchedule);
    var openAudAidScheduleButton = $('<div />').text('Pauta AudAid').addClass('aud-aid-button').click(openAudAidSchedule);
    var scheduleButton = $('<div />').text('Designar').addClass('aud-aid-button').click(validateBookHearing);

    $(modalFooter).append(closeButton);
    $(modalFooter).append(openPJeScheduleButton);
    $(modalFooter).append(openAudAidScheduleButton);
    $(modalFooter).append(scheduleButton);

    $(modalContainer).append(modalHeader);
    $(modalContainer).append(modalContent);
    $(modalContainer).append(modalFooter);

    $("body").append(modalContainer);

    var modalOverlay = $('<div />').addClass('aud-aid-modal-overlay').attr('id', 'aud-aid-modal-overlay').click(false, toggleModal).hide();
    $("body").append(modalOverlay);

    if (processo.juizoDigital) $('#aud-aid-video-call-checkbox').attr('checked', 'checked').trigger('change');
    if (debugLevel >= 3) console.log("AudAid - Modal construída e anexada à página!", new Date());

    //Alerta
    var audAidAlertContainer = $('<div />').attr('id', 'aud-aid-alert-container').attr('title', 'Título padrão').hide();
    var audAidAlertMessage = $('<p />').attr('id', 'aud-aid-alert-message');
    $(audAidAlertContainer).append(audAidAlertMessage);
    $("body").append(audAidAlertContainer);
    if (debugLevel >= 3) console.log("AudAid - Alerta construído e anexado à página!", new Date());
    $(audAidAlertContainer).dialog({
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
        // buttons: {
        //     "Concordar": function () {
        //         $(this).dialog("close");
        //     },
        //     Cancel: function () {
        //         $(this).dialog("close");
        //     }
        // }
    });
}

function toggleModal(state) {
    if (state.data) {
        $('#aud-aid-modal').show();
        $('#aud-aid-modal').removeClass('aud-aid-modal-shrinked');
        $('#aud-aid-modal-overlay').show();
    } else {
        $('#aud-aid-modal').addClass('aud-aid-modal-shrinked');
        $('#aud-aid-modal').hide();
        $('#aud-aid-modal-overlay').hide();
    }
}

function changedSuggestedCourtRoom(evt) {
    idSalaFisica = evt.currentTarget[evt.currentTarget.selectedIndex].value;
}

function changeSuggestedHearingType(evt) {
    var tipo = evt.currentTarget.selectedIndex;
    if (tipo === 1) $('#aud-aid-special-weeks-form-container').show();
    else $('#aud-aid-special-weeks-form-container').hide();

    if (tipo !== 5) $('#aud-aid-videocall-container').show();
    else $('#aud-aid-videocall-container').hide();
}

function verifyOtherCheckbox(evt) {
    var kindOfWeek = evt.data.week;
    if (kindOfWeek === 'agreement') {
        if ($('#aud-aid-agreement-week-checkbox:checked') && $('#aud-aid-execution-week-checkbox:checked')) {
            $('#aud-aid-execution-week-checkbox').prop('checked', false);
        }
    }
    else if (kindOfWeek === 'execution') {
        if ($('#aud-aid-agreement-week-checkbox:checked') && $('#aud-aid-execution-week-checkbox:checked')) {
            $('#aud-aid-agreement-week-checkbox').prop('checked', false);
        }
    }
    // aud-aid-agreement-week-checkbox
    // aud-aid-execution-week-checkbox

}

function buildSuggestion() {
    var tipo = $('#aud-aid-hearing-type-select').val();
    var type = '';
    var video = $('#aud-aid-video-call-checkbox')[0].checked;
    var agreementWeek = $('#aud-aid-agreement-week-checkbox')[0].checked;
    var executionWeek = $('#aud-aid-execution-week-checkbox')[0].checked;
    var phase = processo.labelFaseProcessual;
    var style = 'aud-aid-color-standard';
    var needRite = false;
    var rite = '';

    switch (parseInt(tipo)) {
        case 1:
            type = "Conciliação ";
            needRite = false;
            if (phase === "Conhecimento") phase = "em Conhecimento ";
            else phase = "em Execução ";
            break;
        case 2:
            type = "Inicial ";
            needRite = true;
            style = "aud-aid-color-inicial";
            phase = "";
            break;
        case 3:
            type = "Instrução ";
            needRite = true;
            style = "aud-aid-color-instrucao";
            phase = "";
            break;
        case 4:
            type = "Encerramento ";
            needRite = false;
            phase = "";
            break;
        case 5:
            type = "Julgamento ";
            needRite = false;
            phase = "";
            break;
        case 6:
            type = "Una ";
            needRite = true;
            style = 'aud-aid-color-una';
            phase = "";
            break;
        case 7:
            type = "Inquirição de testemunha ";
            needRite = false;
            style = "aud-aid-color-inquiricao";
            phase = "";
            break;
        default:
            break;
    }

    if ((phase !== 'em Conhecimento ') && (phase !== 'em Execução ')) phase = '';

    if (needRite) if (processo.classeJudicial.sigla === 'ATSum') rite = ' (rito sumaríssimo)';
    else rite = '';

    (video && parseInt(tipo) !== 5) ? video = ' por videoconferência' : video = '';
    agreementWeek ? agreementWeek = ' - Semana Nacional da Conciliação' : agreementWeek = '';
    executionWeek ? executionWeek = ' - Semana Nacional de Execução' : executionWeek = '';

    $('#aud-aid-suggested-container').html('');
    $('#aud-aid-suggested-container').removeClass('aud-aid-color-standard').removeClass('aud-aid-color-inicial').removeClass('aud-aid-color-instrucao').removeClass('aud-aid-color-inquiricao').removeClass('aud-aid-color-una');
    $('#aud-aid-suggested-container').addClass(style);
    $('#aud-aid-suggested-container').append($('<span />').text(type));
    $('#aud-aid-suggested-container').append($('<span />').text(phase));
    $('#aud-aid-suggested-container').append($('<span />').text(video));
    $('#aud-aid-suggested-container').append($('<span />').text(agreementWeek));
    $('#aud-aid-suggested-container').append($('<span />').text(executionWeek));
    $('#aud-aid-suggested-container').append($('<span />').text(rite));

}

async function validateBookHearing() {
    var errorCounter = 0;
    var errorString = [];
    //CourtRoom
    if ($('#aud-aid-court-room-select').val() === null || $('#aud-aid-court-room-select').val() === undefined) {
        $('#aud-aid-court-room-select').addClass('aud-aid-error');
        if (debugLevel >= 2) console.log("AudAid - Erro! Sala de Audiências não preenchida corretamente.", new Date());
        errorCounter++;
        errorString.push('Sala de Audiências não preenchida corretamente');
    } else $('#aud-aid-court-room-select').addClass('aud-aid-success');
    //Date
    if ($('#aud-aid-date-input').val() === null || $('#aud-aid-date-input').val() === undefined || $('#aud-aid-date-input').val() === '') {
        $('#aud-aid-date-input').addClass('aud-aid-error');
        if (debugLevel >= 2) console.log("AudAid - Erro! Data não preenchida corretamente.", new Date());
        errorCounter++;
        errorString.push('Data não preenchida corretamente');
    } else $('#aud-aid-date-input').addClass('aud-aid-success');
    //Time
    if ($('#aud-aid-time-input').val() === null || $('#aud-aid-time-input').val() === undefined || $('#aud-aid-time-input').val() === '') {
        $('#aud-aid-time-input').addClass('aud-aid-error');
        if (debugLevel >= 2) console.log("AudAid - Erro! Hora não preenchida corretamente.", new Date());
        errorCounter++;
        errorString.push('Hora não preenchida corretamente');
    } else $('#aud-aid-time-input').addClass('aud-aid-success');
    //Type
    if ($('#aud-aid-hearing-type-select').val() === null || $('#aud-aid-hearing-type-select').val() === undefined) {
        $('#aud-aid-hearing-type-select').addClass('aud-aid-error');
        if (debugLevel >= 2) console.log("AudAid - Erro! Tipo não preenchido corretamente.", new Date());
        errorCounter++;
        errorString.push('Tipo não preenchido corretamente');
    } else $('#aud-aid-hearing-type-select').addClass('aud-aid-success');

    if (errorCounter === 0) {
        if (debugLevel >= 2) console.log("AudAid - Audiência validada! Vou preparar o JSON.", new Date());
        checkAlreadyBookedHearing();
    } else {
        // alert('Há erros no formulário!');
        var mensagem = '';
        errorString.forEach(function(erro, index) {
            mensagem += (index+1);
            mensagem += ': ';
            mensagem += erro;
            mensagem += '\n';
        });
        if (debugLevel >= 2) console.log("AudAid - Erro!", mensagem, new Date());
        openAudAidAlert('Formulário com erros', mensagem);
    }
}

async function changeGigsSelect() {
    if (document.getElementById('aud-aid-append-gigs-select').selectedIndex === 3) {
        $('#aud-aid-observacao-input').removeAttr('disabled');
    } else {
        $('#aud-aid-observacao-input').attr('disabled', 'disabled');
        $('#aud-aid-observacao-input')[0].value = '';
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------

/*
Funções de preparação para requisitar a designação de audiência e GIGS
*/
async function checkAlreadyBookedHearing() {
    var alreadyBookedHearing = await getAlreadyBookedHearingId();
    console.log(alreadyBookedHearing);
    if (alreadyBookedHearing != null && alreadyBookedHearing != undefined) {
        openRebookConfirm('Redesignação', 'Este processo já tinha audiência designada', alreadyBookedHearing.id);
    } else {
        prepareBookPayload();
    }
}

async function prepareBookPayload() {
    if (debugLevel >= 3) console.log("AudAid - Entrei na função prepareBookPayload", new Date());
    var tipo = $('#aud-aid-hearing-type-select').val();
    var idTipo = null;
    var videoChecked = $('#aud-aid-video-call-checkbox')[0].checked;
    var agreementChecked = $('#aud-aid-agreement-week-checkbox')[0].checked;
    var executionChecked = $('#aud-aid-execution-week-checkbox')[0].checked;
    var phase = processo.labelFaseProcessual;

    if (videoChecked === null || videoChecked === undefined) videoChecked = false;
    if (agreementChecked === null || agreementChecked === undefined) agreementChecked = false;
    if (executionChecked === null || executionChecked === undefined) executionChecked = false;
    if (phase !== "Conhecimento") phase = "Execução";

    switch (parseInt(tipo)) {
        case 1: //Conciliação
            if (phase === "Conhecimento") {
                if (agreementChecked) {
                    if (videoChecked) tipoString = 'Conciliação em Conhecimento por videoconferência - Semana Nacional de Conciliação';
                    else tipoString = 'Conciliação em Conhecimento - Semana Nacional de Conciliação';
                } else {
                    if (videoChecked) tipoString = 'Conciliação em Conhecimento por videoconferência';
                    else tipoString = 'Conciliação em Conhecimento';
                }
            } else if (phase === "Execução") {
                if (executionChecked) {
                    if (videoChecked) tipoString = 'Conciliação em Execução por videoconferência - Semana Nacional de Execução';
                    else tipoString = 'Conciliação em Execução - Semana Nacional de Execução';
                } else if (agreementChecked) {
                    if (videoChecked) tipoString = 'Conciliação em Execução por videoconferência - Semana Nacional de Conciliação';
                    else tipoString = 'Conciliação em Execução - Semana Nacional de Conciliação';
                } else {
                    if (videoChecked) tipoString = 'Conciliação em Execução por videoconferência';
                    else tipoString = 'Conciliação em Execução';
                }
            }
            break;
        case 2: //Inicial
            if (processo.classeJudicial.sigla === 'ATSum') {
                if (videoChecked) tipoString = 'Inicial por videoconferência (rito sumaríssimo)';
                else tipoString = 'Inicial (rito sumaríssimo)';
            } else {
                if (videoChecked) tipoString = 'Inicial por videoconferência';
                else tipoString = 'Inicial';
            }
            break;
        case 3: //Instrução
            if (processo.classeJudicial.sigla === 'ATSum') {
                if (videoChecked) tipoString = 'Instrução por videoconferência (rito sumaríssimo)';
                else tipoString = 'Instrução (rito sumaríssimo)';
            } else {
                if (videoChecked) tipoString = 'Instrução por videoconferência';
                else tipoString = 'Instrução';
            }
            break;
        case 4: //Encerramento de instrução
            if (videoChecked) tipoString = 'Encerramento de instrução por videoconferência';
            else tipoString = 'Encerramento de instrução';
            break;
        case 5: //Julgamento
            tipoString = 'Julgamento';
            break;
        case 6: //Una
            if (processo.classeJudicial.sigla === 'ATSum') {
                if (videoChecked) tipoString = 'Una por videoconferência (rito sumaríssimo)';
                else tipoString = 'Una (rito sumaríssimo)';
            } else {
                if (videoChecked) tipoString = 'Una por videoconferência';
                else tipoString = 'Una';
            }
            break;
        case 7: //Inquirição de testemunha
            if (videoChecked) tipoString = 'Inquirição de testemunha por videoconferência (juízo deprecado)';
            else tipoString = 'Inquirição de testemunha (juízo deprecado)';
            break;
        default:
            break;
    }

    for (i = 0; i < tiposDeAudiencia.length; i++) {
        if (tiposDeAudiencia[i].descricao === tipoString) {
            idTipo = tiposDeAudiencia[i].id;
        }
    }

    dataParaMarcar = $('#aud-aid-date-input').val();

    horaParaMarcar = $('#aud-aid-time-input').val();
    //verificar se o início da aud é nos 59min. caso positivo, tem que ajustar o HorarioFinal
    var horaFinal = "";
    if (horaParaMarcar.substr(4) !== "59") {
        horaFinal = horaParaMarcar.substr(0, 4) + (parseInt(horaParaMarcar.substr(4)) + 1);
    } else {
        horaFinal = (parseInt(horaParaMarcar.substr(0, 2) + 1)).concat(":00");
    }

    var payloadJson = {
        "considerarIntersticio": true,
        "buscarProximoHorarioVago": false,
        "validarHorario": true,
        "idTipoAudiencia": parseInt(idTipo),
        "data": dataParaMarcar.concat("T03:00:00.000Z"),
        "horarioInicial": horaParaMarcar,
        "horarioFinal": horaFinal,
        "idProcesso": parseInt(idProcesso),
        "idSalaFisica": idSalaFisica
    };
    if (debugLevel >= 3) console.log("AudAid - PayloadJson pronto.", payloadJson, new Date());
    sendBookHearingPostRequest(payloadJson);
}

async function prepareCancelPayload(idToCancel) {
    var payloadJson = [idToCancel];
    if (debugLevel >= 3) console.log("AudAid - Cancel PayloadJson pronto.", payloadJson, new Date());
    sendCancelHearingPatchRequest(payloadJson);
}

function checkGigs() {
    var indiceSelecionado = parseInt(document.getElementById('aud-aid-append-gigs-select').selectedIndex);
    if (debugLevel >= 3) console.log('AudAid - dentro da checkGIGS', indiceSelecionado);
    if (indiceSelecionado > 0) {
        if (debugLevel >= 3) console.log("AudAid - CheckGIGS - Precisa marcar GIGS.", indiceSelecionado, new Date());
        return true;
    }
    else {
        if (debugLevel >= 3) console.log("AudAid - CheckGIGS - Não precisa marcar GIGS.", indiceSelecionado, new Date());
        return false;
    }
}

async function prepareGigsPayload() {
    var observacao = parseInt(document.getElementById('aud-aid-append-gigs-select').selectedIndex);
    switch (observacao) {
        case 1:
            observacao = "@RJ1";
            break;
        case 2:
            observacao = "Cumprir";
            break;
        case 3:
            observacao = $('#aud-aid-observacao-input').val();
            break;
        default:
            observacao = 0;
            break;
    }

    if (observacao !== 0) {
        var payloadJson = {
            "dataPrazo": new Date(new Date().getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString(),
            // "dataPrazo": "2022-07-08T03:00:00.000Z",
            "idProcesso": idProcesso,
            "observacao": observacao,
            "tipoAtividade": {
                "descricao": "Prazo",
                "id": 24
            }
        };
        if (debugLevel >= 3) console.log("AudAid - GIGS PayloadJson pronto.", payloadJson, new Date());
        sendCreateGigsPostRequest(payloadJson);
    } //else alert('Não é pra criar GIGS!');

}

async function getAlreadyBookedHearingId() {
    var urlParaAbrir = getUrlToOpen('pje-comum-api/api/processos/id/' + parseInt(idProcesso) + '/audiencias?status=M');
    var resposta = await fetch(urlParaAbrir);
    var audiencia = await resposta.json();
    return audiencia[0];
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------

/*
Funções de envio de requisição
*/
async function sendCancelHearingPatchRequest(payload) {
    var urlParaAbrir = '';
    var urlHost = '';
    var urlOrigin = '';
    var urlReferer = '';
    var responseJson = '';
    if (urlAtual.includes("homologacao")) {
        urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias/cancelamento';
        urlHost = 'pje-homologacao.trt9.jus.br';
        urlOrigin = 'https://pje-homologacao.trt9.jus.br';
        urlReferer = 'https://pje-homologacao.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    }
    else if (urlAtual.includes("treinamento")) {
        urlParaAbrir = 'https://pje-treinamento.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias/cancelamento';
        urlHost = 'pje-treinamento.trt9.jus.br';
        urlOrigin = 'https://pje-treinamento.trt9.jus.br';
        urlReferer = 'https://pje-treinamento.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    }
    else {
        urlParaAbrir = 'https://pje.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias/cancelamento';
        urlHost = 'pje.trt9.jus.br';
        urlOrigin = 'https://pje.trt9.jus.br';
        urlReferer = 'https://pje.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    }
    //Faz requisiçao PATCH para cancelar a audiência que já estava designada
    let novoxhr = new XMLHttpRequest();
    novoxhr.open('PATCH', urlParaAbrir);
    novoxhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    novoxhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
    novoxhr.setRequestHeader('Accept-Language', 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3');
    novoxhr.setRequestHeader('Connection', 'keep-alive');
    novoxhr.setRequestHeader('Content-Length', new TextEncoder().encode(payload.length));
    novoxhr.setRequestHeader('Content-type', 'application/json');
    novoxhr.setRequestHeader('Cookie', document.cookie);
    novoxhr.setRequestHeader('Host', urlHost);
    novoxhr.setRequestHeader('Origin', urlOrigin);
    novoxhr.setRequestHeader('Referer', urlReferer);
    novoxhr.setRequestHeader('TE', 'Trailers');
    novoxhr.setRequestHeader('User-Agent', window.navigator.userAgent);
    novoxhr.setRequestHeader('X-XSRF-TOKEN', document.cookie.substr(document.cookie.search('Xsrf-Token='), 111).split('=')[1]);
    novoxhr.onload = () => {
        console.log(JSON.parse(novoxhr.responseText));
        responseJson = JSON.parse(novoxhr.responseText);
        if (responseJson != null) {
            prepareBookPayload();
        } else {
            alert(responseJson.mensagem);
        }
    }
    novoxhr.send(JSON.stringify(payload));
    if (debugLevel >= 3) console.log("AudAid - XHR de Cancel", novoxhr, new Date());
}

async function sendBookHearingPostRequest(payload) {
    var urlParaAbrir = '';
    var urlHost = '';
    var urlOrigin = '';
    var urlReferer = '';
    var responseJson = '';
    if (urlAtual.includes("homologacao")) {
        urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias';
        urlHost = 'pje-homologacao.trt9.jus.br';
        urlOrigin = 'https://pje-homologacao.trt9.jus.br';
        urlReferer = 'https://pje-homologacao.trt9.jus.br/pjekz/pauta-audiencias';
    }
    else if (urlAtual.includes("treinamento")) {
        urlParaAbrir = 'https://pje-treinamento.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias';
        urlHost = 'pje-treinamento.trt9.jus.br';
        urlOrigin = 'https://pje-treinamento.trt9.jus.br';
        urlReferer = 'https://pje-treinamento.trt9.jus.br/pjekz/pauta-audiencias';
    }
    else {
        urlParaAbrir = 'https://pje.trt9.jus.br/pje-comum-api/api/pautasaudiencias/audiencias';
        urlHost = 'pje.trt9.jus.br';
        urlOrigin = 'https://pje.trt9.jus.br';
        urlReferer = 'https://pje.trt9.jus.br/pjekz/pauta-audiencias';
    }
    //Faz requisiçao POST para gravar a audiência
    let novoxhr = new XMLHttpRequest();
    novoxhr.open('POST', urlParaAbrir);
    novoxhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    novoxhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
    novoxhr.setRequestHeader('Accept-Language', 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3');
    novoxhr.setRequestHeader('Connection', 'keep-alive');
    novoxhr.setRequestHeader('Content-Length', new TextEncoder().encode(JSON.stringify(payload)).length);
    novoxhr.setRequestHeader('Content-type', 'application/json');
    novoxhr.setRequestHeader('Cookie', document.cookie);
    novoxhr.setRequestHeader('Host', urlHost);
    novoxhr.setRequestHeader('Origin', urlOrigin);
    novoxhr.setRequestHeader('Referer', urlReferer);
    novoxhr.setRequestHeader('TE', 'Trailers');
    novoxhr.setRequestHeader('User-Agent', window.navigator.userAgent);
    novoxhr.setRequestHeader('X-XSRF-TOKEN', document.cookie.substr(document.cookie.search('Xsrf-Token='), 111).split('=')[1]);
    novoxhr.onload = () => {
        if (debugLevel >= 3) console.log("AudAid - Book JSON response", JSON.parse(novoxhr.responseText));
        responseJson = JSON.parse(novoxhr.responseText);
        if (responseJson.status === "Designada") {
            var temGigs = checkGigs();
            if (debugLevel >= 3) console.log("AudAid - CheckGIGS", temGigs, new Date());
            if (temGigs) prepareGigsPayload();
            else {
                if (debugLevel >= 3) console.log("AudAid - Não precisou marcar GIGS. Finalizando...", new Date());
                openReloadConfirm('Sucesso!', 'Audiência designada com sucesso!\nAtualize a página para ver as alterações');
            }
        } else {
            openAudAidAlert('Erro!', JSON.stringify(responseJson.mensagem));
        }
    }
    novoxhr.send(JSON.stringify(payload));
    if (debugLevel >= 3) console.log("AudAid - XHR de Designar", novoxhr, new Date());
}

async function sendCreateGigsPostRequest(payload) {
    var urlParaAbrir = '';
    var urlHost = '';
    var urlOrigin = '';
    var urlReferer = '';
    var responseJson = '';
    if (urlAtual.includes("homologacao")) {
        urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/pje-gigs-api/api/atividade';
        urlHost = 'pje-homologacao.trt9.jus.br';
        urlOrigin = 'https://pje-homologacao.trt9.jus.br';
        urlReferer = 'https://pje-homologacao.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    }
    else if (urlAtual.includes("treinamento")) {
        urlParaAbrir = 'https://pje-treinamento.trt9.jus.br/pje-gigs-api/api/atividade';
        urlHost = 'pje-treinamento.trt9.jus.br';
        urlOrigin = 'https://pje-treinamento.trt9.jus.br';
        urlReferer = 'https://pje-treinamento.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    }
    else {
        urlParaAbrir = 'https://pje.trt9.jus.br/pje-gigs-api/api/atividade';
        urlHost = 'pje.trt9.jus.br';
        urlOrigin = 'https://pje.trt9.jus.br';
        urlReferer = 'https://pje.trt9.jus.br/pjekz/processo/' + idProcesso + '/detalhe';
    }
    //Faz requisiçao POST para criar GIGS
    let novoxhr = new XMLHttpRequest();
    novoxhr.open('POST', urlParaAbrir);
    novoxhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    novoxhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
    novoxhr.setRequestHeader('Accept-Language', 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3');
    novoxhr.setRequestHeader('Connection', 'keep-alive');
    novoxhr.setRequestHeader('Content-Length', new TextEncoder().encode(JSON.stringify(payload)).length);
    novoxhr.setRequestHeader('Content-type', 'application/json');
    novoxhr.setRequestHeader('Cookie', document.cookie);
    novoxhr.setRequestHeader('Host', urlHost);
    novoxhr.setRequestHeader('Origin', urlOrigin);
    novoxhr.setRequestHeader('Referer', urlReferer);
    novoxhr.setRequestHeader('TE', 'Trailers');
    novoxhr.setRequestHeader('User-Agent', window.navigator.userAgent);
    novoxhr.setRequestHeader('X-XSRF-TOKEN', document.cookie.substr(document.cookie.search('Xsrf-Token='), 111).split('=')[1]);

    novoxhr.onload = () => {
        // console.log(JSON.parse(novoxhr.responseText));
        responseJson = JSON.parse(novoxhr.responseText);
        if (responseJson.usuarioCriacao !== null) {
            openReloadConfirm('Sucesso', 'Audiência e GIGS criados com sucesso!\nAtualize a página para ver as alterações');
        } else {
            openAudAidAlert('Erro', JSON.stringify(responseJson));
        }
    }
    novoxhr.send(JSON.stringify(payload));
    if (debugLevel >= 3) console.log("AudAid - XHR de Create GIGS", novoxhr, new Date());
}
