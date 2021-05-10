import { ipcRenderer } from 'electron';

const ThirdPartyLogin = {
    createAlipay(){
        ipcRenderer.send("createChildWindow", {type: "thirdpartywindow",
            size:{width:667,height: 600},
            browserViewUrl: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2021001195665067&scope=auth_base&redirect_uri=https%3A%2F%2Fstaging.eachchat.net/api/services/auto/alipay_callback&state=init'})
    },
    createWeChat(){
        ipcRenderer.send("createChildWindow", {type: "thirdpartywindow",
            size:{width:667,height: 600},
            browserViewUrl: 'https://open.weixin.qq.com/connect/qrconnect?appid=wx4fe0ec2a0ad5a9ec&redirect_uri=https://staging.eachchat.net&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect'})
    },
}


export{
    ThirdPartyLogin
}