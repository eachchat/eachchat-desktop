import {RenderWindowBuilder} from './renderbuilder'

class TransmitMsgWindowBuilder extends RenderWindowBuilder{
    constructor(childWindow, mainWindow){
        super(childWindow, mainWindow);
        this.width = 0;
        this.height = 0;
        this.transMsgInfo = null;
        this.type = "";
    }

    setArgs(args){
        this.size = args.size;
        this.width = this.size.width;
        this.height = this.size.height; 
        this.transMsgInfo = args.transMsgInfo;
        this.type = args.type;
    }
    
    build(){
        this.setWindowSize(this.size);
        this.childWindow.setTitle("聊天记录");
        let renderArgs ={};
        renderArgs.type = this.type;
        renderArgs.args = this.transMsgInfo;
        this.childWindow.webContents.send("childwindowArgs", renderArgs);
        this.showWindow();
        if (process.env.NODE_ENV === "development") {
            this.childWindow.webContents.openDevTools();
        }
    }
}

export{
    TransmitMsgWindowBuilder
}