var urlAtual = window.location.href.toString();
var idProcesso = urlAtual.split("/")[5];
var idTipo = "";
var ritoParaMarcar = "";
var idSalaFisica = "";

//1º Limpa tudo
setTimeout(audAidClean, 2000);

function audAidClean() {
    // console.log("AudAid - Carregado. Limpando...", new Date());

    //Fecha a modal, se estiver aberta (em caso de recarregar a página)
    toggleModal(false);

    //Remove o botão para abrir a modal
    $('#aud-aid-open-modal-button').remove();
    // console.log("AudAid - Limpo!", new Date());
    if ((urlAtual.includes('processo')) && (urlAtual.includes('detalhe'))) {
        // console.log("Vou criar a modal.", new Date());
        buildModal();

        // console.log("AudAid - Modal criada! Criando botão...", new Date());
        var buttonTemplate = $('<i />').addClass('fas fa-calendar-check aud-aid-icon').attr('id', 'aud-aid-open-modal-button').click(true, toggleModal);
        $('body').append(buttonTemplate);
        // console.log("AudAid - Botão criado e anexado à página! Pronto para uso!", new Date());
    }
}

function buildModal() {
    // console.log("AudAid - Criando modal...", new Date());
    var numeroProcesso = $('.texto-numero-processo').text().substr(-26).trim();
    var ondeCortar = $('.texto-numero-processo').text().length - 28;
    var ritoProcesso = $('.texto-numero-processo').text().substr(1, ondeCortar);
    ritoParaMarcar = ritoProcesso;
    var faseProcesso = $('.info-processo > span:nth-child(2)').text().substr(5);
    var juizo100Digital = $('.logo_juizo');

    if (juizo100Digital.length > 0) juizo100Digital = true;
    else juizo100Digital = false;

    //Início da construção da modal
    var modalContainer = $('<div />').addClass('aud-aid-modal aud-aid-modal-shrinked').attr('id', 'aud-aid-modal').hide();

    //Modal Header
    var modalHeader = $('<div />').addClass('aud-aid-modal-header').append($('<h4 />').text('AudAid'));
    // console.log("AudAid - Modal Header Built!");

    //Modal Content
    var modalContent = $('<div />').addClass('aud-aid-modal-content');

    //Input que leva o número do processo aberto
    var numberContainer = $('<div />');
    //var numberInput = $('<input />').val(numeroProcesso).attr('title','Número do Processo').attr('disabled','disabled');
    var number = $('<span />').attr('id', 'aud-aid-process-number').text('Número: ' + numeroProcesso);
    var phase = $('<span />').attr('id', 'aud-aid-process-phase').text("Fase: " + faseProcesso);
    $(numberContainer).append(number);
    $(modalContent).append(numberContainer);
    $(modalContent).append(phase);

    if (juizo100Digital) {
        var juizo100DigitalContainer = $('<span />').attr('id', 'aud-aid-process-100-digital').addClass('aud-aid-color-100-digital').text("100% Digital")
        $(modalContent).append(juizo100DigitalContainer);
    }

    //Select das salas de audiência
    var courtRoomSelectContainer = $('<div />');
    var courtRoomSelect = $('<select />').attr('id', 'aud-aid-court-room-select').change(changedSuggestedCourtRoom);
    var stdOption = $('<option />').attr('value', 0).html('Selecione a sala').attr('disabled', 'disabled').attr('selected', 'selected');
    $(courtRoomSelect).append(stdOption);
    for (i = 0; i < 2; i++) {
        var roomOption = $('<option />').attr('value', i).html('Sala 0' + (i + 1));
        $(courtRoomSelect).append(roomOption);
    }
    $(courtRoomSelectContainer).append(courtRoomSelect);
    $(modalContent).append(courtRoomSelectContainer);

    // console.log("AudAid - Modal Content Court Room Select Built!");

    //Inputs de data e hora
    var dateContainer = $('<div />').addClass('aud-aid-date-time-container');
    var dateInput = $('<input />').attr('type', 'date').attr('id', 'aud-aid-date-input').click(changeSuggestedDate);
    var hourInput = $('<input />').attr('type', 'time').attr('id', 'aud-aid-time-input').click(changeSuggestedTime);

    $(dateContainer).append($('<span />').text('Data:'));
    $(dateContainer).append(dateInput);
    $(dateContainer).append($('<span />').text('Hora:'));
    $(dateContainer).append(hourInput);
    $(modalContent).append(dateContainer);

    // console.log("AudAid - Modal Content Date and Time Inputs Built!");

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

    // console.log("AudAid - Modal Content Type Select Built!");

    //Checkboxes -> videoconferência? semana conciliação?
    var inputsContainer = $('<div />');

    var videoCallContainer = $('<div />').addClass('aud-aid-check-container').attr('id', 'aud-aid-videocall-container');
    var videoCallText = $('<span />').addClass('aud-aid-question').text("Videoconferência?");
    var videoCallCheckbox = $('<input />').attr('type', 'checkbox').attr('id', 'aud-aid-video-call-checkbox').change(buildSuggestion);
    $(videoCallContainer).append(videoCallText);
    $(videoCallContainer).append(videoCallCheckbox).hide();

    var specialWeeksFormContainer = $('<div />').attr('id', 'aud-aid-special-weeks-form-container');
    var specialWeeksForm = $('<form />').attr('id', 'aud-aid-special-weeks-form');
    var agreementWeekRadioContainer = $('<div />').attr('id', 'aud-aid-agreement-week-radio-container');
    var agreementWeekRadioLabel = $('<label />').attr('for', 'aud-aid-agreement-week-radio').html('Semana da Conciliação?');
    var agreementWeekRadio = $('<input />').attr('type', 'radio').attr('id', 'aud-aid-agreement-week-radio').attr('name', 'special-weeks').change(buildSuggestion);
    $(agreementWeekRadioContainer).append(agreementWeekRadioLabel);
    $(agreementWeekRadioContainer).append(agreementWeekRadio);

    var executionWeekRadioContainer = $('<div />').attr('id', 'aud-aid-execution-week-radio-container');
    var executionWeekRadioLabel = $('<label />').attr('for', 'aud-aid-execution-week-radio').html('Semana da Execução?');
    var executionWeekRadio = $('<input />').attr('type', 'radio').attr('id', 'aud-aid-execution-week-radio').attr('name', 'special-weeks').change(buildSuggestion);

    $(executionWeekRadioContainer).append(executionWeekRadioLabel);
    $(executionWeekRadioContainer).append(executionWeekRadio);

    $(specialWeeksForm).append(agreementWeekRadioContainer);
    $(specialWeeksForm).append(executionWeekRadioContainer);
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
    var closeButton = $('<button />').text('Fechar').click(false, toggleModal);
    // var openScheduleButton = $('<button />').text('Abrir Pauta').click(openSchedule);
    var openScheduleButton = $('<button />').text('Abrir Pauta').click(criaGigs);//.click(openSchedule);
    var scheduleButton = $('<button />').text('Designar').click(validateBookHearing);//.attr('disabled','disabled');

    $(modalFooter).append(closeButton);
    $(modalFooter).append(openScheduleButton);
    $(modalFooter).append(scheduleButton);

    $(modalContainer).append(modalHeader);
    $(modalContainer).append(modalContent);
    $(modalContainer).append(modalFooter);

    $("body").append(modalContainer);

    var modalOverlay = $('<div />').addClass('aud-aid-modal-overlay').attr('id', 'aud-aid-modal-overlay').click(false, toggleModal).hide();
    $("body").append(modalOverlay);

    // if (juizo100Digital) $('#aud-aid-video-call-checkbox').attr('checked','checked').attr('disabled','disabled').trigger('change');
    if (juizo100Digital) $('#aud-aid-video-call-checkbox').attr('checked', 'checked').trigger('change');
    // console.log("AudAid - Modal construída e anexada à página!", new Date());
}

