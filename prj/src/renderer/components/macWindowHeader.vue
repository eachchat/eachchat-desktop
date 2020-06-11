<template>
    <div class="window-header-bar">
            <img class="close-image" @click="Close()" src="../../../static/Img/Main/Close@2x.png">
            <img class="min-image" @click="Min()" src="../../../static/Img/Main/Minimise@2x.png">
            <img class="zoom-image" @class="Zoom()" src="../../../static/Img/Main/Zoom@2x.png">
    </div>

</template>

<script>
import { ipcRenderer } from 'electron'
export default {
    name: 'macWinHeadbar',
    data () {
        return {
        }
    },
    methods: {
        Min:function() {
            ipcRenderer.send("win-min");
        },
        Close: function() {
            ipcRenderer.send("win-close");
        },
        Zoom:function() {
            ipcRenderer.send("win-zoom");
        }
    },
    components: {
    },
    created: function () {
    }
}
</script>

<style lang="scss" scoped>
.window-header-bar {
    width: 64px;
    height: 12px;
    font-size: 0px;
    .close-image {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 6px;
        padding-left: 6px;
        padding-top: 7px;

    }
    .min-image {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 6px;
        padding-left: 8px;
        padding-top: 7px;
    }
    .zoom-image {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 6px;
        padding-left: 8px;
        padding-top: 7px;
    }
}

</style>
