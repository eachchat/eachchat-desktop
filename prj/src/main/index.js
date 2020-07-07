import { app, BrowserWindow, Tray, Menu, dialog, shell} from 'electron'
import axios from "axios"
import fs from 'fs'
import * as path from 'path'
import {services } from '../packages/data/index.js';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let mainPageWindow
let soloPage
let favouriteDetailWindow
let reportRelationWindow
let appIcon = null;
let flashIconTimer = null;
let iconPath = "../../static/Img/Main/Close@3x.png";
let emptyIconPath = "../../static/Img/Main/Zoom@3x.png";
if (process.env.NODE_ENV === "development") {
  iconPath = "../../static/Img/Main/Close@3x.png";
  emptyIconPath = "../../static/Img/Main/Zoom@3x.png";
}

const Bobolink = require('bobolink');
const queue = new Bobolink({
  timeout: 2000,
  retry: 3,
  concurrency: 20,
  retryPrior: true,
  taskMode:Bobolink.TASK_MODE_FUNCTION,
});
let timeTmp = 0;
let countTmp = 1;

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const ipcMain = require('electron').ipcMain;
ipcMain.on('showMainPageWindow', function(event, arg) {
  mainPageWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width:960,
    webPreferences: {webSecurity:false},
    frame:false
  })
  mainWindow.close();
  const mainPageWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/main`
  : `file://${__dirname}/index.html#main`
  mainPageWindow.loadURL(mainPageWinURL);
  openDevToolsInDevelopment(mainPageWindow);
  // 托盘
  appIcon = new Tray(path.join(__dirname, iconPath));

  let contextMenu = Menu.buildFromTemplate([
    {
      label: "退出",
      click: function() {
        mainPageWindow.close();
      }
    }
  ]);

  appIcon.setToolTip("EachChat");
  appIcon.setContextMenu(contextMenu);

  appIcon.on("click", function() {
    showMain();
  });
});

ipcMain.on('showAnotherWindow', function(event, groupId, path) {
  soloPage = new BrowserWindow({
    height: 468,
    useContentSize: true,
    // resizable: false,
    width:600,
    webPreferences: {webSecurity:false},
    frame:false
  })
  const sonPageWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/` + path
  : `file://${__dirname}/index.html#` + path;
  soloPage.loadURL(sonPageWinURL);
  openDevToolsInDevelopment(soloPage);
  soloPage.webContents.on('did-finish-load', function() {
    soloPage.webContents.send("distGroupInfo", groupId);
  });
  soloPage.show();
});

ipcMain.on("transmitFromSoloDlg", function(event, transmitInfoStr) {
  console.log("=============== ", transmitInfoStr);
  mainPageWindow.webContents.send("transmitFromSoloDlg", transmitInfoStr);
  mainPageWindow.focus();
})

ipcMain.on('AnotherClose', function(event, arg) {
  soloPage.close();
});

ipcMain.on('AnotherMin', function(event, arg) {
  soloPage.minimize();
});
// 收藏详情窗口
ipcMain.on('showFavouriteDetailWindow', function(event, collectionInfo) {
    favouriteDetailWindow = new BrowserWindow({
    height: 468,
    resizable: false,
    width:600,
    webPreferences: {webSecurity:false},
    //frame:false,
    title:"收藏详情"
  })
  const favouriteDetailPageWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/` + 'favouriteDetail'
  : `file://${__dirname}/index.html#` + 'favouriteDetail';
  favouriteDetailWindow.loadURL(favouriteDetailPageWinURL);
  openDevToolsInDevelopment(favouriteDetailWindow);
  favouriteDetailWindow.webContents.on('did-finish-load', function() {
    favouriteDetailWindow.webContents.send("clickedCollectionInfo", collectionInfo);
  });
  favouriteDetailWindow.show();
});

ipcMain.on('favouriteDetailClose', function(event, arg) {
  favouriteDetailWindow.close();
});

ipcMain.on('favouriteDetailMin', function(event, arg) {
  favouriteDetailWindow.minimize();
});
// 汇报关系窗口
ipcMain.on('showReportRelationWindow', function(event, leaders) {
  reportRelationWindow = new BrowserWindow({
    height: 340,
    resizable: false,
    width: 520,
    webPreferences: {webSecurity:false},
    //frame:false,
    title:"汇报关系"
  })
  const reportRelationWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/` + 'reportRelationContent'
  : `file://${__dirname}/index.html#` + 'reportRelationContent';
  reportRelationWindow.loadURL(reportRelationWinURL);
  openDevToolsInDevelopment(reportRelationWindow);
  reportRelationWindow.webContents.on('did-finish-load', function() {
    reportRelationWindow.webContents.send("clickedReportRelationInfo", leaders);
  });
  reportRelationWindow.show();
});
// 闪烁任务栏
ipcMain.on("flashIcon", () => {
  if (!mainPageWindow.isVisible()) {
    clearFlashIconTimer();
    let count = 0;
    flashIconTimer = setInterval(function() {
      count++;
      if (count % 2 === 0) {
        appIcon.setImage(path.join(__dirname, emptyIconPath));
      } else {
        appIcon.setImage(path.join(__dirname, iconPath));
      }
    }, 500);
  }
});

