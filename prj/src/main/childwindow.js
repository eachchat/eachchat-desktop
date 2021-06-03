const {BrowserWindow} = require('electron')
import {ThirdPartyWindowBuilder} from "./thirdpartybuilder.js"
import {FavouriteDetailWindowBuilder} from "./favouritedetailbuilder.js"
import {ReleationShipWindowBuilder} from "./relationshipbuilder.js"
import {VideoChatWindowBuilder} from "./videochatbuilder.js"
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

    CreateThirdPartyBrowser(iconPath){
      return this.createBrowser(iconPath);
    }


    CreateChildRenderBrowser(iconPath){
      let browser = this.createBrowser(iconPath);
      const childwindowURL = process.env.NODE_ENV === 'development'
      ? `http://localhost:9080/#/childwindow`
      : `file://${__dirname}/index.html#childwindow`;
      browser.loadURL(childwindowURL);
      return browser;
    }

    CreateVoipBrowser(iconPath){
      let browser = this.createBrowser(iconPath);
      const voipwindowURL = process.env.NODE_ENV === 'development'
      ? `http://localhost:9080/#/voipwindow`
      : `file://${__dirname}/index.html#voipwindow`;
      browser.loadURL(voipwindowURL);
      return browser;
    }
    
}

function createChildWindow(mainwindowArgs){
    console.log("createChildWindow", mainwindowArgs);

    let mainWindow = mainwindowArgs.mainWindow;
    let isLogin = mainwindowArgs.isLogin;
    let thirdpartyWindowBrowser = mainwindowArgs.thirdpartyBrowser;
    let childRenderWindowBrowser = mainwindowArgs.childBrowser;
    let voipRenderWindowBrowser = mainwindowArgs.voipBrowser;
    let ipcArg = mainwindowArgs.ipcArg;
    let type = ipcArg.type;

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

      case "videoChatWindow":{
        let VideoChatWindow = new VideoChatWindowBuilder(voipRenderWindowBrowser, mainWindow);VideoChatWindow.setArgs(ipcArg);
        VideoChatWindow.build();
        break;
      }
      
      default:
        break;
    }
}

export{
    ChildWindow,
    createChildWindow
}