function toggleModal(state) {
    //state.data ? $('#aud-aid-modal').show() : $('#aud-aid-modal').hide();
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
    var sala = evt.currentTarget.selectedIndex;
    if (sala === 1) idSalaFisica = 85; //sala 01 1vdtcsc
    if (sala === 2) idSalaFisica = 162; //sala 02 1vdtcsc
    // if (sala === 1) idSalaFisica = 112; //sala 01 3vdtcsc
    // if (sala === 2) idSalaFisica = 113; //sala 02 3vdtcsc
}

function changeSuggestedDate(evt) {
    //var data = evt.currentTarget.value;
    dataParaMarcar = $('#aud-aid-date-input').val();
}

function changeSuggestedTime(evt) {
    //var data = evt.currentTarget.value;
    horaParaMarcar = $('#aud-aid-time-input').val();
}

function changeSuggestedHearingType(evt) {
    var tipo = evt.currentTarget.selectedIndex;
    showHiddenInputs(tipo);
}

function showHiddenInputs(valor) {
    if (valor === 1) $('#aud-aid-special-weeks-form-container').show();
    else $('#aud-aid-special-weeks-form-container').hide();

    if (valor !== 5) $('#aud-aid-videocall-container').show();
    else $('#aud-aid-videocall-container').hide();
}

