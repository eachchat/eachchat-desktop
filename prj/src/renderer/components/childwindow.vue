<template>
    <div>
        <favouritedetail v-show = "bFavouriteDetail" :collectionInfo = "collectionInfo"></favouritedetail>
        <reportRelationContent v-show = 'bReportRelationContent' :userInfo = "userInfo"></reportRelationContent>
    </div>
</template>

<script>
import favouritedetail from "./favourite-detail";
import reportRelationContent from "./reportRelationContent";


const ipcRenderer = require('electron').ipcRenderer

export default {
   components: {
        favouritedetail,
        reportRelationContent
    },
    data(){
        return {
            bFavouriteDetail: false,
            collectionInfo: {},
            bReportRelationContent: false,
            userInfo: {},
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
        },

        showFavouriteDetail(){
            this.bFavouriteDetail = true;
            this.bReportRelationContent = false;
        },

        showRelationShip(){
            this.bReportRelationContent = true;
            this.bFavouriteDetail = false;
        },
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