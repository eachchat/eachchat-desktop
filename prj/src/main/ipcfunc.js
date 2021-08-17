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
    SaveFile(event, path, buffer, eventId, needOpen, pipName) {
        // var path = args[0];
        // var buffer = args[1];
        // var eventId = args[2];
        // var needOpen = args[3];
        var path = path;
        var buffer = buffer;
        var eventId = eventId;
        var needOpen = needOpen;
        var pipName = pipName;
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
            console.log("pip name is ", pipName);
            if(pipName) {
              event.sender.send(pipName, finalName, eventId, needOpen);
            }
            else {
              event.sender.send("SAVED_FILE", finalName, eventId, needOpen);
            }
          }
        })
      },

      GetSaveFilepath(mainWindow, event){
        dialog.showOpenDialog(mainWindow,{
            buttonLabel: "存储",
            properties: ["openDirectory"]
          }).then(files => {
            event.returnValue = files;
          })
      }
}


export{
    callingState,
    ipcFileFunc,
}