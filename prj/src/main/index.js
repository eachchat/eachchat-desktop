import { app, BrowserWindow, Tray, Menu, dialog, shell, screen, DownloadItem, Notification} from 'electron'
import axios from "axios"
import fs from 'fs'
import * as path from 'path'
import {services } from '../packages/data/index.js';
import {ClearDB} from '../packages/core/Utils.js';

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
let iconPath 
let soundPath
let notificationIco
let notification = null
var leaveInter, trayBounds, point, isLeave = true;
let emptyIconPath;
let isLogin = false;
if (process.env.NODE_ENV === "development") {
  iconPath = "../../static/Img/Main/logo@2x.ico";
  if(process.platform == 'darwin'){
    iconPath = "../../static/Img/Main/macMenuIcon.png";
  }
  
  emptyIconPath = "../../static/Img/Main/logo-empty.ico";
  soundPath = "../../static/sound.wav";
  notificationIco = "../../static/Img/Main/logo@2x.png";
}else{
  iconPath = "/static/Img/Main/logo@2x.ico";
  if(process.platform == 'darwin'){
    iconPath = "/static/Img/Main/macMenuIcon.png";
  }
  emptyIconPath = "/static/Img/Main/logo-empty.ico";
  soundPath = "/static/sound.wav";
  notificationIco = "/static/Img/Main/logo@2x.png";
}

let resizableValue = false;

const Bobolink = require('bobolink');
const queue = new Bobolink({
  timeout: 2000,
  retry: 3,
  concurrency: 20,
  retryPrior: true,
  taskMode:Bobolink.TASK_MODE_FUNCTION,
  newPrior: true,
});
let timeTmp = 0;
let countTmp = 1;

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const ipcMain = require('electron').ipcMain;
ipcMain.on('showMainPageWindow', function(event, arg) {
  mainPageWindow = new BrowserWindow({
    minHeight:600,
    minWidth:960,
    height: 600,
    useContentSize: true,
    width:960,
    webPreferences: {webSecurity:false},
    frame:false
  })
  isLogin = true;
  const mainPageWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/main`
  : `file://${__dirname}/index.html#main`
  mainPageWindow.hide();
  mainPageWindow.loadURL(mainPageWinURL);
  mainPageWindow.webContents.on('dom-ready', function(){
    mainWindow.close();
    mainPageWindow.show();
  });
  openDevToolsInDevelopment(mainPageWindow);
  // 托盘
  appIcon = new Tray(path.join(__dirname, iconPath));

  appIcon.on('mouse-move', function(event, position){
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&7")
    // if(isLeave) {
    //   console.log("****************************************")
    //   isLeave = false;
    //   checkTrayLeave();
    // }
  });

  let contextMenu = Menu.buildFromTemplate([
    {
      label: "退出",
      click: function() {
        app.quit();
      }
    }
  ]);

  appIcon.setToolTip("EachChat");
  appIcon.setContextMenu(contextMenu);

  appIcon.on("click", function() {
    showMain();
  });

  // setAutoRun(true);
});

ipcMain.on("updateUnreadCount", function(event, arg) {
  console.log("==========arg ", arg);
  if(process.platform == 'darwin' && arg != null){
    if(arg == 0) {
      app.dock.setBadge("");
    }
    else {
      app.dock.setBadge(arg.toString());
    }
  }
})

ipcMain.on("token-expired", function(event, arg) {
  console.log("logout")
  let config = {
    hostname: '139.198.15.253',
    apiPort: 8888,
  };
  if(process.platform == 'darwin' && arg != null){
    app.dock.setBadge("");
  }
  services.common.init();
  services.common.logout();
  // services.common.closemqtt();
  Menu.setApplicationMenu(null)
  queue.destory();
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,//添加这个即可
    },
    height: 420,
    useContentSize: true,
    width: 360,
    frame: false,
    resizable: resizableValue,
    /**
     * Across Domains Problem
     */
    webPreferences: {webSecurity:false}
  })
  mainWindow.hide();
  mainPageWindow.close();
  appIcon.destroy();
  mainWindow.loadURL(winURL);
  openDevToolsInDevelopment(mainWindow);
  
  mainWindow.webContents.on('dom-ready', function(){
    mainWindow.show();            
  });
  isLogin = false;
})

