<template>
    <div>
        <video class = "large-window" id = "large-window"></video>
        <video class = "small-window" id = "small-window"></video>
        <audio controls="controls" class = "small-window" id = "audio-window"></audio>
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
    </div>
    </template>

<script>
import {CallChat} from "../../packages/data/callchat.js"
export default {
    data(){
        return{

        }
    },
    props:{
        roomInfo:{
            type:Object,
            default:{}
        }
    },
    methods:{

    },
    mounted(){
        console.log("videochat mounted")
        this.roomInfo.roomID = "!wfVGDZZtuMgzBTdCwL:staging.eachchat.net";
        this.callChat = new CallChat();
        this.callChat.createMatrix().then(async res =>{
            console.log("begin matrix")
            console.log(res)
            console.log("end matrix")
            await this.callChat.createVideoChat(this.roomInfo);
        }); 
        //if(this.callChat === {}) return;
        
    }
}
</script>

<style>
.large-window{
    z-index: 0;
    width: 100%;
    height: 100%;
    position: absolute;
}

.small-window{
    z-index: 1;
    width: 96px;
    height: 170px;
    margin: 8px 8px 0 0;
    border: 1px solid rgba(0, 0, 0, 255);
}

.video-icon{
  width: 44px;
  height: 44px;
}

</style>