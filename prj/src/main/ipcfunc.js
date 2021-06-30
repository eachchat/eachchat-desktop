import { dialog, shell, app } from 'electron'
import fs from 'fs-extra'
import {makeFlieNameForConflict} from '../packages/core/Utils.js';


const callingState = {
    state : "",

    setCallingState(args){
        this.state = args;
        console.log("setCallingState", this.state);
    },

    calling(){
        console.log("getCallingState", this.state);
        return this.state === 'busy'
    }
}

const ipcMainFunc = {
    SaveFile(event, path, buffer, eventId, needOpen) {
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
          console.log("needOpen", needOpen)
          if(needOpen) {
              shell.openExternal(finalName);
          }
          event.sender.send("SAVED_FILE", finalName, eventId, needOpen);
        }
      })
    },

    GetSaveFilepath(mainWindow, event){
      dialog.showOpenDialog(mainWindow,{
          properties: ["openDirectory"]
        }).then(files => {
          event.returnValue = files;
        })
    },

    openDownloadRecoveryKeyDialog(event, mainWindow){
      dialog.showOpenDialog(mainWindow,{
        title: "导出到",
        properties: ["openDirectory"]
      }).then(files => {
        console.log("======files is ", files)
        event.sender.send('downloadRecoveryKeyPath', files);
      })
    },

    openExportDialog(event, mainWindow){
      dialog.showOpenDialog(mainWindow,{
        title: "导出到",
        properties: ["openDirectory"]
      }).then(files => {
        console.log("======files is ", files)
        event.sender.send('exportPath', files);
      })
    },

    exportKey(event, args){
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
    },

    checkClick(event, action, ids, mainWindow){
      if(!mainWindow) return;
      mainWindow.show();
      mainWindow.focus();
      if(action == "JumpToDistChat") {
        mainWindow.webContents.send('jumpToChat', ids[0]);
      }
      else if(action == "ClearAll"){
        mainWindow.webContents.send('clearAll', ids);
      }
    },

    setAutoRun(event, isAutoRun) {
      app.setLoginItemSettings({
        openAtLogin: isAutoRun,
        openAsHidden: isAutoRun,
      })
    },

    showTransTmpWindow(event, msgListInfo, path){
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
      tmp.webContents.on('did-finish-load', function() {
        tmp.webContents.send("msgListInfo", msgListInfo.list);
      });
      tmp.show();
    } 
}


export{
    callingState,
    ipcMainFunc,
}