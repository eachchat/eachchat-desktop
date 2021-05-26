<template>
    <div>
        <favouritedetail v-show = "bFavouriteDetail" :collectionInfo = "collectionInfo"></favouritedetail>
        <reportRelationContent v-show = 'bReportRelationContent' :userInfo = "userInfo"></reportRelationContent>
        <VoIPVideo ref = "voipVideoRef" v-show = "bVideoChat" :roomInfo = "roomInfo"></VoIPVideo>
    </div>
</template>

<script>
import favouritedetail from "./favourite-detail";
import reportRelationContent from "./reportRelationContent";
import VoIPVideo from "./videochat"
import {mxVoIP} from "../../packages/data/mxVoIP.js"



const ipcRenderer = require('electron').ipcRenderer

export default {
   components: {
        favouritedetail,
        reportRelationContent,
        VoIPVideo
    },
    data(){
        return {
            bFavouriteDetail: false,
            collectionInfo: {},
            bReportRelationContent: false,
            userInfo: {},
            bVideoChat: false,
            roomInfo: {},
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
        },

        showFavouriteDetail(){
            this.bFavouriteDetail = true;
            this.bReportRelationContent = false;
            this.bVideoChat = false;
        },

        showRelationShip(){
            this.bReportRelationContent = true;
            this.bFavouriteDetail = false;
            this.bVideoChat = false;
        },

        showVideoChat(){
            this.bVideoChat = true;
            this.bReportRelationContent = false;
            this.bFavouriteDetail = false;
        },
    },

    mounted(){
        this.voipChat = new mxVoIP();
        global.viopChat = this.voipChat;
        this.voipChat.setVideoChat(this.$refs.voipVideoRef);
        this.voipChat.createMatrix();
        
        console.log("childwindow mounted")
        ipcRenderer.on("childwindowArgs", this.onChildWindow)
    },

    created(){
    }
}
</script>

<style>

</style>