import {RenderWindowBuilder} from './renderbuilder'

class VoiceChatWindowBuilder extends RenderWindowBuilder{
    constructor(childWindow, mainWindow){
        super(childWindow, mainWindow);
        this.width = 0;
        this.height = 0;
        this.voipInfo = null;
        this.size = null;
    }

    setArgs(args){
        console.log("VoiceChatWindowBuilder ", args);
        this.size = args.size;
        this.width = this.size.width;
        this.height = this.size.height;
        this.voipInfo = args.voipInfo;
    }
    
    build(){
        this.setWindowSize(this.size);
        let renderArgs ={};
        renderArgs.type = "voiceChatWindow";
        renderArgs.voipInfo = this.voipInfo;
        this.childWindow.webContents.send("childwindowArgs", renderArgs);
        this.showWindow();
        this.childWindow.webContents.openDevTools();
    }
}

export{
    VoiceChatWindowBuilder
}