<template>
    <div>
        <video class = "large-window" id = "large-window"></video>
        <video class = "small-window" id = "small-window" v-show = "bSmallWindow"></video>
        <audio id="messageAudio">
            <source src="../../../static/message.ogg" type="audio/ogg" />
            <source src="../../../static/message.mp3" type="audio/mpeg" />
        </audio>
        <audio id="ringAudio" loop>
            <source src="../../../static/ring.ogg" type="audio/ogg" />
            <source src="../../../static/ring.mp3" type="audio/mpeg" />
        </audio>
        <audio id="ringbackAudio" loop>
            <source src="../../../static/ringback.ogg" type="audio/ogg" />
            <source src="../../../static/ringback.mp3" type="audio/mpeg" />
        </audio>
        <audio id="callendAudio">
            <source src="../../../static/callend.ogg" type="audio/ogg" />
            <source src="../../../static/callend.mp3" type="audio/mpeg" />
        </audio>
        <audio id="busyAudio">
            <source src="../../../static/busy.ogg" type="audio/ogg" />
            <source src="../../../static/busy.mp3" type="audio/mpeg" />
        </audio>
        <div class = "audioMeterBackground">
            <input type = "range" class = "audioMeter" @change = "changeVoice" v-model="nVoice" min = "0" max = "100" step="1"></input>
        </div>
        <audio id="remoteAudio"></audio>
        <div v-if = "isMute" class = "mute-icon" @click="muteVoice"></div>
        <div v-else class = "unmute-icon" @click="unMuteVoice"></div>
        <div class = "hangup-icon" @click="hangupVideo"></div>
        <div class = "voice-icon"></div>
        <span class = "mute-text">静音</span>
        <span class = "voice-text">音量</span>
        <span class = "hangup-text">挂断</span>
        <img class = "user-img" v-show="bShowStateText" src="../../../static/Img/User/user-40px@2x.png" id = "video-chat-user-img"
        onerror = "this.src = './static/Img/User/user-40px@2x.png'">
        <div class = "username" v-show="bShowStateText">{{useName}}</div>
        <div class = "stateText" v-show="bShowStateText">{{stateText}}</div>
    </div>
</template>

<script>
import {mxVoIP} from "../../packages/data/mxVoIP.js"
import {ipcRenderer} from 'electron'

export default {
    data(){
        return{
            bSmallWindow: false,
            isMute: true,
            nVoice: 100,
            useName: "",
            stateText: "",
            bShowStateText: true,
            intervalTime: undefined
        }
    },
    props:{
        roomInfo:{
            type:Object,
            default:{}
        }
    },

    watch:{
        roomInfo(){
            this.createVideoChat(this.roomInfo);
        }
    },

    methods:{
        updateStateText(){
            if(this.stateText === ""){
                this.stateText = "正在接通中"
            }
            else if(this.stateText === "正在接通中"){
                this.stateText = "正在接通中."
            }
            else if(this.stateText === "正在接通中."){
                this.stateText = "正在接通中.."
            }
            else if(this.stateText === "正在接通中.."){
                this.stateText = "正在接通中..."
            }
            else if(this.stateText === "正在接通中..."){
                this.stateText = "正在接通中"
            }
        },

        showStateText(){
            this.bShowStateText = true;
            this.intervalTime = setInterval(() => {
                this.updateStateText();
            }, 1000)
        },

        hideStateText()
        {
            this.bShowStateText = false;
            clearInterval(this.intervalTime);
        },

        changeVoice(){
            console.log(this.nVoice)
            let videoElm = document.getElementById("remoteAudio");
            if(videoElm){
                videoElm.volume = this.nVoice / 100;
            }
            if(this.nVoice == 0){
                this.isMute = false;
            }
            else{
                this.isMute = true;
            }
        },

        createVideoChat(roomInfo){
            this.showStateText();
            this.callChat.videoCall(roomInfo, this);
            let url = roomInfo.url;
            if(url.length != 0){
                let imgEle = document.getElementById("video-chat-user-img");
                if(imgEle){
                    imgEle.src = url;
                }
            }
            this.useName = roomInfo.name;
        },

        showSmallWindow(){
            this.bSmallWindow = true;
        },

        hangupVideo(){
            this.callChat.hangUp(this.roomInfo.roomID);
            ipcRenderer.send("hideVideoChat");
            this.hideStateText();
        },

        closeWindow(){
            if(this.roomInfo && this.roomInfo.roomID){
                this.callChat.hangUp(this.roomInfo.roomID);
                this.hideStateText();
            }
        },

        muteVoice(){
            this.callChat.muteVoice(this.roomInfo.roomID);
            this.isMute = false;
        },

        unMuteVoice(){
            this.callChat.unMuteVoice(this.roomInfo.roomID);
            this.isMute = true;
        }


    },
    mounted(){
        console.log("videochat mounted")
        this.callChat = new mxVoIP();
        this.callChat.createMatrix();
        ipcRenderer.on("closeChildRenderWindowBrowser", this.closeWindow)
    }
}
</script>

