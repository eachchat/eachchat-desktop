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
        <div :class = "GetMeterDiv()" @mouseover="showVoiceInput2"  @mouseleave="hideMouseInput2" v-show = "bShowVoice1 || bShowVoice2">
            <div class = "audioMeterBackground">
                <input type = "range" class = "audioMeter" @change = "changeVoice" v-model="nVoice" min = "0" max = "100" step="1"></input>
            </div>
        </div>
        
        <audio id="remoteAudio"></audio>
        <div :class = "GetChatTimeStyle()" v-show = "state == 'connected'">{{getChatTime()}}</div>
        <div>
            <img class = "top-stick" v-if = "bTop" src = "../../../static/Img/VoIP/top.svg" @click = "unTopStick">
            <img class = "top-stick" v-else src = "../../../static/Img/VoIP/untop.svg" @click="topStick"> 
        </div>
        <img :class = "GetUserImgStyle()" v-show="bShowStateText" src="../../../static/Img/User/user-40px@2x.png" id = "video-chat-user-img"
        onerror = "this.src = './static/Img/User/user-40px@2x.png'">
        <div :class = "GetUserNameStyle()" v-show="bShowStateText">{{useName}}</div>
        <div :class = "GetStateTextStyle()" v-show="bShowStateText">{{stateText}}</div>
        <div v-if = "bComming">
            <div class = "comming-hangup-icon" @click="afterCallState"></div>
            <div class = "comming-answer-icon" @click="answerState"></div>
        </div>
        <div v-else>
            <div v-if = "isMute" :class = "GetMuteIconStyle()" @click="muteVoice"></div>
            <div v-else :class = "GetUnMuteIconStyle()" @click="unMuteVoice"></div>
            <div :class = "GetHangupIconStyle()" @click="afterCallState"></div>
            <div :class = "GetVoiceIconStyle()" @click="voiceClick"  @mouseover="showVoiceInput1" @mouseleave="hideMouseInput1">
                <img id = "voice-icon-id" src="../../../static/Img/VoIP/voice.svg" v-if = "this.nVoice !== '0'">
                <img src = "../../../static/Img/VoIP/slience.svg" v-else>
            </div>
            <span :class = "GetMuteTextStyle()">静音</span>
            <span :class = "GetVoiceTextStyle()">音量</span>
            <span :class = "GetHangupTextStyle()">挂断</span>
        </div>
        
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'
import {ComponentUtil} from '../script/component-util.js';
import {pause} from "../../packages/data/mxVoIP.js"

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
            this.state = "";
            this.nTime = 0;
            if(this.roomInfo.direction === "from"){
                if(this.roomInfo.action && this.roomInfo.action == "show") {
                    this.beforeAnswerState();
                }
                else if(this.roomInfo.action && this.roomInfo.action == "answer") {
                    pause("ringAudio");
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
            return ComponentUtil.numToTime(this.nTime);
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
                this.bShowStateText = true;
                this.stateText = "已接通";
                clearInterval(this.intervalTime);
            }
            
            this.state = "connected"
            this.chatTime = setInterval(() => {
                this.nTime++;
            }, 1000)
        },

        afterCallState(){
            if(global.viopChat) global.viopChat.hangUp(this.roomInfo.roomID, this.nTime * 1000);
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
            this.setCallInfo(this.roomInfo);
        },

        answerState(){
            if(this.roomInfo.voipType == "video") {
                global.viopChat.answerVideoChat(this.roomInfo.roomID, this);
            }
            else{
                global.viopChat.answerVoiceChat(this.roomInfo.roomID);
            }
            this.setCallInfo(this.roomInfo);
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

        setCallInfo(roomInfo){
            let url = roomInfo.url;
            let imgEle = document.getElementById("video-chat-user-img");
            if(imgEle){
                if(url.length === 0){
                    url = "./static/Img/User/user-40px.svg";
                }  
                imgEle.src = url;
            }
            this.useName = roomInfo.name;
        },

        createChat(roomInfo){
            this.showStateText("正在接通中");
            if(roomInfo.voipType == "video") {
                global.viopChat.videoCall(roomInfo, this);
            }
            else {
                global.viopChat.voiceCall(roomInfo.roomID);
            }
            this.setCallInfo(roomInfo);
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
        },

        GetUserImgStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-user-img";
            }
            return "audio-user-img";
        },

        GetUserNameStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-username";
            }
            return "audio-username"; 
        },

        GetStateTextStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-stateText";
            }
            return "audio-stateText";
        },

        GetMuteIconStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-mute-icon";
            }
            return "audio-mute-icon";
        },

        GetUnMuteIconStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-unmute-icon";
            }
            return "audio-unmute-icon";
        },

        GetHangupIconStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-hangup-icon";
            }
            return "audio-hangup-icon";
        },

        GetVoiceIconStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-voice-icon";
            }
            return "audio-voice-icon";
        },

        GetMuteTextStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-mute-text";
            }
            return "audio-mute-text";
        },

        GetVoiceTextStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-voice-text";
            }
            return "audio-voice-text";
        },

        GetHangupTextStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-hangup-text";
            }
            return "audio-hangup-text";
        },

        GetMeterDiv(){
            if(this.roomInfo.voipType === "video"){
                return "videoMeterDiv";
            }
            return "audioMeterDiv";
        },

        GetChatTimeStyle(){
            if(this.roomInfo.voipType === "video"){
                return "video-chat-time";
            }
            return "audio-chat-time";
        }
    },
    created(){
        
    },

    mounted(){
        console.log("videochat mounted")
        ipcRenderer.on("closeVideoChatWindowBrowser", this.closeWindow)
    }
}
</script>

