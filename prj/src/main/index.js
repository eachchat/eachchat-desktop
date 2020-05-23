import { app, BrowserWindow, Menu, dialog, shell} from 'electron'
import axios from "axios"
import fs from 'fs'
import {services } from '../packages/data/index.js';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const ipcMain = require('electron').ipcMain;
ipcMain.on('showMainPageWindow', function(event, arg) {
  mainWindow.close();
  let mainPageWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width:960,
    webPreferences: {webSecurity:false},
    frame:false
  })
  const mainPageWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/main`
  : `file://${__dirname}/index.html#main`
  mainPageWindow.loadURL(mainPageWinURL);
  openDevToolsInDevelopment(mainPageWindow);
});

const downloadingList = [];

ipcMain.on("download-file", function(event, arg) {
  // [timelineId, this.data.login.access_token, this.config.hostname, this.config.apiPort, targetPath]
  var timelineID = arg[0];
  var token = arg[1];
  var hostname = arg[2];
  var port = arg[3];
  var distPath = arg[4];
  var needOpen = arg[5]; 
  var baseURL = "http://" + hostname;

  if (typeof port == "number") {
    port = port;
  }

  var sender = axios.create({
    baseURL: baseURL + ":" + String(port)
  });

  var path = "/api/services/file/v1/dfs/download/" + String(timelineID);
  var headers = {
    Authorization: "Bearer " + token
  };
  var appendix = {
    timeout: 35000,
    responseType: "stream"
  };

  var config = Object.assign({
    headers: headers,
  }, appendix);

  sender.get(path, config)
    .then(function (ret) {
      console.log("sender get is ", ret);
      ret.data.pipe(fs.createWriteStream(distPath));
      if(needOpen) {
        shell.openExternal(distPath);
      }
    });
});

ipcMain.on("download-avarar", function(event, arg) {
  var baseURL = arg[0];
  console.log("downloadingList is ", downloadingList);
  if(downloadingList.indexOf(baseURL) != -1){
    return;
  }
  var token = arg[1];
  var distPath = arg[2];
  var distTemp = distPath + "_tmp";
  console.log("distPath is ", distPath);

  var headers={Authorization:"Bearer " + token};
  var appendix = {
          timeout: 35000,
          responseType: "stream"
      };
  var config = Object.assign({
    headers: headers,
  }, appendix);
  downloadingList.push(baseURL);
  axios.get(baseURL,config)
    .then(function (ret) {
      ret.data.pipe(fs.createWriteStream(distTemp)
        .on('finish', function() {
          if(!fs.existsSync(distTemp)) {
            return;
          }
          fs.rename(distTemp, distPath);
          var index = downloadingList.indexOf(baseURL);
          downloadingList.splice(index, 1);
        }));
    });
});

ipcMain.on("download-image", function(event, arg) {
  //  [timelineId, this.data.login.access_token, this.config.hostname, this.config.apiPort, targetPath, thumbnailType])
  var timelineID = arg[0];
  var token = arg[1];
  var hostname = arg[2];
  var port = arg[3];
  var distPath = arg[4];
  var distTemp = distPath + "_tmp";
  var thumbType = arg[5];
  var baseURL = "http://" + hostname;

  if (typeof port == "number") {
    port = port;
  }

  var sender = axios.create({
    baseURL: baseURL + ":" + String(port)
  });

  var path = "/api/services/file/v1/dfs/thumbnail/" + String(thumbType) + "/" + String(timelineID);
  var headers = {
    Authorization: "Bearer " + token
  };
  var appendix = {
    timeout: 35000,
    responseType: "stream"
  };

  var config = Object.assign({
    headers: headers,
  }, appendix);

  sender.get(path, config)
    .then(function (ret) {
      console.log("sender get is ", ret);
      ret.data.pipe(fs.createWriteStream(distTemp)
        .on('finish', function() {
          fs.rename(distTemp, distPath);
        }));
    });
});

ipcMain.on('open-directory-dialog', function(event, arg) {
  dialog.showOpenDialog({
    properties: [arg, 'multiSelections']
  },function(files) {
    if(files.length != 0) {
      event.sender.send('selectedItem', files);
    }
  })
});

function createWindow () {
  /**
   * Initial window options
   */
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    height: 340,
    useContentSize: true,
    width: 600,
    /**
     * Across Domains Problem
     */
    webPreferences: {webSecurity:false}
  })

  mainWindow.loadURL(winURL);
  openDevToolsInDevelopment(mainWindow);
}
function openDevToolsInDevelopment(mainWindow) {
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.openDevTools()
  })
  // Open dev tools initially when in development mode
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.on("did-frame-finish-load", () => {
    mainWindow.webContents.once("devtools-opened", () => {
    mainWindow.focus();
    });
    mainWindow.webContents.openDevTools();
    });
  }
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
