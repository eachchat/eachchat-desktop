<template>
    <div>
        <favouritedetail v-show = "bFavouriteDetail" :collectionInfo = "collectionInfo"></favouritedetail>
        <reportRelationContent v-show = 'bReportRelationContent' :userInfo = "userInfo"></reportRelationContent>
        <TransmitMsgListDlg v-show='bTransmitMsgListDlg' :transMsgInfo="transMsgInfo"></TransmitMsgListDlg>
    </div>
</template>

<script>
import favouritedetail from "./favourite-detail";
import reportRelationContent from "./reportRelationContent";
import TransmitMsgListDlg from './transmitTogetherContent.vue';


const ipcRenderer = require('electron').ipcRenderer

export default {
   components: {
        favouritedetail,
        reportRelationContent,
        TransmitMsgListDlg
    },
    data(){
        return {
            bFavouriteDetail: false,
            collectionInfo: {},
            bReportRelationContent: false,
            userInfo: {},
            bTransmitMsgListDlg: false,
            transMsgInfo: [],
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
            else if(args.type === "TransmitMsgList"){
                this.showTransmitMsgLisg();
                this.transMsgInfo = args.args.list;
            }
        },

        showFavouriteDetail(){
            this.bFavouriteDetail = true;
            this.bReportRelationContent = false;
            this.bTransmitMsgListDlg = false;
        },

        showRelationShip(){
            this.bReportRelationContent = true;
            this.bFavouriteDetail = false;
            this.bTransmitMsgListDlg = false;
        },

        showTransmitMsgLisg() {
            this.bTransmitMsgListDlg = true;
            this.bFavouriteDetail = false;
            this.bReportRelationContent = false;
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