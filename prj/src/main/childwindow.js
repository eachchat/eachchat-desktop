const {BrowserWindow} = require('electron')

class ChildWindow{
    constructor(){
        this.childWindow = undefined;
    }

    static createChildWindow(iconPath){
        if(this.childWindow) return this.childWindow;
        this.childWindow = new BrowserWindow({     
            resizable: true,
            webPreferences: {
                webSecurity:false,
                nodeIntegration:true,
                enableRemoteModule: true
            },
            show: false,
            frame:true,
            icon: iconPath,
        });
        return this.childWindow;
    }
}

export{
    ChildWindow
}