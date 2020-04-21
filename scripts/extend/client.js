var GreenTime = {

    ShowGreenPassView: function () {
        console.warn('GreenTime detected a blacklisted url');
        
        document.body.classList.add('GreenTime__Enabled');



        GreenTime.DefneCssClassBody();
        document.body.classList.add('GreenTime__Body');

        GreenTime.DefneCssClassBodyBlur('1px');
        document.body.classList.add('GreenTime__BodyBlur');
        
        var iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL('views/green-pass.html');;
        iframe.id = "GreenTimeIframe";
        iframe.frameBorder="0"
        iframe.style.cssText = 'position:fixed;top:0;left:0;display:block;' +
            'width:100vw;height:100vh;z-index:1000;';
        iframe.allowtransparency = "true";
        document.body.prepend(iframe);
    },

    DefineCssClass: function (selector,content) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `${selector} { ${content} }`;
        document.getElementsByTagName('head')[0].appendChild(style);
    },

    DefneCssClassBodyBlur : function(blurLevel){
        GreenTime.DefineCssClass(".GreenTime__BodyBlur *:not(#GreenTimeIframe)",`
            -webkit-filter: blur(${blurLevel});
            -moz-filter: blur(${blurLevel});
            -ms-filter: blur(${blurLevel});
            -o-filter: blur(${blurLevel});
            filter: blur(${blurLevel});
            overflow:hidden;
            `
        );
    },
    DefneCssClassBody : function(){
        GreenTime.DefineCssClass(".GreenTime__Body",`
                overflow:hidden;
            `
        );
    }
}