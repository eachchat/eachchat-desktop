<template>
    <div class="window-header-bar" v-if="isOSX()">
            <img class="close-image" @click="Close()" src="../../../static/Img/Main/Close@2x.png">
            <img class="min-image" @click="Min()" src="../../../static/Img/Main/Minimise@2x.png">
            <img class="zoom-image" @class="Zoom()" src="../../../static/Img/Main/Zoom@2x.png">
    </div>

</template>

<script>
import { ipcRenderer } from 'electron'
import { environment} from '../../packages/data/index.js'
export default {
    name: 'macWinHeadbar',
    data () {
        return {
        }
    },
    methods: {
        isOSX() {
            return environment.os.isOSX;
        },
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
.window-header-bar:hover{
    .close-image{
        content: url('../../../static/Img/Main/Close-hover@2x.png');
    }
    .min-image{
        content: url('../../../static/Img/Main/Minimise-hover@2x.png');
    }
    .zoom-image{
        content: url('../../../static/Img/Main/zoom-hover@2x.png');
    }
}
</style>
