const {BrowserWindow,BrowserView, ipcMain} = require('electron')

class ChildWindow{
    constructor(){
        this.childWindow = undefined;
        this.webView = undefined;
    }

    createChildWindow(){
        this.childWindow = new BrowserWindow({     
            resizable: true,
            webPreferences: {
                webSecurity:false,
                nodeIntegration:true,
                enableRemoteModule: true
            },
            show: false,
            frame:true
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

        this.webView.webContents.loadURL(url).then(res => {
            console.log("createWebViewWindow------------")
            console.log(res)
        });
        this.webView.webContents.on("did-redirect-navigation", 
        (event, 
        url,
        isInPlace,
        isMainFrame,
        frameProcessId,
        frameRoutingId) =>{
            console.log("did-redirect-navigation")
            console.log(url)
            this.mainWindow.webContents.send("alipay-authcode", url);
        })
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