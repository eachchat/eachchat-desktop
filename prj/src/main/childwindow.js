const {BrowserWindow,BrowserView, ipcMain} = require('electron')
import log from 'electron-log';

class ChildWindow{
    constructor(){
        this.childWindow = undefined;
    }

    createChildWindow(iconPath){
        this.childWindow = new BrowserWindow({     
            resizable: true,
            webPreferences: {
                webSecurity:false,
                nodeIntegration:true,
                enableRemoteModule: true
            },
            show: false,
            frame:true,
            icon: iconPath,
        });
    }

    setWindowSize(size){
        this.width = size.width;
        this.height = size.height;
        this.childWindow.setSize(size.width, size.height);
    }

    loadUrl(url){
        this.childWindow.loadURL(url);
    }

    setMainWindow(mainWindow){
        this.mainWindow = mainWindow;
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

    showWindow(){
        this.childWindow.show();
    }

    setWebViewUrl(url){

    }
}

export{
    ChildWindow
}