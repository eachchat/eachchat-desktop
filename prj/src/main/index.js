import { app, BrowserWindow, Tray, Menu, dialog, shell, screen, DownloadItem, Notification, globalShortcut} from 'electron'
import axios from "axios"
import fs from 'fs-extra'
import * as path from 'path'
import {services } from '../packages/data/index.js';
import {makeFlieNameForConflict, ClearDB} from '../packages/core/Utils.js';
app.allowRendererProcessReuse = false;
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let mainPageWindow
let soloPage = null
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
  else if(process.platform == 'linux') {
    iconPath = "../../static/Img/Main/icon.png";
  }
  
  emptyIconPath = "../../static/Img/Main/logo-empty.ico";
  soundPath = "../../static/sound.wav";
  notificationIco = "../../static/Img/Main/logo@2x.png";
}else{
  iconPath = "/static/Img/Main/logo@2x.ico";
  if(process.platform == 'darwin'){
    iconPath = "/static/Img/Main/macMenuIcon.png";
  }
  else if(process.platform == 'linux') {
    iconPath = "/static/Img/Main/icon.png";
  }
  emptyIconPath = "/static/Img/Main/logo-empty.ico";
  soundPath = "/static/sound.wav";
  notificationIco = "/static/Img/Main/logo@2x.png";
}

const singleInstanceLock = app.requestSingleInstanceLock();
if(!singleInstanceLock) {
  app.quit();
}
else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
      try{
        mainWindow.show();
        mainWindow.focus();
        return true;
      }
      catch(error) {
        console.log("========= ", error);
        return true;
      }
  })
}
//ClearDB(1);

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
  isLogin = true;
  mainWindow.hide();
  mainWindow.setSize(960, 600);
  // mainWindow.webContents.on('did-finish-load', function(){
  mainWindow.show();
  // });
  openDevToolsInDevelopment(mainWindow);
  // 托盘
  appIcon = new Tray(path.join(__dirname, iconPath));

  appIcon.on('mouse-move', function(event, position){
    console.log("trayIcon Mouse MoveIN")
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
    else if(arg >= 100) {
      app.dock.setBadge("99+");
    }
    else {
      app.dock.setBadge(arg.toString());
    }
  }
  mainWindow.webContents.send("setUnreadCount", arg);
});

ipcMain.on("token-expired", function(event, arg) {
  if(isLogin) {
    console.log("logout")
    if(process.platform == 'darwin'){
      app.dock.setBadge("");
    }
    // services.common.closemqtt();
    Menu.setApplicationMenu(null)
    queue.destory();
    mainWindow.hide();
    mainWindow.setSize(360, 420)
    appIcon.destroy();
    mainWindow.loadURL(winURL);
    openDevToolsInDevelopment(mainWindow);
    
    mainWindow.webContents.on('dom-ready', function(){
      mainWindow.show();            
    });
    isLogin = false;
  }
})

ipcMain.on('showLoginPageWindow', function(event, arg) {
  Menu.setApplicationMenu(null)
  mainWindow.hide();
  mainWindow.setSize(360, 420)
  appIcon.destroy();
  mainWindow.loadURL(winURL);
  openDevToolsInDevelopment(mainWindow);
  isLogin = false;
  queue.destory();
  mainWindow.webContents.on('dom-ready', function(){
    mainWindow.show();            
  });
  if(process.platform == 'darwin'){
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
  var width = 615;
  var height = 508;
  if(process.platform == "darwin") {
    height = 470;
    width = 600;
  }
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
    height: height,
    //useContentSize: true,
    resizable: resizableValue,
    width:width,
    webPreferences: {
      webSecurity:false,
      nodeIntegration:true,
      enableRemoteModule: true
    },
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
  mainWindow.webContents.send("SearchAddSenders", selectedSenderIds);
  mainWindow.focus();
})

ipcMain.on("SearchAddGroup", function(event, selectedGroupIds) {
  mainWindow.webContents.send("SearchAddGroup", selectedGroupIds);
  mainWindow.focus();
})

ipcMain.on("transmitFromSoloDlg", function(event, transmitInfoStr) {
  console.log("=============== ", transmitInfoStr);
  mainWindow.webContents.send("transmitFromSoloDlg", transmitInfoStr);
  mainWindow.focus();
})

ipcMain.on("favourite-update-chatlist", function(event, newMsgInfo) {
  mainWindow.webContents.send("transmitFromFavDlg", newMsgInfo);
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
      resizable: resizableValue,
      width:600,
      webPreferences: {
        webSecurity:false,
        nodeIntegration:true,
        enableRemoteModule: true
      },
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
    height: 340,
    resizable: resizableValue,
    width: 520,
    webPreferences: {
      webSecurity:false,
      nodeIntegration:true,
      enableRemoteModule: true
    },
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
    if(!mainWindow.isFocused()) {
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
        mainWindow.show();
      })
    }
  }

})

