import { dialog, shell } from 'electron'
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

const ipcFileFunc = {
    SaveFile(args) {
      return function f() {
        return new Promise((resolve, reject) => {
          var event = args[0];
          var path = args[1];
          var buffer = args[2];
          var eventId = args[3];
          var needOpen = args[4];
          var pipName = args[5];
          console.log("args is ", buffer);
          var distPath = path + '_tmp';
          fs.outputFile(distPath, buffer, async err => {
            if(err) {
              console.log("ERROR ", err.message)
              event.sender.send("ERROR", err.message, eventId);
              reject();
            }
            else {
              var finalName = await makeFlieNameForConflict(path);
              console.log("get final name ", finalName)
              fs.renameSync(distPath, finalName);
              console.log("needOpen", needOpen)
              if(needOpen) {
                  shell.openExternal(finalName);
              }
              console.log("pip name is ", pipName);
              if(pipName) {
                event.sender.send(pipName, finalName, eventId, needOpen);
              }
              else {
                event.sender.send("SAVED_FILE", finalName, eventId, needOpen);
              }
            }
          });
        });
      };
    },

    GetSaveFilepath(mainWindow, event, fileName){
      dialog.showSaveDialog(mainWindow,{
        defaultPath: fileName
        }).then(files => {
          event.returnValue = files;
        })
    }
}


export{
    callingState,
    ipcFileFunc,
}