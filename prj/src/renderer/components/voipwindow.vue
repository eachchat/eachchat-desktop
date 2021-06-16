<template>
    <div>
        <VoIPVideo ref = "voipVideoRef" v-show = "bVideoChat" :roomInfo = "roomInfo"></VoIPVideo>
    </div>
</template>

<script>
import VoIPVideo from "./videochat"
import {mxVoIP} from "../../packages/data/mxVoIP.js"

const ipcRenderer = require('electron').ipcRenderer

export default {
   components: {
        VoIPVideo
    },
    data(){
        return {
            bVideoChat: false,
            roomInfo: {},
        }
    },

    methods:{
        onVoipWindow(e, args){
            console.log(args)
            if(args.type === "videoChatWindow"){
                let calling = global.viopChat.callingCall();
                if(calling && calling.roomId != args.args.roomID ) 
                {
                    return;
                }
                if(calling && calling.roomId === args.args.roomID && calling.state === "connecting"){
                    return;
                }
                this.showVideoChat();
                this.roomInfo = args.args;
            }
        },

        showVideoChat(){
            this.bVideoChat = true;
        },
    },

    mounted(){
        console.log("viopwindow")
        this.voipChat = new mxVoIP();
        global.viopChat = this.voipChat;
        this.voipChat.setVideoChat(this.$refs.voipVideoRef);
        this.voipChat.createMatrix();
        
        console.log("voipwindow mounted")
        ipcRenderer.on("voipwindowArgs", this.onVoipWindow)
    },

    created(){
    }
}
</script>

<style>

</style>