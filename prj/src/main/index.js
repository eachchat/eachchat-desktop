import { app, nativeTheme, BrowserWindow, Tray, Menu, dialog, shell, screen, DownloadItem, Notification, globalShortcut} from 'electron'
import axios from "axios"
import fs from 'fs-extra'
import * as path from 'path'
import {makeFlieNameForConflict, ClearDB} from '../packages/core/Utils.js';
import {createChildWindow, ChildWindow} from './childwindow.js'

app.allowRendererProcessReuse = false;
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('ignore-certificate-errors');
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let noticeWindow
let noticeInfo = {}
let voipNoticeInfo = {}
let noticeHeight
let noticeWindowKeepShow = false
let assistWindow
let soloPage = null
let appIcon = null;
let flashIconTimer = null;
let iconPath 
let soundPath
let notificationIco
let screenSize
let notification = null
var leaveInter, trayBounds, point, isLeave = true;
let emptyIconPath;
let isLogin = false;
let toHide = false;
if (process.env.NODE_ENV === "development") {
  iconPath = "../../static/Img/Main/logo@2x.ico";
  emptyIconPath = "../../static/Img/Main/logo-empty.ico";
  if(process.platform == 'darwin'){
    iconPath = "../../static/Img/Main/IconTemplate@3x.png";
  }
  else if(process.platform == 'linux') {
    iconPath = "../../static/Img/Main/icon.png";
    emptyIconPath = "../../static/Img/Main/logo-notice.png";
  }
  soundPath = "../../static/sound.wav";
  notificationIco = "../../static/Img/Main/logo@2x.png";
  iconPath = path.join(__dirname, iconPath);
  emptyIconPath = path.join(__dirname, emptyIconPath);
  soundPath = path.join(__dirname, soundPath);
  notificationIco = path.join(__dirname, notificationIco);
}else{
  iconPath = "/Img/Main/logo@2x.ico";
  emptyIconPath = "/Img/Main/logo-empty.png";
  if(process.platform == 'darwin'){
    iconPath = "/Img/Main/IconTemplate@3x.png";
  }
  else if(process.platform == 'linux') {
    iconPath = "/Img/Main/icon.png";
    emptyIconPath = "/Img/Main/logo-notice.png";
  }
  soundPath = "/sound.wav";
  notificationIco = "/Img/Main/logo@2x.png";

  iconPath = path.join(__static, iconPath);
  emptyIconPath = path.join(__static, emptyIconPath);
  soundPath = path.join(__static, soundPath);
  notificationIco = path.join(__static, notificationIco);
}

const imgViewPageWinURL = process.env.NODE_ENV === 'development'
? `http://localhost:9080/#/ImgView`
: `file://${__dirname}/index.html#ImgView`;

const trayNoticeURL = process.env.NODE_ENV === 'development'
? `http://localhost:9080/#/trayNotice`
: `file://${__dirname}/index.html#trayNotice`;

if(process.platform != 'darwin') {
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
}
//ClearDB(1);

function setImgToNormalIcon() {
  try {
    if(appIcon) {
      appIcon.setImage(iconPath);
    }
  }
  catch(e) {
    console.log("setImgToNormalIcon Exception and details is ", e);
  }
}

