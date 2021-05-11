const {BrowserWindow} = require('electron')
import {ThirdPartyWindowBuilder} from "./thirdpartybuilder.js"
class ChildWindow{
    constructor(){
        this.childWindow = undefined;
    }

    static createBrowser(iconPath){
        if(this.childWindow) return this.childWindow;
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
        return this.childWindow;
    }
}

createChildWindow(mainwindowArgs){
    let mainWindow = mainwindowArgs.mainWindow;
    let isLogin = mainwindowArgs.isLogin;
    let childRenderWindowBrowser = mainwindowArgs.childBrowser;
    let ipcArg = mainwindowArgs.ipcArg;
    let type = ipcArg.type;

    console.log("createChildWindow-------------", ipcArg)
    switch(type){
      case "thirdpartywindow":{
        let thirdpartywindow = new ThirdPartyWindowBuilder(childRenderWindowBrowser, mainWindow);
        thirdpartywindow.setArgs(ipcArg);
        thirdpartywindow.build();
        if(!isLogin){
          mainWindow.hide();
        }
        break;
      }
      default:
        break;
    }
    childRenderWindowBrowser.on('close', (event) => {
      if(clickQuit){
        app.quit();
        return;
      }
      event.preventDefault();
      childRenderWindowBrowser.hide();
      mainWindow.show();
    })
}

export{
    ChildWindow,
    createChildWindow
}