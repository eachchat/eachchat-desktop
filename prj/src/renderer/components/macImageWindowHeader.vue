<template>
    <div class="window-header-bar" v-if="isOSX()">
            <img ondragstart="return false" class="close-image" @click="Close()" src="../../../static/Img/ImgViewer/Close-hover@2x.png" v-show="showClose">
            <img ondragstart="return false" class="min-image" @click="Min()" src="../../../static/Img/Main/Minimise@2x.png" v-show="showMin">
            <img ondragstart="return false" class="zoom-min-image" @click="Max()" src="../../../static/Img/ImgViewer/zoom-min-hover@2x.png" v-show="showMax" v-if="isNormal">
            <img ondragstart="return false" class="zoom-max-image" @click="Max()" src="../../../static/Img/ImgViewer/zoom-max-hover@2x.png" v-show="showMax" v-else>
    </div>

</template>

<script>
import { ipcRenderer } from 'electron'
import { environment} from '../../packages/data/index.js'
export default {
    name: 'macImageWinHeadbar',
    data () {
        return {
            isNormal: true,
        }
    },
    props: {
        showClose: {
            type: Boolean,
            default: true
        },
        showMax: {
            type: Boolean,
            default: true
        },
        showMin: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        showClose: function() {
            console.log("this.showClose ", this.showClose);
        },
        showMax: function() {
            console.log("this.showMax ", this.showMax);
        },
        showMin: function() {
            console.log("this.showMin ", this.showMin);
        }
    },
    methods: {
        isOSX() {
            return environment.os.isOSX;
        },
        Min:function() {
            this.$emit("Min");
            // ipcRenderer.send("win-min");
        },
        Close: function() {
            this.$emit("Close");
            // ipcRenderer.send("win-close");
        },
        Max: function() {
            this.isNormal = !this.isNormal;
            this.$emit("Max");
            // ipcRenderer.send("win-max");
        }
    },
    components: {
    },
    created: function () {
        this.isNormal = true;
    }
}
</script>

<style lang="scss" scoped>
.window-header-bar {
    width: 64px;
    height: 0px;
    font-size: 0px;
    margin-left: -4px;
    .close-image {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 6px;
        padding-left: 0px;
        padding-top: 13px;

    }
    .min-image {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 6px;
        padding-left: 8px;
        padding-top: 13px;
    }
    .zoom-min-image {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 6px;
        padding-left: 8px;
        padding-top: 13px;
    }
    .zoom-max-image {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 6px;
        padding-left: 8px;
        padding-top: 13px;
    }
}
.window-header-bar:hover{
    .close-image{
        content: url('../../../static/Img/ImgViewer/Close-hover@2x.png');
        cursor: pointer;
    }
    .min-image{
        content: url('../../../static/Img/Main/Minimise-hover@2x.png');
        cursor: pointer;
    }
    .zoom-min-image{
        content: url('../../../static/Img/ImgViewer/zoom-min-hover@2x.png');
        cursor: pointer;
    }
    .zoom-max-image{
        content: url('../../../static/Img/ImgViewer/zoom-max-hover@2x.png');
        cursor: pointer;
    }
}
</style>
