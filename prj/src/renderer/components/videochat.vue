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
        <audio id="remoteAudio"></audio>
        <div class = "camera-icon"></div>
        <div class = "mute-icon"></div>
        <div class = "hangup-icon"></div>
        <div class = "voice-icon"></div>
        <span class = "change-camera-text">切换摄像头</span>
        <span class = "mute-text">静音</span>
        <span class = "voice-text">音量</span>
        <span class = "hangup-text">挂断</span>
        <img class = "user-img" src="../../../static/Img/User/user-40px@2x.png">
    </div>
    </template>

<script>
import {mxVoIP} from "../../packages/data/mxVoIP.js"
export default {
    data(){
        return{
            bSmallWindow: false
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
        createVideoChat(roomInfo){
            this.callChat.videoCall(roomInfo, this);
        },

        showSmallWindow(){
            this.bSmallWindow = true;
        }
    },
    mounted(){
        console.log("videochat mounted")
        this.callChat = new mxVoIP();
        this.callChat.createMatrix()  
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
</style>