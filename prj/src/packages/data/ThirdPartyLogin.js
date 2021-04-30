import { ipcRenderer } from 'electron';

const ThirdPartyLogin = {
    createAlipay(bindType){
        ipcRenderer.send("createChildWindow", {type: "thirdpartywindow",
            size:{width:667,height: 600},
            browserViewUrl: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2021001195665067&scope=auth_base&redirect_uri=https%3A%2F%2Fstaging.eachchat.net/api/services/auto/alipay_callback&state=init'})
    },
}


export{
    ThirdPartyLogin
}