<style>
.large-window{
    z-index: 0;
    width: 300px;
    height: 480px;
    position: absolute;
    background: #4A4C5B;
    box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.17);
    border-radius: 4px;
}

.small-window{
    position: relative;
    float:right;
    z-index: 1;
    width: 96px;
    height: 170px;
    margin: 8px 8px 0 0;
    border: 1px solid rgba(0, 0, 0, 255);
}

.camera-icon{
    position: absolute;
    z-index: 1;
    left: 46px;
    top: 326px;
    width: 40px;
    height: 40px;
    background-image: url("../../../static/Img/VoIP/changeCamera.png");
    
}

.mute-icon{
    position: absolute;
    z-index: 1;
    left: 44px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/muteMicphone.png"); 
}

.unmute-icon{
    position: absolute;
    z-index: 1;
    left: 44px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/mutedMicphone.png"); 
}

.hangup-icon{
    position: absolute;
    z-index: 1;
    left: 128px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup.png"); 
}

.voice-icon{
    position: absolute;
    z-index: 1;
    left: 212px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/voice.png"); 
}

.change-camera-text{
    z-index: 1;
    position: absolute;
    left: 41px;
    top: 374px;
    width: 50px;
    display: block;
    overflow-wrap: break-word;
    color: rgba(153, 153, 153, 1);
    font-size: 10px;
    font-family: PingFangSC-Regular;
    line-height: 12px;
    text-align: center;
}

.mute-text{
    z-index: 1;
    position: absolute;
    left: 56px;
    top: 456px;
    width: 20px;
    display: block;
    overflow-wrap: break-word;
    color: rgba(153, 153, 153, 1);
    font-size: 10px;
    font-family: PingFangSC-Regular;
    line-height: 12px;
    text-align: center;
}

.voice-text{
    z-index: 1;
    position: absolute;
    left: 224px;
    top: 456px;
    width: 20px;
    display: block;
    overflow-wrap: break-word;
    color: rgba(153, 153, 153, 1);
    font-size: 10px;
    font-family: PingFangSC-Regular;
    line-height: 12px;
    text-align: center;
}

.hangup-text{
    z-index: 1;
    position: absolute;
    left: 140px;
    top: 456px;
    width: 20px;
    display: block;
    overflow-wrap: break-word;
    color: rgba(153, 153, 153, 1);
    font-size: 10px;
    font-family: PingFangSC-Regular;
    line-height: 12px;
    text-align: center;
}

.user-img{
    z-index: 1;
    position: absolute;
    left: 120px;
    top: 120px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
}

.audioMeterBackground{
    z-index: 1;
    position: absolute;
    width: 26px;
    height: 104px;
    left: 221px;
    top: 296px;
    background: #000000;
    opacity: 0.4;
}

.audioMeter{
    z-index: 1;
    transform: rotate(270deg);
    position: relative;
    top: 40px;
    right: 29px;
    width: 80px;
    height: 3px;
    background: #FFFFFF;
}

.username{
    position: absolute;
    text-align: center;
    top: 192px;
    width: 300px;
    height: 22px;
    font-size: 16px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 22px;
    letter-spacing: 2px;
}

.stateText{
    position: absolute;
    text-align: center;
    top: 222px;
    width: 300px;
    height: 18px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #999999;
    line-height: 18px;
}
</style>