function buildSuggestion() {
    var tipo = $('#aud-aid-hearing-type-select').val();
    var type = '';
    var video = $('#aud-aid-video-call-checkbox')[0].checked;
    var agreementWeek = $('#aud-aid-agreement-week-radio')[0].checked;
    var executionWeek = $('#aud-aid-execution-week-radio')[0].checked;
    var rite = ritoParaMarcar;
    var phase = $('#aud-aid-process-phase').text().substr(7);
    var style = 'aud-aid-color-standard';

    switch (parseInt(tipo)) {
        case 1:
            type = "Conciliação ";
            rite = '';
            if (phase === "Conhecimento") phase = "em Conhecimento ";
            else phase = "em Execução ";
            break;
        case 2:
            type = "Inicial ";
            style = "aud-aid-color-inicial";
            phase = "";
            break;
        case 3:
            type = "Instrução ";
            style = "aud-aid-color-instrucao";
            phase = "";
            break;
        case 4:
            type = "Encerramento ";
            rite = '';
            phase = "";
            break;
        case 5:
            type = "Julgamento ";
            rite = '';
            phase = "";
            break;
        case 6:
            type = "Una ";
            style = 'aud-aid-color-una';
            phase = "";
            break;
        case 7:
            type = "Inquirição de testemunha ";
            style = "aud-aid-color-inquiricao";
            rite = '';
            phase = "";
            break;
        default:
            break;
    }

    if ((phase !== 'em Conhecimento ') && (phase !== 'em Execução ')) phase = '';

    if (rite === "ATSum") rite = " (rito sumaríssimo)";
    else rite = "";

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

function openSchedule() {
    var urlParaAbrir = '';
    if (urlAtual.includes("homologacao")) urlParaAbrir = 'https://pje-homologacao.trt9.jus.br/pjekz/pauta-audiencias';
    else if (urlAtual.includes("treinamento")) urlParaAbrir = 'https://pje-treinamento.trt9.jus.br/pjekz/pauta-audiencias';
    else urlParaAbrir = 'https://pje.trt9.jus.br/pjekz/pauta-audiencias';
    const win = window.open(urlParaAbrir, '_blank');
}

function validateBookHearing() {
    var errorCounter = 0;
    //CourtRoom
    if ($('#aud-aid-court-room-select').val() === null || $('#aud-aid-court-room-select').val() === undefined) {
        $('#aud-aid-court-room-select').addClass('aud-aid-error');
        // console.log("AudAid - Erro! Sala de Audiências não preenchida corretamente.", new Date());
        errorCounter++;
    } else $('#aud-aid-court-room-select').addClass('aud-aid-success');
    //Date
    if ($('#aud-aid-date-input').val() === null || $('#aud-aid-date-input').val() === undefined || $('#aud-aid-date-input').val() === '') {
        $('#aud-aid-date-input').addClass('aud-aid-error');
        // console.log("AudAid - Erro! Data não preenchida corretamente.", new Date());
        errorCounter++;
    } else $('#aud-aid-date-input').addClass('aud-aid-success');
    //Time
    if ($('#aud-aid-time-input').val() === null || $('#aud-aid-time-input').val() === undefined || $('#aud-aid-time-input').val() === '') {
        $('#aud-aid-time-input').addClass('aud-aid-error');
        // console.log("AudAid - Erro! Hora não preenchida corretamente.", new Date());
        errorCounter++;
    } else $('#aud-aid-time-input').addClass('aud-aid-success');
    //Type
    if ($('#aud-aid-hearing-type-select').val() === null || $('#aud-aid-hearing-type-select').val() === undefined) {
        $('#aud-aid-hearing-type-select').addClass('aud-aid-error');
        // console.log("AudAid - Erro! Tipo não preenchido corretamente.", new Date());
        errorCounter++;
    } else $('#aud-aid-hearing-type-select').addClass('aud-aid-success');

    if (errorCounter === 0) {
        // console.log("AudAid - Audiência validada! Vou preparar o JSON.", new Date());
        // preparePayload();
        checkAlreadyBookedHearing();
    }
}

async function checkAlreadyBookedHearing() {
    // var unbookHearingButton = $('pje-link-cancelamento-pauta-audiencia');
    // if (unbookHearingButton.length === 0) preparePayload();
    // else {
    //     if(confirm('Já existe uma audiência marcada para esse processo.\nPara prosseguir, é necessário desmarcar essa audiência.\nClique em OK para desmarcar e prosseguir, ou em Cancelar para cancelar para fazer manualmente?') === true) alert('Desmarcar');//desmarcar
    // }
    var idAlreadyBookedHearing = await getAlreadyBookedHearingId();

    if (idAlreadyBookedHearing != null) {
        if(confirm('Já existe uma audiência marcada para esse processo.\nPara prosseguir, é necessário desmarcar essa audiência.\nClique em OK para desmarcar e prosseguir, ou em Cancelar para cancelar para fazer manualmente?') === true) alert('Desmarcar');//desmarcar
    } else {
        preparePayload();
    }
}

function preparePayload() {
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

    var tipo = $('#aud-aid-hearing-type-select').val();
    var videoChecked = $('#aud-aid-video-call-checkbox')[0].checked;
    var agreementChecked = $('#aud-aid-agreement-week-radio')[0].checked;
    var executionChecked = $('#aud-aid-execution-week-radio')[0].checked;
    var phase = $('#aud-aid-process-phase').text().substr(7);

    if (videoChecked === null || videoChecked === undefined) videoChecked = false;
    if (agreementChecked === null || agreementChecked === undefined) agreementChecked = false;
    if (executionChecked === null || executionChecked === undefined) executionChecked = false;
    if (phase !== "Conhecimento") phase = "Execução";

    switch (parseInt(tipo)) {
        case 1: //Conciliação
            console.log("Entrei no case 1 Conciliação");
            if (phase === "Conhecimento") {
                console.log("Entrei no case 1 Conciliação - fase Conhecimento");
                if (agreementChecked) {
                    console.log("Entrei no case 1 Conciliação - fase conhecimento Semana Conciliação");
                    if (videoChecked) idTipo = "31";  //Conciliação em Conhecimento por videoconferência - Semana Nacional de Conciliação
                    else idTipo = "30";               //Conciliação em Conhecimento - Semana Nacional de Conciliação
                } else {
                    console.log("Entrei no case 1 Conciliação - fase conhecimento Semana Conciliação");
                    if (videoChecked) idTipo = "3";   //Conciliação em Conhecimento por videoconferência
                    else idTipo = "1";                //Conciliação em Conhecimento
                }
            } else if (phase === "Execução") {
                if (executionChecked) {
                    if (videoChecked) idTipo = "35";  //Conciliação em Execução por videoconferência - Semana Nacional de Execução
                    else idTipo = "34";               //Conciliação em Execução - Semana Nacional de Execução
                } else if (agreementChecked) {
                    if (videoChecked) idTipo = "33";  //Conciliação em Execução por videoconferência - Semana Nacional de Conciliação
                    else idTipo = "32";               //Conciliação em Execução - Semana Nacional de Conciliação
                } else {
                    if (videoChecked) idTipo = "19";  //Conciliação em Execução por videoconferência
                    else idTipo = "2";                //Conciliação em Execução
                }
            }
            break;
        case 2: //Inicial
            if (ritoParaMarcar === 'ATSum') {
                if (videoChecked) idTipo = "27";      //Inicial por videoconferência (rito sumaríssimo)
                else idTipo = "15";                   //Inicial (rito sumaríssimo)
            } else {
                if (videoChecked) idTipo = "20";      //Inicial por videoconferência
                else idTipo = "3";                    //Inicial
            }
            break;
        case 3: //Instrução
            if (ritoParaMarcar === 'ATSum') {
                if (videoChecked) idTipo = "25";      //Instrução por videoconferência (rito sumaríssimo)
                else idTipo = "11";                   //Instrução (rito sumaríssimo)
            } else {
                if (videoChecked) idTipo = "22";      //Instrução por videoconferência
                else idTipo = "6";                    //Instrução
            }
            break;
        case 4: //Encerramento de instrução
            if (videoChecked) idTipo = "23";          //Encerramento de instrução por videoconferência
            else idTipo = "9";                        //Encerramento de instrução
            break;
        case 5: //Julgamento
            idTipo = "4";                             //Julgamento
            // idTipo = "7";                             //Julgamento
            break;
        case 6: //Una
            if (ritoParaMarcar === 'ATSum') {
                if (videoChecked) idTipo = "29";      //Una por videoconferência (rito sumaríssimo)
                else idTipo = "17";                   //Una (rito sumaríssimo)
            } else {
                if (videoChecked) idTipo = "21";      //Una por videoconferência
                else idTipo = "5";                    //Una
            }
            break;
        case 7: //Inquirição de testemunha
            if (videoChecked) idTipo = "24";          //Inquirição de testemunha por videoconferência (juízo deprecado)
            else idTipo = "10";                       //Inquirição de testemunha (juízo deprecado)
            break;
        default:
            break;
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
    console.log("AudAid - PayloadJson pronto.", payloadJson, new Date());

    //Faz requisiçao POST para gravar a audiência
    let novoxhr = new XMLHttpRequest();
    novoxhr.open('POST', urlParaAbrir);
    novoxhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    novoxhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
    novoxhr.setRequestHeader('Accept-Language', 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3');
    novoxhr.setRequestHeader('Connection', 'keep-alive');
    novoxhr.setRequestHeader('Content-Length', new TextEncoder().encode(JSON.stringify(payloadJson)).length);
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
        if (responseJson.status === "Designada") {
            if (window.confirm("Audiência designada com sucesso!\nPara que a audiência fique visível, é necessário recarregar a página.\nDeseja fazer isso agora?")) {
                location.reload();
            }
        } else {
            if (responseJson.codigoErro === "PJE-063") alert(responseJson.mensagem);
        }
    }

    novoxhr.send(JSON.stringify(payloadJson));

    console.log(novoxhr);
}
//B72E00758DB0D927592ACA7054BB02B19FBAB809198E7DA55F4072406A13F62E2E0E88CA18F71480CEED538F3964EA815200 --> exemplo de token

function changeGigsSelect() {
    if (document.getElementById('aud-aid-append-gigs-select').selectedIndex === 3) {
        $('#aud-aid-observacao-input').removeAttr('disabled');
    } else {
        $('#aud-aid-observacao-input').attr('disabled', 'disabled');
        $('#aud-aid-observacao-input')[0].value = '';
    }
}

function criaGigs() {
    var urlParaAbrir = '';
    var urlHost = '';
    var urlOrigin = '';
    var urlReferer = '';
    var responseJson = '';
    var observacao = parseInt(document.getElementById('aud-aid-append-gigs-select').selectedIndex);

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
        urlReferer = 'https://pje.trt9.jus.br/pjekz/processo/1351163/' + idProcesso + '/detalhe';
    }

    console.log('observacao', observacao);
    switch (observacao) {
        case 1:
            observacao = "RJ1";
            break;
        case 2:
            observacao = "Cumprir";
            break;
        case 3:
            observacao = $('#aud-aid-observacao-input').val();
            break;
        default:
            break;
    }

    if (observacao !== 0) {
        var payloadJson = {
            "dataPrazo": "2022-07-08T03:00:00.000Z",
            "idProcesso": idProcesso,
            "observacao": observacao,
            "tipoAtividade": {
                "descricao": "Prazo",
                "id": 24
            }
        };
        console.log("AudAid - GIGS PayloadJson pronto.", payloadJson, new Date());

        //Faz requisiçao POST para gravar a audiência
        let novoxhr = new XMLHttpRequest();
        novoxhr.open('POST', urlParaAbrir);
        novoxhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
        novoxhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
        novoxhr.setRequestHeader('Accept-Language', 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3');
        novoxhr.setRequestHeader('Connection', 'keep-alive');
        novoxhr.setRequestHeader('Content-Length', new TextEncoder().encode(JSON.stringify(payloadJson)).length);
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
            if (responseJson.usuarioCriacao !== null) {
                if (window.confirm("Gigs criado com sucesso!\nPara que o Gigs fique visível, é necessário recarregar a página.\nDeseja fazer isso agora?")) {
                    location.reload();
                }
            }
        }

        novoxhr.send(JSON.stringify(payloadJson));

        console.log(novoxhr);
    } else alert('Não é pra criar GIGS!');

}

function getAlreadyBookedHearingId() {
    var urlParaAbrir = "https://pje-homologacao.trt9.jus.br/pje-comum-api/api/processos/id/"+parseInt(idProcesso)+"/audiencias?status=M"
    let novoxhr = new XMLHttpRequest();
    novoxhr.open('GET', urlParaAbrir);
    novoxhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    novoxhr.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
    novoxhr.setRequestHeader('Accept-Language', 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3');
    novoxhr.setRequestHeader('Connection', 'keep-alive');
    novoxhr.setRequestHeader('Cookie', document.cookie);
    novoxhr.setRequestHeader('Host', urlHost);
    novoxhr.setRequestHeader('Referer', urlReferer);
    novoxhr.setRequestHeader('TE', 'Trailers');
    novoxhr.setRequestHeader('User-Agent', window.navigator.userAgent);
    novoxhr.setRequestHeader('X-XSRF-TOKEN', document.cookie.substr(document.cookie.search('Xsrf-Token='), 111).split('=')[1]);

    novoxhr.onload = () => {
        console.log(JSON.parse(novoxhr.responseText));
        responseJson = JSON.parse(novoxhr.responseText);
        if (responseJson.status != null) {
            console.log(responseJson.id);
            return responseJson.id;
        } else {
            return null;
        }
    }

    novoxhr.send();

    console.log(novoxhr);
}