const {BrowserWindow,BrowserView, ipcMain} = require('electron')
import {globalShortcut} from 'electron'
import log from 'electron-log';

class ChildWindow{
    constructor(){
        this.childWindow = undefined;
        this.webView = undefined;
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
        this.webView = new BrowserView();
        this.childWindow.setBrowserView(this.webView);
        this.webView.setBounds({x:0, y:0, width:this.width, height:this.height});
        this.webView.setAutoResize({width: true,
                                    height: true,
                                    horizontal: true,
                                    vertical: true});

        this.webView.webContents.loadURL(url);
        this.webView.webContents.on("did-redirect-navigation", 
        (event, 
        url,
        isInPlace,
        isMainFrame,
        frameProcessId,
        frameRoutingId) =>{
            log.info("did-redirect-navigation: " + url)
            let nIndex = url.indexOf("auth_code=");
            if(nIndex == -1) return;
            let authCode = url.slice(nIndex + 10);
            this.mainWindow.webContents.send("alipay-authcode", authCode);
            this.webView.webContents.clearHistory();
            this.webView.webContents.session.clearCache();
            this.childWindow.hide();
        })
    }

    showWindow(){
        this.childWindow.show();
        this.childWindow.webContents.openDevTools();
    }
}

export{
    ChildWindow
}