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
        <div class = "audioMeterDiv" @mouseover="showVoiceInput2"  @mouseleave="hideMouseInput2" v-show = "bShowVoice1 || bShowVoice2">
            <div class = "audioMeterBackground">
                <input type = "range" class = "audioMeter" @change = "changeVoice" v-model="nVoice" min = "0" max = "100" step="1"></input>
            </div>
        </div>
        
        <audio id="remoteAudio"></audio>
        
        <div class = "chat-time" v-show = "state == 'connected'">{{getChatTime()}}</div>
        <div>
            <img class = "top-stick" v-if = "bTop" src = "../../../static/Img/VoIP/top.svg" @click = "unTopStick">
            <img class = "top-stick" v-else src = "../../../static/Img/VoIP/untop.svg" @click="topStick"> 
        </div>
        <img class = "user-img" v-show="bShowStateText" src="../../../static/Img/User/user-40px@2x.png" id = "video-chat-user-img"
        onerror = "this.src = './static/Img/User/user-40px@2x.png'">
        <div class = "username" v-show="bShowStateText">{{useName}}</div>
        <div class = "stateText" v-show="bShowStateText">{{stateText}}</div>
        <div v-if = "bComming">
            <div class = "comming-hangup-icon" @click="afterCallState"></div>
            <div class = "comming-answer-icon" @click="answerState"></div>
        </div>
        <div v-else>
            <div v-if = "isMute" class = "mute-icon" @click="muteVoice"></div>
            <div v-else class = "unmute-icon" @click="unMuteVoice"></div>
            <div class = "hangup-icon" @click="afterCallState"></div>
            <div class = "voice-icon" @click="voiceClick"  @mouseover="showVoiceInput1" @mouseleave="hideMouseInput1">
                <img id = "voice-icon-id" src="../../../static/Img/VoIP/voice.svg" v-if = "this.nVoice !== '0'">
                <img src = "../../../static/Img/VoIP/slience.svg" v-else>
            </div>
            <span class = "mute-text">静音</span>
            <span class = "voice-text">音量</span>
            <span class = "hangup-text">挂断</span>
        </div>
        
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'