ipcMain.on("stopFlash", (event) => {
  clearFlashIconTimer();
  appIcon.setImage(path.join(__dirname, iconPath));
})

// 闪烁任务栏
ipcMain.on("flashIcon", (event, title, contnet) => {
  console.log("title ",title)
  console.log("contnet ",contnet)
  if(!mainWindow.isFocused()) {
    mainWindow.flashFrame(true);
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
    if(!mainWindow.isFocused()) {
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
        mainWindow.show();
      })
    }
  }

});

function downloadExist(distTemp) {
  try{
    var state = fs.statSync(distTemp);
    if(state && state.atime) {
      var curTimeMSeconds = new Date().getTime();
      var fileATimeMSeconds = state.atime.getTime();
      if(curTimeMSeconds - fileATimeMSeconds < 1000 * 5) {
        return true;
      }
      else {
        return false;
      }
    }
  }
  catch(error) {
    return false;
  }
}

function showMain() {
  mainWindow.show();

  clearFlashIconTimer();
  appIcon.setImage(path.join(__dirname, iconPath));
}

function clearFlashIconTimer() {
  if (flashIconTimer) {
    clearInterval(flashIconTimer);
  }
}

const downloadingList = [];

ipcMain.on("save_file", (event, path, buffer) => {
  fs.outputFile(path, buffer, err => {
    if(err) {
      console.log("save file err ", err);
    }
    else {
      console.log("save file suc");
    }
  })
})

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
      var originalPath = arg[6];
      var fileSize = arg[7];
      var fileUrl = arg[8];
      var baseURL = hostname;

      if(downloadExist(distTemp)) {
        console.log("distTemp is downloading ", distTemp);
        return;
      }
    
      if (typeof port == "number") {
        port = port;
      }
    
      var sender = axios.create({
        baseURL: baseURL + ":" + String(port)
      });
    
      var path = "/api/services/file/v1/dfs/download/" + String(timelineID);
      var headers = {
        Authorization: "Bearer " + token,
        "File-Size": fileSize,
      };
      if(fileUrl.length != 0) {
        headers["Encryption-File"] = fileUrl;
      }
      var appendix = {
        timeout: 1000 * 60 * 2,
        responseType: "stream"
      };
    
      var config = Object.assign({
        headers: headers,
      }, appendix);
    
      sender.get(path, config)
        .then(function (ret) {
          // console.log("sender get is ", ret);
          ret.data.pipe(fs.createWriteStream(distTemp))
          .on('finish', async function() {
            // console.log("finished ")
            try{
              // if(fs.existsSync(distPath)) {
              //   // fs.unlinkSync(distPath);
              //   resolve(arg);
              // }
              var finalName = await makeFlieNameForConflict(originalPath);
              // console.log("get final name ", finalName)
              fs.renameSync(distTemp, finalName);
              if(needOpen) {
                shell.openExternal(finalName);
              }
              // console.log("finalName is ", finalName);
              // let a = (new Date()).getTime();
              // console.log(countTmp + "~" + (a - timeTmp) + "： downloadFile distPath is ", distPath);
              // timeTmp = a;
              // countTmp += 1;
              event.sender.send('updateMsgFile', [true, '', timelineID, finalName]);
              resolve(true);
            }
            catch(e) {
              console.log("rename file failed and details is ", e);
            }
          });
        })
        // .catch(function(ret){
        //   console.log("9999999999 downloadfile exception is ", ret);
        // })
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
      if(downloadExist(distTemp)) {
        console.log("distTemp is downloading ", distTemp);
        return;
      }
    
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
      var sequenceId = arg[4];
      var distTemp = distPath + "_tmp";
      // console.log("distPath is ", distPath);
      if(downloadExist(distTemp)) {
        console.log("distTemp is downloading ", distTemp);
        return;
      }
    
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
                event.sender.send('updateUserImage', [true, '', userId, distPath, sequenceId]);
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
      console.log("download-image arg is ", arg);
      var timelineID = arg[0];
      var token = arg[1];
      var hostname = arg[2];
      var port = arg[3];
      var distPath = arg[4];
      var distTemp = distPath + "_tmp";
      var thumbType = arg[5];
      var needOpen = arg[6];
      var secretUrl = arg[7];
      var baseURL = hostname;

      if(downloadExist(distTemp)) {
        console.log("distTemp is downloading ", distTemp);
        return;
      }
    
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
      if(secretUrl.length != 0) {
        headers["Encryption-File"] = secretUrl;
      }
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
  // console.log("download-image arg is ", arg);
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
    
      if(downloadExist(distTemp)) {
        console.log("distTemp is downloading ", distTemp);
        return;
      }
    
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
  dialog.showOpenDialog(mainWindow,{
    properties: [arg, 'multiSelections']
  }).then(files=>{
    event.sender.send('selectedItem', files);
  })
});
ipcMain.on('open-image-dialog', function(event, arg) {
  dialog.showOpenDialog(mainWindow,{
    properties: [arg, ],
    filters: [
      { name: 'Images', extensions: ['bmp', 'jpg', 'webp', 'tif', 'jpeg', 'png', 'gif', 'tiff']},
    ]
  }).then(files=>{
    event.sender.send('selectedImageItem', files);
  })
});
ipcMain.on('open-image-dialog-avatar', function(event, arg) {
  dialog.showOpenDialog({
    properties: [arg, ],
    filters: [
      { name: 'Images', extensions: ['bmp', 'jpg', 'webp', 'tif', 'jpeg', 'png', 'gif', 'tiff']},
    ]
  },function(files) {
    if(files && files.length > 0) {
      event.sender.send('selectedAvatarImageItem', files);
    }
  })
});