function setImgToFlashIcon() {
  try {
    if(appIcon) {
      appIcon.setImage(emptyIconPath);
    }
  }
  catch(e) {
    console.log("setImgOfFlashIcon Exception and details is ", e);
  }
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
let clickQuit = false;

function checkTrayLeave() {
  if(!noticeWindow) return;
  clearInterval(leaveInter);
  leaveInter = setInterval(() => {
    trayBounds = appIcon.getBounds();
    point = screen.getCursorScreenPoint();
    if(!(trayBounds.x < point.x && trayBounds.y < point.y && point.x < (trayBounds.x + trayBounds.width) && point.y < (trayBounds.y + trayBounds.height))) {
      clearInterval(leaveInter);
      isLeave = true;
      console.log("======notice hide");
      if(!noticeWindowKeepShow) {
        noticeWindow.hide();
      }
    }
  }, 100);
}

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const ipcMain = require('electron').ipcMain;

ipcMain.on('showMainPageWindow', function(event, arg) {
  if(!mainWindow) return;
  isLogin = true;
  mainWindow.hide();
  mainWindow.setResizable(true);
  mainWindow.setMinimumSize(720, 600);
  mainWindow.setSize(960, 600);
  mainWindow.center();
  // mainWindow.webContents.on('did-finish-load', function(){
  // mainWindow.maximize();
  mainWindow.show();
  // });
  openDevToolsInDevelopment(mainWindow);
  appIcon = new Tray(iconPath);

  appIcon.on('mouse-move', function(event, position){
    if(!noticeWindow) return;
    if(process.platform == "win32") {
      if(isLeave) {
        if((noticeInfo && Object.keys(noticeInfo).length == 0) && (voipNoticeInfo && Object.keys(voipNoticeInfo).length == 0)) {
          noticeWindow.hide();
        }
        else {
          isLeave = false;
          checkTrayLeave();
          noticeWindow.setSize(240, noticeHeight);
          calcTrayNoticePosition()
          noticeWindow.setAlwaysOnTop(true);
          noticeWindow.show();
        }
      }
    }
  });

  let contextMenu = Menu.buildFromTemplate([
    {
      label: "显示主界面",
      click: ()=> {
        showMain();
      }
    },
    {
      label: "注销",
      click: function() {
        mainWindow.webContents.send("LogoutMenuItemClick");
      }
    },
    {
      label: "退出",
      click: function() {
        clickQuit = true;
        clearFlashIconTimer();
        setImgToNormalIcon();
        ipcMain.removeAllListeners();
        
        mainWindow = null;
        noticeWindow = null;
        assistWindow = null;
        soloPage = null;        
        app.quit();
      }
    }
  ]);

  if(process.platform == 'darwin'){
    nativeTheme.on('updated', () => {
      if(nativeTheme.shouldUseDarkColors) {
        console.log("i am black")
        setImgToNormalIcon();
      }
      else {
        console.log("i am white");
        setImgToNormalIcon();
      }
    })
    var template = [
      {
        label: app.name || '',
        submenu:[
          {
            label: `退出${app.name || ''}`,
            role: "quit"
          }
        ]
      },
      {
          label: '编辑',
          submenu: [
              {

                  label: '复制',
                  role: 'copy'
              },
              {

                  label: '剪切',
                  role: 'cut'
              },
              {
                  label: '全选',
                  role: 'selectAll',
              },
              {
                label: '粘贴',
                role: 'paste'
              },
              {

                label: '撤销',
                role: 'redo'
            },
          ]
      }
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    
  }

  
  appIcon.setToolTip("EachChat");
  appIcon.setContextMenu(contextMenu);

  appIcon.on("click", function() {
    showMain();
  });

  // setAutoRun(true);
});

ipcMain.on('showLoginBindView', function(){
  showMain();
})

ipcMain.on('checkClick', function(event, action, ids) {
  if(!mainWindow) return;
  mainWindow.show();
  mainWindow.focus();
  if(action == "JumpToDistChat") {
    mainWindow.webContents.send('jumpToChat', ids[0]);
  }
  else if(action == "ClearAll"){
    mainWindow.webContents.send('clearAll', ids);
  }
})

function calcTrayNoticePosition() {
  if(process.platform == 'win32') {
    trayBounds = appIcon.getBounds();
    let showX = screenSize.width - trayBounds.x + trayBounds.width/2 > 130 ? (trayBounds.x + trayBounds.width/2 - 130) : screenSize.width - 20 - 240 ;
    let showY = screenSize.height - noticeHeight;
    console.log("final show posision ", showX, " y ", showY)
    noticeWindow.setPosition(showX, showY)
  }
  else {
    let showX = screenSize.width - 240 ;
    let showY = noticeHeight;
    console.log("final show posision ", showX, " y ", showY)
    noticeWindow.setPosition(showX, showY)
  }
}

ipcMain.on("trayNoticeShowOrNot", function(event, arg) {
  if(!noticeWindow) return;
  noticeWindowKeepShow = arg;
  if(!arg && isLeave) {
    noticeWindow.hide();
  }
})

ipcMain.on("updateTrayNotice", function(event, arg) {
  if(process.platform == "win32" && noticeWindow) {
    noticeInfo = arg;
    if(Object.keys(voipNoticeInfo).length != 0) {
      noticeHeight = 40 + Object.keys(voipNoticeInfo).length * 96;
    }
    else {
      noticeHeight = 52 + 20 + Object.keys(noticeInfo).length * 52;
    }
    noticeWindow.setSize(240, noticeHeight);
    calcTrayNoticePosition()
    noticeWindow.webContents.send("updateTrayNotice", arg);
  }
})

ipcMain.on("updateVoIPTrayNotice", function(event, arg) {
  voipNoticeInfo = arg
  if(Object.keys(arg).length == 0) {
    if(process.platform == "win32") {
      noticeWindow.hide();
      return;
    }
  } 
  else {
    noticeHeight = 40 + Object.keys(voipNoticeInfo).length * 96;
  }
  console.log("updateVoIPTrayNotice ", arg);
  if(noticeWindow) {
    noticeWindow.setSize(240, noticeHeight);
    calcTrayNoticePosition()
    noticeWindow.webContents.send("updateVoIPTrayNotice", arg);
    noticeWindow.show();
  }
})

ipcMain.on("updateUnreadCount", function(event, arg) {
  if(!mainWindow) return;
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
  else if(process.platform == "linux") {
    if(arg == 0) {
      setImgToNormalIcon();
    }
    else {
      setImgToFlashIcon();
    }
  }
  else if(process.platform == "win32") {
    if(arg == 0) {
      clearFlashIconTimer();
      setImgToNormalIcon()
    }
  }
  console.log("==========arg ", arg);
  mainWindow.webContents.send("setUnreadCount", arg);
})

ipcMain.on("token-expired", function(event, arg) {
  if(!mainWindow) return;
  mainWindow.webContents.send("toLogout");
})

ipcMain.on('showLoginPageWindow', function(event, arg) {
  if(!mainWindow) return;
  isLogin = false;
  clearFlashIconTimer();
  setImgToNormalIcon()
  if(mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
    toHide = false;
  }
  Menu.setApplicationMenu(null)
  mainWindow.hide();
  mainWindow.setMinimumSize(360, 420);
  if(mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  }
  mainWindow.setSize(360, 420)
  mainWindow.loadURL(winURL);
  openDevToolsInDevelopment(mainWindow);
  queue.destory();
  appIcon.destroy();
  mainWindow.webContents.on('dom-ready', function(){
    mainWindow.center();
    mainWindow.show();
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.setResizable(true);
  }
  else{
    mainWindow.setResizable(false);
  }
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

ipcMain.on('showTransTmpWindow', function(event, msgListInfo, path) {
  var title = "";
  var tmp = undefined;
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
    title = msgListInfo.title;
  }
  tmp = new BrowserWindow({
    height: height,
    //useContentSize: true,
    resizable: false,
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
  tmp.loadURL(sonPageWinURL);
  //openDevToolsInDevelopment(soloPage);
  tmp.webContents.on('did-finish-load', function() {
    tmp.webContents.send("msgListInfo", msgListInfo.list);
  });
  tmp.show();
});

ipcMain.on('showAnotherWindow', function(event, msgListInfo, path) {
  console.log("========== msgListInfo ", msgListInfo);
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
    title = msgListInfo.title;
  }
  if(!soloPage) {
    soloPage = new BrowserWindow({
      height: height,
      //useContentSize: true,
      resizable: false,
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
      soloPage.webContents.send("msgListInfo", msgListInfo.list);
    });
    soloPage.show();
    soloPage.on('close', (event) => {
      if(clickQuit){
        app.quit();
        return;
      }
      event.preventDefault();
      soloPage.hide();
    })
  }
  else {
    soloPage.setTitle(title);
    soloPage.webContents.send("msgListInfo", msgListInfo.list);
    soloPage.show();
  }
});

ipcMain.on('searchAddedMembers', function(event, selectedGroupIds) {
  if(!soloPage) return;
  soloPage.webContents.send("searchAddedMembers", selectedGroupIds);
  soloPage.focus();
})

ipcMain.on('searchAddedSenders', function(event, selectedSenderIds) {
  if(!soloPage) return;
  soloPage.webContents.send("searchAddedSenders", selectedSenderIds);
  soloPage.focus();
})

ipcMain.on('SearchAddSender', function(event, selectedSenderIds) {
  if(!mainWindow) return;
  mainWindow.webContents.send("SearchAddSenders", selectedSenderIds);
  mainWindow.focus();
})

ipcMain.on("SearchAddGroup", function(event, selectedGroupIds) {
  if(!mainWindow) return;
  mainWindow.webContents.send("SearchAddGroup", selectedGroupIds);
  mainWindow.focus();
})

ipcMain.on("transmitFromSoloDlg", function(event, transmitInfoStr) {
  if(!mainWindow) return;
  console.log("=============== ", transmitInfoStr);
  mainWindow.webContents.send("transmitFromSoloDlg", transmitInfoStr);
  mainWindow.focus();
})

ipcMain.on("favourite-update-chatlist", function(event, newMsgInfo) {
  if(!mainWindow) return;
  mainWindow.webContents.send("transmitFromFavDlg", newMsgInfo);
})

ipcMain.on('AnotherClose', function(event, arg) {
  soloPage.close();
});

ipcMain.on('AnotherMin', function(event, arg) {
  soloPage.minimize();
});

ipcMain.on('imageViewerFav', function(event, toFavEvent) {
  if(!mainWindow) return;
  mainWindow.webContents.send("toFavImageViewer", toFavEvent);
});

ipcMain.on('imageViewerTransmit', function(event, toTransmitEvent) {
  if(!mainWindow) return;
  mainWindow.webContents.send("toTransmitImageViewer", toTransmitEvent);
  mainWindow.focus();
});

ipcMain.on('showImageViewWindow', function(event, imageInfos, distImageInfo) {
  if(!assistWindow) return;
  console.log("=======showImageViewWindow")
  // assistWindow.webContents.on('did-finish-load', function() {
  assistWindow.webContents.send("timelines", imageInfos, distImageInfo, screenSize);
  // });
  assistWindow.show();
  assistWindow.center();
})

ipcMain.on('showPersonalImageViewWindow', function(event, url) {
  if(!assistWindow) return;
  console.log("=======showPersonalImageViewWindow")
  // assistWindow.webContents.on('did-finish-load', function() {
  assistWindow.webContents.send("personalUrl", url, screenSize);
  // });
  assistWindow.show();
  assistWindow.center();
})

ipcMain.on('leaveGroup', function(event, roomId) {
  if(!mainWindow) return;
  mainWindow.webContents.send("roLeaveRoom", roomId);
})

ipcMain.on('updageAssistWindowSize', function(event, sizeInfo, isHeaderImg) {
  console.log("*** updage size is ", sizeInfo);
  if(isHeaderImg) {
    assistWindow.setSize(parseInt(sizeInfo.w) + 18, parseInt(sizeInfo.h) + 48, true);
  }
  else {
    assistWindow.setSize(parseInt(sizeInfo.w) + 18, parseInt(sizeInfo.h) + 98, true);
  }
  assistWindow.center();
})

ipcMain.on("showNotice", (event, title, contnet) => {
  console.log("title ",title)
  console.log("contnet ",contnet)
  if(process.platform == 'darwin' || process.platform == 'linux'){
    if(!mainWindow.isFocused()) {
      if(notification != null) {
        notification.close();
      }
      notification = new Notification({
        title: title,
        body: contnet,
        icon: notificationIco,
        sound: soundPath
      })
      notification.show();
      setTimeout(() => {
        notification.close();
      }, 4000)
      notification.on("click", () => {
        mainWindow.show();
      })
    }
  }

})

ipcMain.on("stopFlash", (event) => {
  clearFlashIconTimer();
  setImgToNormalIcon();
})

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
      setImgToFlashIcon()
    } else {
      setImgToNormalIcon();
    }
  }, 500);

  // if(!mainWindow.isFocused()) {
  //   if(notification != null) {
  //     notification.close();
  //   }
  //   notification = new Notification({
  //     title: title,
  //     body: contnet,
  //     icon: path.join(__dirname, notificationIco),
  //     sound: path.join(__dirname, soundPath)
  //   })
  //   notification.show();
  //   setTimeout(() => {
  //     notification.close();
  //   }, 4000)
  //   notification.on("click", () => {
  //     clearFlashIconTimer();
  //     setImgToNormalIcon();
  //     mainWindow.show();
  //   })
  // }

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
  setImgToNormalIcon();
}

function clearFlashIconTimer() {
  if (flashIconTimer) {
    clearInterval(flashIconTimer);
  }
}

const downloadingList = [];

ipcMain.on("updateContact", function(event, args){
  event.sender.send("updateContact")
})

ipcMain.on("export_key", function(event, args) {
  console.log("========================= ", args);
  var theKey = args[0];
  var thePath = args[1];
  var distpath = thePath;
  // const blob = new Blob([theKey], {
  //     type: 'text/plain;charset=us-ascii',
  // });
  var buffer = theKey;
  console.log("args is ", buffer);
  var distPathTmp = distpath + '_tmp';
  fs.writeFile(distPathTmp, buffer, async err => {
    if(err) {
      console.log("ERROR ", err.message)
      event.sender.send("ERROR", err.message);
    }
    else {
      var finalName = await makeFlieNameForConflict(distpath);
      console.log("get final name ", finalName)
      fs.renameSync(distPathTmp, finalName);
      event.sender.send("exportSuc");
    }
  })
})

ipcMain.on('open-export-dialog', function(event) {
  dialog.showOpenDialog(mainWindow,{
    title: "导出到",
    properties: ["openDirectory"]
  }).then(files => {
    console.log("======files is ", files)
    event.sender.send('exportPath', files);
  })
});

ipcMain.on('open-download-recoveryKey-dialog', function(event) {
  dialog.showOpenDialog(mainWindow,{
    title: "导出到",
    properties: ["openDirectory"]
  }).then(files => {
    console.log("======files is ", files)
    event.sender.send('downloadRecoveryKeyPath', files);
  })
});

ipcMain.on("save_file", function(event, path, buffer, eventId, needOpen) {
  // var path = args[0];
  // var buffer = args[1];
  // var eventId = args[2];
  // var needOpen = args[3];
  var path = path;
  var buffer = buffer;
  var eventId = eventId;
  var needOpen = needOpen;
  console.log("args is ", buffer);
  var distPath = path + '_tmp';
  fs.outputFile(distPath, buffer, async err => {
    if(err) {
      console.log("ERROR ", err.message)
      event.sender.send("ERROR", err.message, eventId);
    }
    else {
      var finalName = await makeFlieNameForConflict(path);
      console.log("get final name ", finalName)
      fs.renameSync(distPath, finalName);
      if(needOpen) {
          shell.openExternal(finalName);
      }
      event.sender.send("SAVED_FILE", finalName, eventId);
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

let updateVersion = false;
let updateCancel = false;
ipcMain.on("cancelUpdatePackage", function(event, arg) {
  updateCancel = true;
})

ipcMain.on("intallUpgradePackage", function(event, distPath){
  if(process.platform == 'win32'){
    shell.openExternal(distPath);
  } 
  else if(process.platform == "darwin") {
    console.log(distPath)
    shell.openPath(distPath);
  }
  else//(process.platform == 'linux')
    shell.showItemInFolder(distPath);
  
  clickQuit = true;
  app.quit();
})

ipcMain.on("toUpgradePackage", function(event, arg) {
  console.log("before updateCancel", updateCancel)
  console.log("before updateVersion", updateVersion)

  updateCancel = false;
  if(updateVersion) return;
  updateVersion = true;
  console.log("after updateCancel", updateCancel)
  console.log("after updateVersion", updateVersion)

  // url, this.data.login.access_token, this.api.commonApi.baseURL, this.config.apiPort, targetPath]
  // console.log("toUpgradePackage is ", arg);
  var distUrl = arg[0];
  var token = arg[1];
  var baseURL = arg[2];
  var port = arg[3];
  // console.log("downloadingList is ", downloadingList);
  var distPath = arg[4];
  var versionId = arg[5];
  var distTemp = distPath + "_tmp";

  if (typeof port == "number") {
    port = port;
  }

  var sender = axios.create({
    baseURL: baseURL + ":" + String(port)
  });

  var path = distUrl;
  var headers = {
    Authorization: "Bearer " + token
  };
  var appendix = {
    timeout: 60000 * 5,
    responseType: "stream"
  };

  var config = Object.assign({
    headers: headers,
  }, appendix);

  if(fs.existsSync(distTemp)) {
      fs.unlinkSync(distTemp);
  }

  if(fs.existsSync(distPath)) {
      fs.unlinkSync(distPath);
  }

  try{
    sender.get(path, config)
      .then(function (ret) {
        event.sender.send('getTotleSize', ret.headers['content-length']);
        ret.data.pipe(fs.createWriteStream(distTemp))
        .on('finish', function() {
          updateVersion = false;
          if(updateCancel){
            updateCancel = false;
            return;
          } 
          console.log("finished ")
          
          try{
            fs.renameSync(distTemp, distPath);
            event.sender.send('finishUpdateDownload', distPath);
          }
          catch(e) {
            console.log("rename file failed and details is ", e);
			event.sender.send('finishUpdateDownload', distPath);
          }
        });
    })
  }
  catch(err) {
    console.log("iiiiiiiiiiiiii ", err)
  }
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

ipcMain.on("change-save-file-path", function(event, arg){
  dialog.showOpenDialog(mainWindow,{
    properties: [arg, 'openDirectory']
  }).then(folder=>{
    event.sender.send('selected-save-file-path', folder);
  })
})

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
  dialog.showOpenDialog(mainWindow, {
    properties: [arg, ],
    filters: [
      { name: 'Images', extensions: ['bmp', 'jpg', 'webp', 'tif', 'jpeg', 'png', 'gif', 'tiff']},
    ]
  }).then(files=> {
    if(files.filePaths && files.filePaths.length > 0) {
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
  if(!mainWindow) return;
  mainWindow.blur();
  mainWindow.hide();
});

ipcMain.on('win-min', function(event, arg) {
  mainWindow.blur();
  mainWindow.minimize();
});

ipcMain.on('win-max', function(event, arg) {
  console.log("=====index win-max");
  if(mainWindow && process.platform == 'darwin') {
    mainWindow.webContents.send("setIsFullScreen", true);
    mainWindow.setFullScreen(true);
    mainWindow.setMinimizable(true);
    mainWindow.setMaximizable(true);
    mainWindow.setWindowButtonVisibility(true);
  }
  else {
    if(assistWindow && assistWindow.isVisible()) {
      if(assistWindow.isMaximized()) {
        assistWindow.unmaximize();
      }
      else {
        assistWindow.maximize();
      }
    }
    else if(mainWindow.isVisible()) {
      if(mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      }
      else {
        mainWindow.maximize();
      }
    }
  }
});

ipcMain.on('image-win-close', function(event, arg) {
  if(!assistWindow) return;
  assistWindow.hide();
});

ipcMain.on('image-win-min', function(event, arg) {
  if(!assistWindow) return;
  assistWindow.minimize();
});

ipcMain.on('image-win-max', function(event, arg) {
  if(assistWindow.isMaximized()) {
    assistWindow.unmaximize();
  }
  else {
    assistWindow.maximize();
  }
});

ipcMain.on('login-win-close', function(event, arg) {
  if(mainWindow && (process.platform == 'linux' || process.platform == "darwin")) {
    mainWindow.hide();
  }
  else {
    clickQuit = true;
    app.quit();
  }
});

ipcMain.on('login-win-min', function(event, arg) {
  if(!mainWindow) return;
  mainWindow.minimize();
});

ipcMain.on('login-win-max', function(event, arg) {
  if(!mainWindow) return;
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

  screenSize = screen.getPrimaryDisplay().workAreaSize;

  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
    height: 420,
    width: 360,
    frame: false,
    fullscreenable: true,
    fullscreenWindowTitle: true,
    maximizable: true,
    minimizable: true,
    // resizable: true,
    /**
     * Across Domains Problem
     */
    webPreferences: {
      webSecurity:false,
      nodeIntegration:true,
      enableRemoteModule: true
    },
    icon: iconPath,
    title: "亿洽"
  })
  if (process.env.NODE_ENV === "development") {
    mainWindow.setResizable(true);
  }
  else{
    mainWindow.setResizable(false);
  }
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
        globalShortcut.register('CommandOrControl+W', () => {
          mainWindow.hide();
        })
        globalShortcut.register('CommandOrControl+Q', () => {
          app.quit();
        })
        globalShortcut.register('CommandOrControl+M', () => {
          mainWindow.minimize();
        })
        globalShortcut.register('CommandOrControl+H', () => {
          mainWindow.hide();
        })
    }
  }
  else if(process.platform == 'win32') {
    if(mainWindow && mainWindow.isFocused()) {
      globalShortcut.register('Escape', () => {
        mainWindow.hide();
      })
    }
  }
  app.setAppUserModelId('EachChat');
  assistWindow = new BrowserWindow({
    height: 480,
    width: 480 + 24,
    frame: false,
    resizable: true,
    fullscreenable: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true
    },
    icon: iconPath,
    show: false,
    title: "亿洽"
  })
  assistWindow.loadURL(imgViewPageWinURL);
  openDevToolsInDevelopment(assistWindow);
  
  assistWindow.on('unmaximize', (event) => {
    console.log("unmaximize")
    assistWindow.webContents.send("isNormal", true);
  })

  assistWindow.on('maximize', (event) => {
    if(!assistWindow) return;
    console.log("maximize")
    assistWindow.webContents.send("isNormal", false);
  })
  //if(process.platform == "win32") {
    noticeWindow = new BrowserWindow({
      height: 52,
      width: 240,
      frame: false,
      resizable: true,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        enableRemoteModule: true
      },
      icon: iconPath,
      show: false,
      title: "亿洽"
    })
    noticeWindow.setSkipTaskbar(true);
    noticeWindow.loadURL(trayNoticeURL);
    noticeWindow.on('close', (event) => {
      if(clickQuit){
        app.quit();
        return;
      }
    })
    openDevToolsInDevelopment(noticeWindow); 
  //}
  var width = 615;
  var height = 508;
  if(process.platform == "darwin") {
    height = 470;
    width = 600;
  }

  soloPage = new BrowserWindow({
    height: height,
    //useContentSize: true,
    resizable: false,
    width:width,
    webPreferences: {
      webSecurity:false,
      nodeIntegration:true,
      enableRemoteModule: true
    },
    show: false,
    frame:true
  })
  const sonPageWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/TransmitMsgList`
  : `file://${__dirname}/index.html#TransmitMsgList`;
  soloPage.loadURL(sonPageWinURL);
  soloPage.on('close', (event) => {
    if(clickQuit){
      app.quit();
      return;
    }
    event.preventDefault();
    soloPage.hide();
  })
  let childwindowFactory = new ChildWindow();
  let thirdpartyWindowBrowser = childwindowFactory.createBrowser(iconPath);
  let childRenderWindowBrowser = childwindowFactory.createBrowser(iconPath);

  const childwindowURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#/childwindow`
  : `file://${__dirname}/index.html#childwindow`;
  childRenderWindowBrowser.loadURL(childwindowURL);
  //childRenderWindowBrowser.show();
  //childRenderWindowBrowser.webContents.openDevTools();

  ipcMain.on("createChildWindow", function(event, args){
    let mainwindowArgs = {};
    mainwindowArgs.iconPath = iconPath;
    mainwindowArgs.mainWindow = mainWindow;
    mainwindowArgs.isLogin = isLogin;
    mainwindowArgs.thirdpartyBrowser = thirdpartyWindowBrowser;
    mainwindowArgs.childBrowser = childRenderWindowBrowser;
    mainwindowArgs.ipcArg = args;
    mainwindowArgs.clickQuit = clickQuit;
    createChildWindow(mainwindowArgs);
  })

  childRenderWindowBrowser.on('close', (event) => {
    console.log("childRenderWindowBrowser", clickQuit)
    childRenderWindowBrowser.webContents.send("closeChildRenderWindowBrowser");
    if(clickQuit){
      app.quit();
      return;
    }
    event.preventDefault();
    childRenderWindowBrowser.hide();
    mainWindow.show();
  })

  thirdpartyWindowBrowser.on('close', (event) => {
    console.log("thirdpartyWindowBrowser", clickQuit)
    if(clickQuit){
      app.quit();
      return;
    }
    event.preventDefault();
    thirdpartyWindowBrowser.hide();
    mainWindow.show();
  })
}

ipcMain.on("openDevTools", function(event) {
  if(mainWindow != null && !mainWindow.isDestroyed()) {
    mainWindow.webContents.openDevTools();
  }
  if(soloPage != null && !soloPage.isDestroyed()) {
    soloPage.webContents.openDevTools();
  }
})

function openDevToolsInDevelopment(mainWindow) {

  // Open dev tools initially when in development mode
  if (mainWindow && process.env.NODE_ENV === "development") {
    mainWindow.webContents.on("did-frame-finish-load", () => {
    mainWindow.webContents.once("devtools-opened", () => {
    mainWindow.focus();
    });
    //mainWindow.webContents.openDevTools();
    });
  }
  mainWindow.on('close', (event) => {
    console.log("index mainwindow close", clickQuit)
    if(process.platform == 'darwin') {
      event.preventDefault();
      if(mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
        toHide = true;
        return;
      }
      else if(!toHide || clickQuit) {
        app.exit();
        return;
      }

    }
    else if(process.platform == 'linux'){
      clickQuit = true;
      app.quit();
      return;
    }
    if(!clickQuit){
      event.preventDefault();
      mainWindow.hide();
    }
    else {
      console.log("==========")
      app.quit();
    }
    
  })
  mainWindow.on('page-title-updated', (event, title) => {
    event.preventDefault();
  })
  mainWindow.on('will-resize', (event) => {
    if(mainWindow && process.platform == 'darwin'){
      mainWindow.webContents.send("setIsFullScreen", false);
      mainWindow.setWindowButtonVisibility(false);
    }
  })

  mainWindow.on('leave-full-screen', (event) => {
    console.log("====333===333===");
    if(process.platform == 'darwin'){
      if(toHide) {
        mainWindow.hide();
        toHide = false;
      }
    }
  })

  mainWindow.on('unmaximize', (event) => {
    console.log("unmaximize")
    if(!mainWindow) return;
    mainWindow.webContents.send("isNormal", true);
  })

  mainWindow.on('maximize', (event) => {
    console.log("maximize")
    if(!mainWindow) return;
    mainWindow.webContents.send("isNormal", false);
    mainWindow.webContents.send("reCalcuate");
  })

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('browser-window-blur', () => {
  if(mainWindow != undefined) {
    mainWindow.webContents.send("isBlur");
  }
  if(process.platform == 'darwin') {
    if(mainWindow != undefined) {
      if(globalShortcut.isRegistered('CommandOrControl+V')) {
        globalShortcut.unregister('CommandOrControl+V');
      }
      if(globalShortcut.isRegistered('CommandOrControl+W')) {
        globalShortcut.unregister('CommandOrControl+W');
      }
      if(globalShortcut.isRegistered('CommandOrControl+Q')) {
        globalShortcut.unregister('CommandOrControl+Q');
      }
      if(globalShortcut.isRegistered('CommandOrControl+M')) {
        globalShortcut.unregister('CommandOrControl+M');
      }
      if(globalShortcut.isRegistered('CommandOrControl+H')) {
        globalShortcut.unregister('CommandOrControl+H');
      }
    }
  }
  else if(process.platform == 'win32') {
    if(mainWindow != undefined) {
      if(globalShortcut.isRegistered('Escape')) {
        globalShortcut.unregister('Escape');
      }
    }
  }
})

app.on('browser-window-focus', () => {
  if(!mainWindow) return;
  
  mainWindow.webContents.send("isFocuse");
  mainWindow.webContents.send("setFocuse");
  if(process.platform == 'darwin') {
      let content = mainWindow.webContents;
      globalShortcut.register('CommandOrControl+V', () => {
        content.paste();
      })
      globalShortcut.register('CommandOrControl+W', () => {
        if(assistWindow && assistWindow.isVisible() && assistWindow.isFocused()) {
          assistWindow.hide();
        }
        else {
          mainWindow.hide();
        }
      })
      globalShortcut.register('CommandOrControl+Q', () => {
        app.quit();
      })
      globalShortcut.register('CommandOrControl+M', () => {
        if(assistWindow && assistWindow.isVisible() && assistWindow.isFocused()) {
          assistWindow.minimize();
        }
        else {
          mainWindow.minimize();
        }
      })
      globalShortcut.register('CommandOrControl+H', () => {
        if(assistWindow && assistWindow.isVisible() && assistWindow.isFocused()) {
          assistWindow.hide();
        }
        else {
          if(!mainWindow) return;
          mainWindow.hide();
        }
      })
  }
  else if(process.platform == 'win32') {
    // globalShortcut.register('Escape', () => {
    //   if(assistWindow && assistWindow.isVisible() && assistWindow.isFocused()) {
    //     assistWindow.hide();
    //   }
    //   else {
    //     mainWindow.hide();
    //   }
    // })
  }
})

app.on('activate', () => {
  if(isLogin && mainWindow) {
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