function showMain() {
  mainPageWindow.show();

  clearFlashIconTimer();
  appIcon.setImage(path.join(__dirname, iconPath));
}

function clearFlashIconTimer() {
  if (flashIconTimer) {
    clearInterval(flashIconTimer);
  }
}

const downloadingList = [];

function downloadFile(event, arg) {
  return function f() {
    return new Promise(resolve => {
      // console.log("args is ", arg);
      var timelineID = arg[0];
      var token = arg[1];
      var hostname = arg[2];
      var port = arg[3];
      var distPath = arg[4];
      var distTemp = distPath + "_tmp";
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
          // console.log("sender get is ", ret);
          ret.data.pipe(fs.createWriteStream(distTemp))
          .on('finish', function() {
            try{
              if(fs.existsSync(distPath)) {
                // fs.unlinkSync(distPath);
                resolve(arg);
              }
              fs.renameSync(distTemp, distPath);
              if(needOpen) {
                shell.openExternal(distPath);
              }
              // console.log("sender is ", event.sender);
              // let a = (new Date()).getTime();
              // console.log(countTmp + "~" + (a - timeTmp) + "： downloadFile distPath is ", distPath);
              // timeTmp = a;
              // countTmp += 1;
              event.sender.send('updateMsgFile', [true, '', timelineID, distPath]);
              resolve(true);
            }
            catch(e) {
              console.log("rename file failed and details is ", e);
            }
          });
        });
    })
  }
}

ipcMain.on("download-file", function(event, arg) {
  // [timelineId, this.data.login.access_token, this.config.hostname, this.config.apiPort, targetPath]
  // console.log("get download file and put queue ", arg);
  queue.put(downloadFile(event, arg));
});

function downloadAvarar(event, arg) {
  return function f() {
    return new Promise(resolve => {
      // console.log("args is ", arg);
      var baseURL = arg[0];
      var groupId = arg[1];
      // console.log("downloadingList is ", downloadingList);
      var token = arg[2];
      var distPath = arg[3];
      var distTemp = distPath + "_tmp";
      // console.log("distPath is ", distPath);
    
      if(downloadingList.indexOf(baseURL) != -1){
        return;
      }
      downloadingList.push(baseURL);
      var headers={Authorization:"Bearer " + token};
      var appendix = {
              timeout: 35000,
              responseType: "stream"
          };
      var config = Object.assign({
        headers: headers,
      }, appendix);
      axios.get(baseURL,config)
        .then(function (ret) {
          ret.data.pipe(fs.createWriteStream(distTemp)
            .on('finish', function() {
              try {
                if(fs.existsSync(distPath)) {
                  // fs.unlinkSync(distPath);
                  resolve(true);
                }
                fs.renameSync(distTemp, distPath);
                var index = downloadingList.indexOf(baseURL);
                downloadingList.splice(index, 1);
                // let a = (new Date()).getTime();
                // console.log(countTmp + "~" + (a - timeTmp) + "： downloadAvarar distPath is ", distPath);
                // timeTmp = a;
                // countTmp += 1;
                event.sender.send('updateGroupImg', [true, '', groupId, distPath]);
                resolve(true);
              }
              catch(e) {
                console.log("rename file failed and details is ", e);
              }
            }));
        });
    }).then(ret => {
      console.log("====ret is ", ret);
    });
  };
}

ipcMain.on("download-avarar", function(event, arg) {
  let baseURL = arg[0];
  queue.put(downloadAvarar(event, arg));
});

function downloadUserAvarar(event, arg) {
  return function f() {
    return new Promise(resolve => {
      var baseURL = arg[0];
      // console.log("downloadingList is ", downloadingList);
      var userId = arg[1];
      var token = arg[2];
      var distPath = arg[3];
      var distTemp = distPath + "_tmp";
      // console.log("distPath is ", distPath);
    
      if(downloadingList.indexOf(baseURL) != -1){
        return;
      }
      downloadingList.push(baseURL);
      var headers={Authorization:"Bearer " + token};
      var appendix = {
              timeout: 35000,
              responseType: "stream"
          };
      var config = Object.assign({
        headers: headers,
      }, appendix);
      axios.get(baseURL,config)
        .then(function (ret) {
          ret.data.pipe(fs.createWriteStream(distTemp)
            .on('finish', function() {
              try{
                if(fs.existsSync(distPath)) {
                  // fs.unlinkSync(distPath);
                  resolve(true);
                }
                fs.renameSync(distTemp, distPath);
                var index = downloadingList.indexOf(baseURL);
                downloadingList.splice(index, 1);
                // let a = (new Date()).getTime();
                // console.log(countTmp + "~" + (a - timeTmp) + "： downloadUserAvarar distPath is ", distPath);
                // timeTmp = a;
                // countTmp += 1;
                event.sender.send('updateUserImage', [true, '', userId, distPath]);
                resolve(true);
              }
              catch(e) {
                console.log("rename file failed and details is ", e);
              }
            }));
        });
    }).then(ret => {
      console.log("====ret is ", ret);
    });
  };
}