ipcMain.on('modifyGroupImg', function(event, arg) {
  var groupId = arg[0];
  var distPath = arg[1];
  event.sender.send('updateGroupImg', [true, '', groupId, distPath]);
});

ipcMain.on('win-close', function(event, arg) {
  mainWindow.hide();
});

ipcMain.on('win-min', function(event, arg) {
  mainWindow.minimize();
});

ipcMain.on('win-max', function(event, arg) {
  if(mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  }
  else {
    mainWindow.maximize();
  }
});
ipcMain.on('login-win-close', function(event, arg) {
  if(process.platform == "darwin") {
    mainWindow.hide();
  }
  else {
    mainWindow.close();
  }
});

ipcMain.on('login-win-min', function(event, arg) {
  mainWindow.minimize();
});

ipcMain.on('login-win-max', function(event, arg) {
  if(mainWindow.isMaximized()) {
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

  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    height: 420,
    useContentSize: true,
    width: 360,
    frame: false,
    resizable: resizableValue,
    /**
     * Across Domains Problem
     */
    webPreferences: {
      webSecurity:false,
      nodeIntegration:true,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, iconPath)
  })
  mainWindow.hide();
  mainWindow.loadURL(winURL);
  openDevToolsInDevelopment(mainWindow);
  
  mainWindow.webContents.on('dom-ready', function(){
    mainWindow.show();            
  });
  
  if(process.platform == 'darwin') {
    if(mainWindow != undefined && mainWindow.isFocused()) {
        let content = mainWindow.webContents;
        globalShortcut.register('CommandOrControl+V', () => {
          content.paste();
        })
    }
  }

}

ipcMain.on("openDevTools", function(event) {
  if(mainWindow != null && !mainWindow.isDestroyed()) {
    mainWindow.webContents.openDevTools();
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

app.on('browser-window-blur', () => {
  if(process.platform == 'darwin') {
    if(mainWindow != undefined && globalShortcut.isRegistered('CommandOrControl+V')) {
      globalShortcut.unregister('CommandOrControl+V');
    }
  }
})

app.on('browser-window-focus', () => {
  if(isLogin) {
    mainWindow.webContents.send("setFocuse");
    if(process.platform == 'darwin') {
      if(mainWindow != undefined) {
          let content = mainWindow.webContents;
          globalShortcut.register('CommandOrControl+V', () => {
            content.paste();
          })
      }
    }
  
  }
})

app.on('activate', () => {
  if(isLogin) {
    mainWindow.show();
    mainWindow.webContents.send("setFocuse");
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
