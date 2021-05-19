<template>
    <div>
        <favouritedetail v-show = "bFavouriteDetail" :collectionInfo = "collectionInfo"></favouritedetail>
        <reportRelationContent v-show = 'bReportRelationContent' :userInfo = "userInfo"></reportRelationContent>
        <VoIPVoice v-show = "bVoiceChat" :voipInfo="voipInfo"></VoIPVoice>
        <videochat v-if = "bVideoChat" :roomInfo = "roomInfo"></videochat>
    </div>
</template>

<script>
import favouritedetail from "./favourite-detail";
import reportRelationContent from "./reportRelationContent";
import videochat from "./videochat"
import VoIPVoice from './voicechat.vue';

const ipcRenderer = require('electron').ipcRenderer

export default {
   components: {
        favouritedetail,
        reportRelationContent,
        videochat,
        VoIPVoice,
    },
    data(){
        return {
            bFavouriteDetail: false,
            collectionInfo: {},
            bReportRelationContent: false,
            userInfo: {},
            bVideoChat: true,
            roomInfo: {},
            bVoiceChat: false,
            voipInfo: {},
        }
    },

    methods:{
        onChildWindow(e, args){
            console.log(args)
            if(args.type === 'clickedCollectionInfo'){
                this.showFavouriteDetail();
                this.collectionInfo = args.args;
            }
            else if(args.type === "showReportRelationWindow"){
                this.showRelationShip();
                this.userInfo = args.args
            }
            else if(args.type === "videoChatWindow"){
                this.showVideoChat();
                this.roomInfo = args.args;
            }
            else if(args.type === "voiceChatWindow") {
                this.showVoiceChat();
                this.voipInfo = args.voipInfo;
            }
        },

        showFavouriteDetail(){
            this.bFavouriteDetail = true;
            this.bReportRelationContent = false;
            this.bVideoChat = false;
            this.bVoiceChat = false;
        },

        showRelationShip(){
            this.bReportRelationContent = true;
            this.bFavouriteDetail = false;
            this.bVideoChat = false;
            this.bVoiceChat = false;
        },

        showVideoChat(){
            this.bVideoChat = true;
            this.bReportRelationContent = false;
            this.bFavouriteDetail = false;
            this.bVoiceChat = false;
        },

        showVoiceChat(){
            this.bVideoChat = false;
            this.bReportRelationContent = false;
            this.bFavouriteDetail = false;
            this.bVoiceChat = true;
        }
    },

    mounted(){
        console.log("childwindow mounted")
        ipcRenderer.on("childwindowArgs", this.onChildWindow)
    },

    created(){
    }
}
</script>

<style>

</style>