ipcMain.on('showLoginPageWindow', function(event, arg) {
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,//添加这个即可
    },
    height: 420,
    useContentSize: true,
    width: 360,
    frame: false,
    resizable: resizableValue,
    /**
     * Across Domains Problem
     */
    webPreferences: {webSecurity:false}
  })
  mainWindow.hide();
  mainPageWindow.close();
  appIcon.destroy();
  mainWindow.loadURL(winURL);
  openDevToolsInDevelopment(mainWindow);
  isLogin = false;
  queue.destory();
  mainWindow.webContents.on('dom-ready', function(){
    mainWindow.show();            
  });
  if(process.platform == 'darwin' && arg != null){
    app.dock.setBadge("");
  }
});

ipcMain.on('setAutoRun', function(event, isAutoRun) {
  app.setLoginItemSettings({
    openAtLogin: isAutoRun,
    openAsHidden: isAutoRun,
  })
});

ipcMain.on('showAnotherWindow', function(event, groupId, path) {
  var title = "";
  if(path == "historyMsgList") {
    title = "聊天记录";
  }
  else if(path == "fileList") {
    title = "文件列表";
  }
  else if(path == "searchMessageList") {
    title = "聊天记录";
  }
  else if(path == "searchFilesList") {
    title = "文件列表";
  }
  else if(path == "TransmitMsgList") {
    title = "聊天记录";
  }
  soloPage = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,//添加这个即可
    },
    height: 508,
    //useContentSize: true,
    resizable: resizableValue,
    width:615,
    webPreferences: {webSecurity:false},
    frame:true,
    title:title
  })
  const sonPageWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/` + path
  : `file://${__dirname}/index.html#` + path;
  soloPage.loadURL(sonPageWinURL);
  //openDevToolsInDevelopment(soloPage);
  soloPage.webContents.on('did-finish-load', function() {
    soloPage.webContents.send("distGroupInfo", groupId);
  });
  soloPage.show();
});

ipcMain.on('searchAddedMembers', function(event, selectedGroupIds) {
  soloPage.webContents.send("searchAddedMembers", selectedGroupIds);
  soloPage.focus();
})

ipcMain.on('searchAddedSenders', function(event, selectedSenderIds) {
  soloPage.webContents.send("searchAddedSenders", selectedSenderIds);
  soloPage.focus();
})

ipcMain.on('SearchAddSender', function(event, selectedSenderIds) {
  mainPageWindow.webContents.send("SearchAddSenders", selectedSenderIds);
  mainPageWindow.focus();
})

ipcMain.on("SearchAddGroup", function(event, selectedGroupIds) {
  mainPageWindow.webContents.send("SearchAddGroup", selectedGroupIds);
  mainPageWindow.focus();
})

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
      webPreferences: {
        nodeIntegration: true,//添加这个即可
      },
    height: 468,
    resizable: resizableValue,
    width:600,
    webPreferences: {webSecurity:false},
    //frame:false,
    title:"收藏详情"
    
  })
  const favouriteDetailPageWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/` + 'favouriteDetail'
  : `file://${__dirname}/index.html#` + 'favouriteDetail';
  favouriteDetailWindow.loadURL(favouriteDetailPageWinURL);
  //openDevToolsInDevelopment(favouriteDetailWindow);
  favouriteDetailWindow.webContents.on('did-finish-load', function() {
    favouriteDetailWindow.webContents.send("clickedCollectionInfo", collectionInfo);
  });
  favouriteDetailWindow.show();
  openDevToolsInDevelopment(favouriteDetailWindow);
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
    webPreferences: {
      nodeIntegration: true,//添加这个即可
    },
    height: 340,
    resizable: resizableValue,
    width: 520,
    webPreferences: {webSecurity:false},
    //frame:false,
    title:"汇报关系"
  })
  const reportRelationWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/` + 'reportRelationContent'
  : `file://${__dirname}/index.html#` + 'reportRelationContent';
  reportRelationWindow.loadURL(reportRelationWinURL);
  //openDevToolsInDevelopment(reportRelationWindow);
  reportRelationWindow.webContents.on('did-finish-load', function() {
    reportRelationWindow.webContents.send("clickedReportRelationInfo", leaders);
  });
  reportRelationWindow.show();
  openDevToolsInDevelopment(reportRelationWindow);
});

