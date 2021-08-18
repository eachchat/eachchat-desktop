
class RenderWindowBuilder{
    constructor(childWindow, mainWindow){
        this.childWindow = childWindow;
        this.mainWindow = mainWindow;
        this.args = undefined;
    }

    showWindow(){
        this.childWindow.show();
    }

    setArgs(args){
        this.args = args;
    }

    build(){

    }
    
    setWindowSize(size){
        this.childWindow.setContentSize(size.width, size.height);
    }
}

export{
    RenderWindowBuilder
}

