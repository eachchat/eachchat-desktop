import {RenderWindowBuilder} from './renderbuilder'
const ipcMain = require('electron').ipcMain;

class VideoChatWindowBuilder extends RenderWindowBuilder{
    constructor(childWindow, mainWindow){
        super(childWindow, mainWindow);
        this.width = 0;
        this.height = 0;
        this.roomID = null;
    }

    setArgs(args){
        this.size = args.size;
        this.width = this.size.width;
        this.height = this.size.height; 
        this.roomInfo = args.roomInfo;
    }
    
    build(){
        this.childWindow.setTitle("");
        this.setWindowSize(this.size);
        let renderArgs ={};
        renderArgs.type = "videoChatWindow";
        renderArgs.args = this.roomInfo;
        this.childWindow.webContents.send("voipwindowArgs", renderArgs);
        this.onIpcMain();
        if(!this.roomInfo.action || (this.roomInfo.action && this.roomInfo.action != "hangup")) {
            this.showWindow();
        }
        this.childWindow.setResizable(false);
        if (process.env.NODE_ENV === "development") {
            this.childWindow.webContents.openDevTools();
            this.childWindow.setResizable(true);
        }
    }

    onIpcMain(){
        ipcMain.on("hideVideoChat", () => {
            this.childWindow.hide();
            this.childWindow.setAlwaysOnTop(false)
        })

        ipcMain.on("topVideoChat", () => {
            this.childWindow.setAlwaysOnTop(true)
        })

        ipcMain.on("unTopVideoChat", () => {
            this.childWindow.setAlwaysOnTop(false)
        })
    }
}

export{
    VideoChatWindowBuilder
}