const {BrowserWindow} = require('electron')
import {ThirdPartyWindowBuilder} from "./thirdpartybuilder.js"
import {FavouriteDetailWindowBuilder} from "./favouritedetailbuilder.js"
import {ReleationShipWindowBuilder} from "./relationshipbuilder.js"
class ChildWindow{
    constructor(){

    }

    createBrowser(iconPath){
        return new BrowserWindow({     
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
}

function createChildWindow(mainwindowArgs){
    console.log("createChildWindow", mainwindowArgs);

    let mainWindow = mainwindowArgs.mainWindow;
    let isLogin = mainwindowArgs.isLogin;
    let thirdpartyWindowBrowser = mainwindowArgs.thirdpartyBrowser;
    let childRenderWindowBrowser = mainwindowArgs.childBrowser;
    let ipcArg = mainwindowArgs.ipcArg;
    let type = ipcArg.type;
    let clickQuit = mainwindowArgs.clickQuit;

    console.log("createChildWindow-------------", ipcArg)
    switch(type){
      case "thirdpartywindow":{
        let thirdpartywindow = new ThirdPartyWindowBuilder(thirdpartyWindowBrowser, mainWindow);
        thirdpartywindow.setArgs(ipcArg);
        thirdpartywindow.build();
        if(!isLogin){
          mainWindow.hide();
        }
        break;
      }

      case "favouritedetailwindow":{
        console.log("favouritedetailwindow")
        let favouritedetailwindow = new FavouriteDetailWindowBuilder(childRenderWindowBrowser, mainWindow);
        favouritedetailwindow.setArgs(ipcArg);
        favouritedetailwindow.build();
        break;
      }

      case "showReportRelationWindow":{
        let ReleationShipWindow = new ReleationShipWindowBuilder(childRenderWindowBrowser, mainWindow);
        ReleationShipWindow.setArgs(ipcArg);
        ReleationShipWindow.build();
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