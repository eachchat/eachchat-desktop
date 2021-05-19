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
        }
    },
    data () {
        return {
            voipTimeLabel: "通话时长 ",
            voipTime: "00:00",
            roomId: "",
            voipType: "",
            userInfo: {},
        }
    },
    methods: {
       getVoipImg() {
           if(this.voipType === "voice") {
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
            ipcRenderer.send("createChildWindow", {type: "voiceChatWindow",
            size:{width:300,height: 480},
            voipInfo: {
                voipType: this.voipType,
                voipFrame: "webRtc",
                roomId: this.roomId,
                voipShowInfo: {
                    userImg: this.userInfo.userImg,
                    userName: this.userInfo.userName
                }
            }})
       }
    },
    watch: {
        callId: function() {
            setTimeout(() => {
                this.$nextTick(() => {
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
        width: 148px;
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