<style>
::-webkit-scrollbar {
    display: none;
}

.large-window{
    z-index: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    background: #4A4C5B;
    box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.17);
    border-radius: 4px;
}

.small-window{
    position: relative;
    float:right;
    z-index: 1;
    width: 140px;
    height: 80px;
    margin: 32px 8px 0 0;
    background: #4A4C5B;
}

.top-stick{
    position: absolute;
    right: 10px;
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

.audio-mute-icon{
    position: absolute;
    z-index: 1;
    left: 44px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/muteMicphone.svg"); 
}

.video-mute-icon{
    position: absolute;
    z-index: 1;
    left: 214px;
    top: 244px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/muteMicphone.svg"); 
}

.audio-mute-icon:hover{
    position: absolute;
    z-index: 1;
    left: 44px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/muteMicphone-hover.svg"); 
}

.video-mute-icon:hover{
    position: absolute;
    z-index: 1;
    left: 214px;
    top: 244px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/muteMicphone-hover.svg"); 
}

.audio-unmute-icon{
    position: absolute;
    z-index: 1;
    left: 44px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/mutedMicphone.svg"); 
}

.video-unmute-icon{
    position: absolute;
    z-index: 1;
    left: 214px;
    top: 244px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/mutedMicphone.svg"); 
}

.audio-hangup-icon{
    position: absolute;
    z-index: 1;
    left: 128px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup.svg"); 
}

.video-hangup-icon{
    position: absolute;
    z-index: 1;
    left: 298px;
    top: 244px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup.svg"); 
}

.audio-hangup-icon:hover{
    position: absolute;
    z-index: 1;
    left: 128px;
    top: 404px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup-hover.svg"); 
}

.video-hangup-icon:hover{
    position: absolute;
    z-index: 1;
    left: 298px;
    top: 244px;
    width: 44px;
    height: 44px;
    background-image: url("../../../static/Img/VoIP/hangup-hover.svg"); 
}

.audio-voice-icon{
    position: absolute;
    z-index: 1;
    left: 212px;
    top: 404px;
    width: 44px;
    height: 44px;
}

.video-voice-icon{
    position: absolute;
    z-index: 1;
    left: 382px;
    top: 244px;
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

.audio-mute-text{
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

.video-mute-text{
    z-index: 1;
    position: absolute;
    left: 226px;
    top: 296px;
    width: 20px;
    display: block;
    overflow-wrap: break-word;
    color: rgba(153, 153, 153, 1);
    font-size: 10px;
    font-family: PingFangSC-Regular;
    line-height: 12px;
    text-align: center;
}

.audio-voice-text{
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

.video-voice-text{
    z-index: 1;
    position: absolute;
    left: 394px;
    top: 296px;
    width: 20px;
    display: block;
    overflow-wrap: break-word;
    color: rgba(153, 153, 153, 1);
    font-size: 10px;
    font-family: PingFangSC-Regular;
    line-height: 12px;
    text-align: center;
}

.video-hangup-text{
    z-index: 1;
    position: absolute;
    left: 310px;
    top: 296px;
    width: 20px;
    display: block;
    overflow-wrap: break-word;
    color: rgba(153, 153, 153, 1);
    font-size: 10px;
    font-family: PingFangSC-Regular;
    line-height: 12px;
    text-align: center;
}

.audio-hangup-text{
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

.audio-user-img{
    z-index: 1;
    position: absolute;
    left: 120px;
    top: 120px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
}

.video-user-img{
    z-index: 1;
    position: absolute;
    left: 290px;
    top: 80px;
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

.videoMeterDiv{
    position: absolute;
    width: 26px;
    height: 130px;
    left: 390px;
    top: 136px;
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

.video-username{
    position: absolute;
    text-align: center;
    top: 152px;
    width: 640px;
    height: 22px;
    font-size: 16px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 22px;
}

.audio-username{
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

.audio-stateText{
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

.video-stateText{
    position: absolute;
    text-align: center;
    top: 182px;
    width: 640px;
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

.audio-chat-time{
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

.video-chat-time{
    position: absolute;
    z-index: 1;
    left: 300px;
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