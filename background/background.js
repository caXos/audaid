// browser.runtime.onInstalled.addListener(function(details) {
//     console.log(details);
// 	if(details.reason === "install"){
// 		//Ao instalar a extens�o
// 		openTerms();
// 	}else if(details.reason === "update"){		
		
// 		browser.storage.local.get('concordo', function(result){
// 			if (!result.concordo) {
// 				openTerms();
// 			}
// 		});
		
// 	}
// });

function notificacao(titulo, mensagem){
    // browser.notifications.create('onInstalled', {
    //     title: `Runtime Examples version:`,
    //     message: `${browser.storage.local.get('concordo')}`,
    //     // message: `${JSON.stringify(details)}`,
    //     type: 'basic'
    //   });
    browser.notifications.create('', {
        title: `${titulo}`,
        message: `${mensagem}`,
        type: 'basic'
    });
}

function openTerms() {
    // browser.tabs.create({
    //   url: "https://example.com",
    //  active: true
    // });
    browser.tabs.create({
        url: browser.runtime.getURL('termos/termos.html'),
        active: true
     });
  }

function handleInstalled(details) {
    browser.storage.local.get('concordo', function(result){
        /*
        por algum motivo, neste momento não tem como usar console.log.
        por isso, usar a função notificacao abaixo para ver se a pessoa já concordou com os termos
        (ou seja, browser.storage.local.get.concordo = true)
        */
        // notificacao('Pegou os termos?',JSON.stringify(result));

        if (!result.concordo) {
            openTerms();
        }
    });
  }
  
  
  browser.runtime.onInstalled.addListener(handleInstalled);
  
