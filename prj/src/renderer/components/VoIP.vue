<template>
    <div class="chat-msg-content-voip" :id="callId" v-on:click="callBack()" >
        <img class="voip-icon" :src="getVoipImg()" style="vertical-align:middle">
        <div class="voip-time" alt="通话时长 " style="vertical-align:middle">{{voipTimeLabel + voipTime}}</div>
    </div>
</template>

<script>
import {mxVoIP} from "../../packages/data/mxVoIP";
import {ipcRenderer} from 'electron';
export default {
    name: 'VoIP',
    props: {
        callId: {
            type: String,
            default: ''
        },
        isMine: {
            type: Boolean,
            default: false
        },
        voipInfo: {
            type: Object,
            default: {}
        },
        isVoice: {
            type: Boolean,
            default: true
        },
        duration: {
            type: Number,
            default: -1
        }
    },
    data () {
        return {
            voipTimeLabel: "",
            voipTime: "",
            roomId: "",
            voipType: "",
            userInfo: {},
        }
    },
    methods: {
       getVoipImg() {
           if(this.isVoice) {
               if(this.isMine) return "../../../static/Img/Chat/VoIPVoiceMine@2x.png";
               else return "../../../static/Img/Chat/VoIPVoiceOthers@2x.png";
           } 
           else {
               if(this.isMine) return "../../../static/Img/Chat/VoIPVideoMine@2x.png";
               else return "../../../static/Img/Chat/VoIPVideoOthers@2x.png";
           }
       },
       callBack() {
        //    mxVoIP.voiceCall(this.roomId);
        let theType = this.isVoice == true ? "voice" : "video"
        console.log("======= theType ", theType)
            ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
                size:{width:300,height: 480},
                roomInfo: { roomID: this.roomId,
                            name: this.userInfo.userName,
                            url:this.userInfo.userImg,
                            voipType: this.isVoice == true ? "voice" : "video",
                            action: "call"}});
       }
    },
    watch: {
        callId: function() {
            setTimeout(() => {
                this.$nextTick(() => {
                    this.voipTimeLabel = this.isVoice ? "语音通话" : "视频通话";
                    let msgElement = document.getElementById(this.callId);
                    if(msgElement) {
                        if(this.isMine) {
                            msgElement.style.float = "right";
                            msgElement.style.backgroundColor = "rgba(82, 172, 68, 1)";
                            msgElement.style.fontFamily = "PingFangSC-Light"
                            msgElement.style.color = "white";
                        }
                        else{
                            msgElement.style.float = "left";
                            msgElement.style.backgroundColor = "rgba(255, 255, 255, 1)";
                            msgElement.style.color = "rgba(0, 0, 0, 1)";
                        }
                    }
                    let duration = this.duration/1000;
                    if(this.duration != -1) {
                        let nHour = Math.floor(duration / 3600);
                        let nMinute = Math.floor(duration / 60) % 60;
                        let nSec = duration % 60;
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
                        

                        msgElement.style.width = "158px";
                        this.voipTimeLabel = "通话时长：";
                        this.voipTime = str;
                    }
                    else {
                        msgElement.style.width = "108px";
                    }
                })
            }, 0)
        },
        voipInfo: function() {
            this.voipType = this.voipInfo.voipType;
            this.roomId = this.voipInfo.roomId;
            this.userInfo = this.voipInfo.userInfo;
        }
    }
}
</script>

<style lang="scss" scoped>
    .chat-msg-content-voip {
        float:right;
        // background-color: rgba(82, 172, 68, 1);
        width: 108px;
        height: 40px;
        border-radius: 5px;
        text-align: left;
        font-size: 0px;
        margin: 0;
    }

    .voip-icon {
        width: 20px;
        height: 20px;
        margin: 10px 4px 10px 12px;
        display: inline-block;
    }

    .voip-time {
        width: calc(100% - 50px);
        height: 20px;
        margin: 10px 12px 10px 0px;
        display: inline-block;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        letter-spacing: 0px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        font-size: 14px;
    }
</style>