export default {
    data(){
        return{
            bSmallWindow: false,
            isMute: true,
            nVoice: 100,
            nOldVoice: 0,
            useName: "",
            stateText: "",
            bShowStateText: true,
            intervalTime: undefined,
            chatTime: undefined,
            bComming: false,
            nTime: 0,
            state: "",
            bTop: false,
            bShowVoice1: false,
            bShowVoice2: false

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
            this.bTop = false;
            this.stateText = "";
            this.nTime = 0;
            if(this.roomInfo.direction === "from"){
                if(this.roomInfo.action && this.roomInfo.action == "show") {
                    this.beforeAnswerState();
                }
                else if(this.roomInfo.action && this.roomInfo.action == "answer") {
                    this.answerState();
                }
                else if(this.roomInfo.action && this.roomInfo.action == "hangup") {
                    this.afterCallState();
                }
            }
            else{
                this.beforeCallState();
            }
        }
    },

    methods:{
        voiceClick(){
            let videoElm = document.getElementById("remoteAudio");
            if(videoElm){
                if(videoElm.volume !== 0){
                    videoElm.volume = 0;
                    this.nOldVoice = this.nVoice;
                    this.nVoice = "0";
                }
                else{
                    this.nVoice = this.nOldVoice;
                    videoElm.volume = this.nVoice / 100;
                }   
            }
        },

        showVoiceInput1(){
            this.bShowVoice1 = true;
        },
        showVoiceInput2(){
            this.bShowVoice2 = true;
        },

        hideMouseInput1(){
            this.bShowVoice1 = false;
        },

        hideMouseInput2(){
            this.bShowVoice2 = false;
        },
        
        topStick(){
            ipcRenderer.send("topVideoChat");
            this.bTop = true;
        },

        unTopStick(){
            ipcRenderer.send("unTopVideoChat");
            this.bTop = false;
        },

        getChatTime(){
            let nHour = Math.floor(this.nTime / 3600);
            let nMinute = Math.floor(this.nTime / 60) % 60;
            let nSec = this.nTime % 60;
            let str = "";
            if(nHour != 0){
                str += nHour;
                str += ":"
            }
            if(nMinute > 10){
                str += nMinute;
            }
            else{
                str += "0";
                str += nMinute;
            }
            str += ":"
            if(nSec > 10){
                str += nSec
            }
            else{
                str += "0";
                str += nSec;
            }
            return str;
        },

        beforeCallState(){
            this.createChat(this.roomInfo);
            this.bComming = false;
        },

        connectedState(type){
            if(type === "video"){
                this.showSmallWindow();
                this.hideStateText();
            }
            else{
                this.stateText = "已接通"
            }
            
            this.state = "connected"
            this.chatTime = setInterval(() => {
                this.nTime++;
            }, 1000)
        },

        afterCallState(){
            global.viopChat.hangUp(this.roomInfo.roomID, this.nTime * 1000);
            ipcRenderer.send("hideVideoChat");
            this.hideStateText();
            clearInterval(this.chatTime);
        },

        beforeAnswerState(){
            this.bComming = true;
            if(this.roomInfo.voipType == "video") {
                this.showStateText("邀请你视频通话");
            }
            else {
                this.showStateText("邀请你语音通话");
            }
            let url = this.roomInfo.url;
            if(url.length != 0){
                let imgEle = document.getElementById("video-chat-user-img");
                if(imgEle){
                    imgEle.src = url;
                }
            }
            this.useName = this.roomInfo.name;
        },

        answerState(){
            if(this.roomInfo.voipType == "video") {
                global.viopChat.answerVideoChat(this.roomInfo.roomID, this);
            }
            else{
                global.viopChat.answerVoiceChat(this.roomInfo.roomID);
            }
        },

        afterAnswerState(){
        },

        updateStateText(stateText){
            if(this.stateText === ""){
                this.stateText = stateText
            }
            else if(this.stateText === stateText){
                this.stateText += "."
            }
            else if(this.stateText === stateText + "."){
                this.stateText += "."
            }
            else if(this.stateText === stateText + ".."){
                this.stateText += "."
            }
            else if(this.stateText === stateText + "..."){
                this.stateText = stateText
            }
        },

        showStateText(stateText){
            this.bShowStateText = true;
            this.intervalTime = setInterval(() => {
                this.updateStateText(stateText);
            }, 1000)
        },

        hideStateText()
        {
            this.bShowStateText = false;
            clearInterval(this.intervalTime);
            this.bComming = false;
        },

        changeVoice(){
            console.log(this.nVoice)
            let videoElm = document.getElementById("remoteAudio");
            if(videoElm){
                videoElm.volume = this.nVoice / 100;
            }
        },

        createChat(roomInfo){
            this.showStateText("正在接通中");
            if(roomInfo.voipType == "video") {
                global.viopChat.videoCall(roomInfo, this);
            }
            else {
                global.viopChat.voiceCall(roomInfo.roomID);
            }
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

        closeWindow(){
            if(this.roomInfo && this.roomInfo.roomID){
                global.viopChat.hangUp(this.roomInfo.roomID, this.nTime * 1000);
                this.hideStateText();
            }
        },

        muteVoice(){
            global.viopChat.muteVoice(this.roomInfo.roomID);
            this.isMute = false;
        },

        unMuteVoice(){
            global.viopChat.unMuteVoice(this.roomInfo.roomID);
            this.isMute = true;
        }
    },
    mounted(){
        console.log("videochat mounted")
        ipcRenderer.on("closeChildRenderWindowBrowser", this.closeWindow)
    }
}
</script>

<style>
::-webkit-scrollbar {
    display: none;
}

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
    margin: 32px 8px 0 0;
    background: #4A4C5B;
}

.top-stick{
    position: absolute;
    left: 272px;
    top: 12px;
    width: 16px;
    height: 16px;
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
    background-image: url("../../../static/Img/VoIP/muteMicphone.svg"); 
}

.mute-icon:hover{
    position: absolute;
    z-index: 1;
    left: 44px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/muteMicphone-hover.svg"); 
}

.unmute-icon{
    position: absolute;
    z-index: 1;
    left: 44px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/mutedMicphone.svg"); 
}

.hangup-icon{
    position: absolute;
    z-index: 1;
    left: 128px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup.svg"); 
}

.hangup-icon:hover{
    position: absolute;
    z-index: 1;
    left: 128px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup-hover.svg"); 
}

.voice-icon{
    position: absolute;
    z-index: 1;
    left: 212px;
    top: 404px;
    width: 44px;
    height: 44px;
}

#voice-icon-id:hover {
 content:url("../../../static/Img/VoIP/voice-hover.svg");
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

.audioMeterDiv{
    position: absolute;
    width: 26px;
    height: 130px;
    left: 221px;
    top: 296px;
}

.audioMeterBackground{
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

.comming-hangup-icon{
    position: absolute;
    z-index: 1;
    left: 60px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup.svg"); 
}

.comming-hangup-icon{
    position: absolute;
    z-index: 1;
    left: 60px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup-hover.svg"); 
}

.comming-answer-icon{
    position: absolute;
    z-index: 1;
    left: 196px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/answer.svg"); 
}

.chat-time{
    position: absolute;
    z-index: 1;
    left: 136px;
    top: 10px;
    width: 28px;
    height: 18px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 18px;
}
</style>