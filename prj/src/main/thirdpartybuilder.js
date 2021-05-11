const {BrowserView} = require('electron')
import log from 'electron-log';
import {RenderWindowBuilder} from './renderbuilder'

class ThirdPartyWindowBuilder extends RenderWindowBuilder{
    constructor(childWindow, mainWindow){
        super(childWindow, mainWindow);
        this.width = 0;
        this.height = 0;
        this.browserViewUrl = '';
    }

    setArgs(args){
        this.size = args.size;
        this.width = this.size.width;
        this.height = this.size.height;
        this.browserViewUrl = args.browserViewUrl;
    }

    loadUrl(){
        const pageUrl = process.env.NODE_ENV === 'development'
      ? `http://localhost:9080/#/` + 'thirdpartyBind'
      : `file://${__dirname}/index.html#` + 'thirdpartyBind';
        this.childWindow.loadURL(pageUrl);
    }

    createWebViewWindow(url){
        let webView = new BrowserView();
        let oldWebView = this.childWindow.getBrowserView();
        console.log("oldwebView", oldWebView)
        if(oldWebView == null){
            this.childWindow.setBrowserView(webView);
        }
        else{
            this.childWindow.removeBrowserView(oldWebView);
            this.childWindow.setBrowserView(webView);
        }
        
        webView.setBounds({x:0, y:0, width:this.width, height:this.height});
        webView.setAutoResize({width: true,
                                    height: true,
                                    horizontal: true,
                                    vertical: true});

        webView.webContents.loadURL(url);
        webView.webContents.on("did-frame-navigate", 
        (event, 
        url,
        isInPlace,
        isMainFrame,
        frameProcessId,
        frameRoutingId) =>{
            log.info("did-redirect-navigation: " + url)
            if(this.aliPayCodeCheck(url)) return;
            if(this.weChatCodeCheck(url)) return;
        })
    }

    aliPayCodeCheck(url) {
        let nIndex = url.indexOf("auth_code=");
        if(nIndex == -1) return false;
        let authCode = url.slice(nIndex + 10);
        this.mainWindow.webContents.send("alipay-authcode", authCode);
        this.childWindow.hide();
        return true;
    }

    weChatCodeCheck(url) {
        let nIndex = url.indexOf("code=");
        if(nIndex == -1) return false;
        let endIndex = url.indexOf("&", nIndex);
        let authCode = url.slice(nIndex + "code=".length, endIndex);
        this.mainWindow.webContents.send("wechat-authcode", authCode);
        this.childWindow.hide();
        return true;
    }

    build(){
        this.setWindowSize(this.size);
        this.loadUrl();
        this.createWebViewWindow(this.browserViewUrl);
        this.showWindow();
    }
}

export{
    ThirdPartyWindowBuilder
}