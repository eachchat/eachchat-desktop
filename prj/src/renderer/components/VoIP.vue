<template>
    <div class="chat-msg-content-voip" :id="generalId()" v-on:click="callBack()" >
        <div class="voipWithoutTimeAndType" v-show="isVideoAndDuration()">
            <div class="voip-notype-notime" alt="通话结束" style="vertical-align:middle">{{voipTimeLabel}}</div>
        </div>
        <div class="voipTimeZero" v-show="duration == 0">
            <img class="voip-icon" :src="getVoipImg()" style="vertical-align:middle">
            <div class="voip-notime" alt="通话结束" style="vertical-align:middle">{{voipTimeLabel}}</div>
        </div>
        <div class="voipTime" v-show="duration > 0">
            <img class="voip-icon" :src="getVoipImg()" style="vertical-align:middle">
            <div class="voip-time" alt="通话结束" style="vertical-align:middle">{{voipTimeLabel + voipTime}}</div>
        </div>
    </div>
</template>

<script>
import {ComponentUtil} from '../script/component-util.js';
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
        isVideo: {
            type: Number,
            default: -1
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
            voipElementId: "",
        }
    },
    methods: {
        isVideoAndDuration() {
            return (this.isVideo == -1 || this.duration == -1);
        },
        generalId() {
            let id = this.callId + "-" + Math.random().toString(36).slice(6);
            this.voipElementId = id;
            return id;
        },
        getVoipImg() {
            if(this.isVideo == 1) {
                if(this.isMine) return "./static/Img/Chat/VoIPVideoMine.svg";
                else return "./static/Img/Chat/VoIPVideoOthers.svg";
            } 
            else if(this.isVideo == 0) {
                if(this.isMine) return "./static/Img/Chat/VoIPVideoMine.svg";
                else return "./static/Img/Chat/VoIPVoiceOthers.svg";
            }
            else {
                return "";
            }
        },
        callBack() {
            //    mxVoIP.voiceCall(this.roomId);
            console.log("======= theType ", theType)
                ipcRenderer.send("createChildWindow", {type: "videoChatWindow",
                    size:{width:300,height: 480},
                    roomInfo: { roomID: this.roomId,
                                name: this.userInfo.userName,
                                url:this.userInfo.userImg,
                                voipType: this.isVideo == 1 ? "video" : "voice",
                                action: "call"}});
        }
    },
    watch: {
        callId: function() {
            setTimeout(() => {
                this.$nextTick(() => {
                    let msgElement = document.getElementById(this.voipElementId);
                    if(this.isVideo == -1 || this.duration == -1) {
                        this.voipTimeLabel = "通话结束";
                    }
                    else {
                        if(this.duration == 0) {
                            this.voipTimeLabel = this.isVideo == 1 ? "视频通话" : "语音通话";
                        }
                        else {
                            let duration = Math.floor(this.duration/1000);
                            let str = ComponentUtil.numToTime(duration);
                            this.voipTimeLabel = "通话时长：";
                            this.voipTime = str;
                        }
                    }
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
        border-radius: 5px;
        text-align: left;
        font-size: 0px;
        margin: 0;
    }

    .voipTime {
        float:right;
        // background-color: rgba(82, 172, 68, 1);
        border-radius: 5px;
        text-align: left;
        font-size: 0px;
        margin: 0;
        width: 158px;
        height: 40px;
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

    .voip-notype-notime {
        width: 60px;
        height: 20px;
        margin: 10px 12px 10px 12px;
        display: inline-block;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 20px;
        letter-spacing: 0px;
        font-family: 'PingFangSC-Regular';
        font-weight: 400;
        font-size: 14px;
    }

    .voip-notime {
        width: 60px;
        height: 20px;
        margin: 10px 12px 10px 4px;
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