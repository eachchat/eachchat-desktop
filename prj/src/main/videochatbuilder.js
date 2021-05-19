import {RenderWindowBuilder} from './renderbuilder'

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
        this.setWindowSize(this.size);
        let renderArgs ={};
        renderArgs.type = "videoChatWindow";
        renderArgs.args = this.roomInfo;
        this.childWindow.webContents.send("childwindowArgs", renderArgs);
        this.showWindow();
        this.childWindow.webContents.openDevTools();
    }
}

export{
    VideoChatWindowBuilder
}