ipcMain.on("showNotice", (event, title, contnet) => {
  console.log("title ",title)
  console.log("contnet ",contnet)
  if(process.platform == 'darwin'){
    if(!mainPageWindow.isFocused()) {
      if(notification != null) {
        notification.close();
      }
      notification = new Notification({
        title: title,
        body: contnet,
        icon: path.join(__dirname, notificationIco),
        sound: path.join(__dirname, soundPath)
      })
      notification.show();
      setTimeout(() => {
        notification.close();
      }, 2000)
      notification.on("click", () => {
        mainPageWindow.show();
      })
    }
  }

})
// 闪烁任务栏
ipcMain.on("flashIcon", (event, title, contnet) => {
  console.log("title ",title)
  console.log("contnet ",contnet)
  if(!mainPageWindow.isFocused()) {
    mainPageWindow.flashFrame(true);
  }
  
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
  if(process.platform == 'darwin'){
    if(!mainPageWindow.isFocused()) {
      if(notification != null) {
        notification.close();
      }
      notification = new Notification({
        title: title,
        body: contnet,
        icon: path.join(__dirname, notificationIco),
        sound: path.join(__dirname, soundPath)
      })
      notification.show();
      setTimeout(() => {
        notification.close();
      }, 2000)
      notification.on("click", () => {
        mainPageWindow.show();
      })
    }
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
      var baseURL = hostname;
    
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

ipcMain.on("download-upgrade", function(event, arg) {
  // url, this.data.login.access_token, this.api.commonApi.baseURL, this.config.apiPort, targetPath]
  // console.log("args is ", arg);
  var distUrl = arg[0];
  var token = arg[1];
  var baseURL = arg[2];
  var port = arg[3];
  // console.log("downloadingList is ", downloadingList);
  var distPath = arg[4];
  var distTemp = distPath + "_tmp";

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

})

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
      var baseURL = hostname;
    
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
      var baseURL = hostname;
    
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
  dialog.showOpenDialog(mainPageWindow,{
    properties: [arg, 'multiSelections']
  },function(files) {
    if(files && files.length > 0) {
      event.sender.send('selectedItem', files);
    }
  })
});
ipcMain.on('open-image-dialog', function(event, arg) {
  dialog.showOpenDialog({
    properties: [arg, ],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif']},
    ]
  },function(files) {
    if(files && files.length > 0) {
      event.sender.send('selectedImageItem', files);
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
ipcMain.on('login-win-close', function(event, arg) {
  mainWindow.hide();
});

ipcMain.on('login-win-min', function(event, arg) {
  mainWindow.minimize();
});

ipcMain.on('login-win-max', function(event, arg) {
  if(mainPageWindow.isMaximized()) {
    mainWindow.unmaximize();
  }
  else {
    mainWindow.maximize();
  }
});
function createWindow () {
  /**
   * Initial window options
   */
  if (process.env.NODE_ENV === "development") {
    resizableValue = true;
  }
  ClearDB(1);
  services.common.CreateDatabaseTable();
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,//添加这个即可
    },
    height: 420,
    useContentSize: true,
    width: 360,
    frame: false,
    resizable: resizableValue,
    /**
     * Across Domains Problem
     */
    webPreferences: {webSecurity:false}
  })
  mainWindow.hide();
  mainWindow.loadURL(winURL);
  openDevToolsInDevelopment(mainWindow);
  
  mainWindow.webContents.on('dom-ready', function(){
    mainWindow.show();            
  });
}

ipcMain.on("openDevTools", function(event) {
  if(mainWindow != null && !mainWindow.isDestroyed()) {
    mainWindow.webContents.openDevTools();
  }
  if(mainPageWindow != null && !mainPageWindow.isDestroyed()) {
    mainPageWindow.webContents.openDevTools();
  }
  if(soloPage != null && !soloPage.isDestroyed()) {
    soloPage.webContents.openDevTools();
  }
  if(favouriteDetailWindow != null && !favouriteDetailWindow.isDestroyed()) {
    favouriteDetailWindow.webContents.openDevTools();
  }
})

function openDevToolsInDevelopment(mainWindow) {

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
  if(isLogin) {
    mainPageWindow.show();
  }
  else {
    if (mainWindow === null) {
      createWindow()
    }
    else {
      mainWindow.show();
    }
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
