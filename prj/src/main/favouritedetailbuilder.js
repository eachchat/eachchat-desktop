import {RenderWindowBuilder} from './renderbuilder'

class FavouriteDetailWindowBuilder extends RenderWindowBuilder{
    constructor(childWindow, mainWindow){
        super(childWindow, mainWindow);
        this.width = 0;
        this.height = 0;
        this.collectionInfo = null;
    }

    setArgs(args){
        this.size = args.size;
        this.width = this.size.width;
        this.height = this.size.height;
        this.collectionInfo = args.collectionInfo;
 
    }
    
    build(){
        this.setWindowSize(this.size);
        this.childWindow.setTitle(this.collectionInfo.title);
        console.log(this.collectionInfo)
        let renderArgs ={};
        renderArgs.type = "clickedCollectionInfo";
        renderArgs.args = this.collectionInfo;
        this.childWindow.webContents.send("childwindowArgs", renderArgs);
        this.showWindow();
        this.childWindow.webContents.openDevTools();
    }
}

export{
    FavouriteDetailWindowBuilder
}