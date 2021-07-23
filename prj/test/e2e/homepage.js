const Application = require('spectron').Application
const path = require('path')


let exePath = undefined;
if(process.platform == "win32") exePath = path.join(__dirname, '..//..//build//win-unpacked//EachChat.exe');
else if(process.platform == "linux") exePath = path.join(__dirname, '..//..//build//linux-unpacked//EachChat')
else exePath = path.join(__dirname, '..//..//build//mac//Eachchat.app//Contents//MacOS//Eachchat')

const homepage = {
    app: null,
    async run(){
        if(this.app && this.app.isRunning())
            return;
        this.app = new Application({
            path: exePath,
            args: [path.join(__dirname, '..')]
          })
        await this.app.start();
    },

    async login(){
        let windowCount = await this.app.client.getWindowCount();
        await this.app.client.windowByIndex(windowCount - 1);
        let orgID = '#organizationInput';
        let orgInput = await this.app.client.$(orgID);
        if(!await orgInput.isExisting()) return false;
        await orgInput.setValue("亿洽staging");    
            
        let confirBtnClass = '.organizationConfirm';
        let corfireBtn = await this.app.client.$(confirBtnClass);        
        corfireBtn.click();
        orgInput = await this.app.client.$(orgID);
        if(!await orgInput.isExisting()) return false;
        
        let usernameInputID = "#accountInputId";
        let usernameInput = await this.app.client.$(usernameInputID);
        await usernameInput.setValue("eachchatdesktop")

        let userpwdInputID = "#passwordInputId";
        let userpwdInput = await this.app.client.$(userpwdInputID);
        if(!await userpwdInput.isExisting()) return false;
        await userpwdInput.setValue("eachchatdesktop")

        let confirBtnID = "#loginButton";
        let confireBtn = await this.app.client.$(confirBtnID);
        await confireBtn.click();
        return true;
    },

    stop(){
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    },

    sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
      }
}

module.exports = homepage;