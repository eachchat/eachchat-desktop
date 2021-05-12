<template>
  <favouritedetail v-show = "bFavouriteDetail" :collectionInfo = "collectionInfo"></favouritedetail>
</template>

<script>
import favouritedetail from "./favourite-detail";
const ipcRenderer = require('electron').ipcRenderer

export default {
   components: {
       favouritedetail
    },
    data(){
        return {
            bFavouriteDetail: false,
            collectionInfo: {}
        }
    },

    methods:{
        onChildWindow(e, args){
            console.log(args)
            if(args.type === 'clickedCollectionInfo'){
                this.bFavouriteDetail = true;
                //setTimeout(()=>{
                    this.collectionInfo = args.args;
                //})
            }
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