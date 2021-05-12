import {RenderWindowBuilder} from './renderbuilder'

class ReleationShipWindowBuilder extends RenderWindowBuilder{
    constructor(childWindow, mainWindow){
        super(childWindow, mainWindow);
        this.width = 0;
        this.height = 0;
        this.userinfo = null;
    }

    setArgs(args){
        this.size = args.size;
        this.width = this.size.width;
        this.height = this.size.height; 
        this.userinfo = args.userinfo;
    }
    
    build(){
        this.setWindowSize(this.size);
        this.childWindow.setTitle("汇报关系");
        let renderArgs ={};
        renderArgs.type = "showReportRelationWindow";
        renderArgs.args = this.userinfo;
        this.childWindow.webContents.send("childwindowArgs", renderArgs);
        this.showWindow();
        this.childWindow.webContents.openDevTools();
    }
}

export{
    ReleationShipWindowBuilder
}