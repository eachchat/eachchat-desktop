<template>
    <div>
        <favouritedetail v-show = "bFavouriteDetail" :collectionInfo = "collectionInfo"></favouritedetail>
        <reportRelationContent v-show = 'bReportRelationContent' :userInfo = "userInfo"></reportRelationContent>
        <videochat v-show = "bVideoChat"></videochat>
    </div>
</template>

<script>
import favouritedetail from "./favourite-detail";
import reportRelationContent from "./reportRelationContent";
import videochat from "./videochat"

const ipcRenderer = require('electron').ipcRenderer

export default {
   components: {
        favouritedetail,
        reportRelationContent,
        videochat
    },
    data(){
        return {
            bFavouriteDetail: false,
            collectionInfo: {},
            bReportRelationContent: false,
            userInfo: {},
            bVideoChat: false,
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