ipcMain.on("download-user-avarar", function(event, arg) {
  let baseURL = arg[0];
  queue.put(downloadUserAvarar(event, arg));
});

function downloadImage(event, arg) {
  return function f() {
    return new Promise(resolve => {
      // console.log("download-image arg is ", arg);
      var timelineID = arg[0];
      var token = arg[1];
      var hostname = arg[2];
      var port = arg[3];
      var distPath = arg[4];
      var distTemp = distPath + "_tmp";
      var thumbType = arg[5];
      var needOpen = arg[6];
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
          // console.log("sender get is ", ret);
          ret.data.pipe(fs.createWriteStream(distTemp)
            .on('finish', function() {
              try{
                if(fs.existsSync(distPath)) {
                  // fs.unlinkSync(distPath);
                  resolve(true);
                }
                fs.renameSync(distTemp, distPath);
                // let a = (new Date()).getTime();
                // console.log(countTmp + "~" + (a - timeTmp) + "： downloadImage distPath is ", distPath);
                // timeTmp = a;
                // countTmp += 1;
                event.sender.send('updateMsgFile', [true, '', timelineID, distPath, needOpen]);
                resolve(true);
              }
              catch(e) {
                console.log("rename file failed and details is ", e);
              }
            }));
        });
    }).then(ret => {
      console.log("====ret is ", ret);
    });
  };
}

ipcMain.on("download-image", function(event, arg) {
  //  [timelineId, this.data.login.access_token, this.config.hostname, this.config.apiPort, targetPath, thumbnailType])
  console.log("download-image arg is ", arg);
  queue.put(downloadImage(event, arg));
});

function downloadMsgOImage(event, arg) {
  return function f() {
    return new Promise(resolve => {
      var timelineID = arg[0];
      var token = arg[1];
      var hostname = arg[2];
      var port = arg[3];
      var distPath = arg[4];
      var distTemp = distPath + "_tmp";
      var thumbType = arg[5];
      var needOpen = arg[6];
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
    
      // console.log("updateShowImage distpath get is ", distPath);
      sender.get(path, config)
        .then(function (ret) {
          // console.log("sender get is ", ret);
          ret.data.pipe(fs.createWriteStream(distTemp)
            .on('finish', function() {
              try{
                if(fs.existsSync(distPath)) {
                  // fs.unlinkSync(distPath);
                  resolve(true);
                }
                fs.renameSync(distTemp, distPath);
                // let a = (new Date()).getTime();
                // console.log(countTmp + "~" + (a - timeTmp) + "： downloadMsgOImage distPath is ", distPath);
                // timeTmp = a;
                // countTmp += 1;
                event.sender.send('updateShowImage', [true, '', timelineID, distPath, needOpen]);
                resolve(true);
              }
              catch(e) {
                console.log("rename file failed and details is ", e);
              }
            }));
        });
    }).then(ret => {
      console.log("====ret is ", ret);
    });
  };
}

ipcMain.on("download-mgs-oimage", function(event, arg) {
  // console.log("=============================")
  //  [timelineId, this.data.login.access_token, this.config.hostname, this.config.apiPort, targetPath, thumbnailType])
  queue.put(downloadMsgOImage(event, arg));
});

ipcMain.on('open-directory-dialog', function(event, arg) {
  dialog.showOpenDialog({
    properties: [arg, 'multiSelections']
  },function(files) {
    if(files && files.length > 0) {
      event.sender.send('selectedItem', files);
    }
  })
});

ipcMain.on('modifyGroupImg', function(event, arg) {
  var groupId = arg[0];
  var distPath = arg[1];
  event.sender.send('updateGroupImg', [true, '', groupId, distPath]);
});

ipcMain.on('win-close', function(event, arg) {
  mainPageWindow.hide();
});

ipcMain.on('win-min', function(event, arg) {
  mainPageWindow.minimize();
});

ipcMain.on('win-max', function(event, arg) {
  if(mainPageWindow.isMaximized()) {
    mainPageWindow.unmaximize();
  }
  else {
    mainPageWindow.maximize();
  }
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
