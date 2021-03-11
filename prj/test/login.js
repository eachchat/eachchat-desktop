

class CLoginUtil{
    constructor(app){
        this.app = app;
    }

    async inLoginOrg(){
        let orgID = '#organizationInput';
        let orgInput =  await this.app.client.$(orgID);
        return await orgInput.isExisting()
    }

    async login(orgname, username, pwd){
        let windowCount = await this.app.client.getWindowCount();
        await this.app.client.windowByIndex(windowCount - 1);
        let orgID = '#organizationInput';
        let orgInput =  await this.app.client.$(orgID);
        if(!await orgInput.isExisting()) return false;
        await orgInput.setValue(orgname);    
            
        let confirBtnClass = '.organizationConfirm';
        let corfireBtn = await this.app.client.$(confirBtnClass);        
        corfireBtn.click();
        
        let usernameInputID = "#accountInputId";
        let usernameInput = await this.app.client.$(usernameInputID);
        await usernameInput.setValue(username)

        let userpwdInputID = "#passwordInputId";
        let userpwdInput = await this.app.client.$(userpwdInputID);
        if(!await userpwdInput.isExisting()) return false;
        await usernameInput.setValue(pwd)

        let confirBtnID = "#loginButton";
        let confireBtn = await this.app.client.$(confirBtnID);
        await confireBtn.click();
        return true;
    }
}

exports.module =  CLoginUtil