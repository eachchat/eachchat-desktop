<template>
    <div class="window-header-bar" v-if="isOSX()">
            <img ondragstart="return false" class="close-image" @click="Close()" src="../../../static/Img/Main/Close@2x.png" v-show="showClose">
            <img ondragstart="return false" class="min-image" @click="Min()" src="../../../static/Img/Main/Minimise@2x.png" v-show="showMin">
            <img ondragstart="return false" class="zoom-image" @class="Max()" src="../../../static/Img/Main/Zoom@2x.png" v-show="showMax">
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
    data () {
        return {
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
            this.$emit("Max");
            // ipcRenderer.send("win-max");
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
