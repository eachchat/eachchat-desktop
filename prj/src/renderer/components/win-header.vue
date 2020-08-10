<template>
    <div class="ChatHeaderBar" v-show="isWindows()">
        <img class="header-btn-close" src="../../../static/Img/Main/WinClose-20px@2x.png" @click="Close()" v-show="showClose">
        <img class="header-btn-max" src="../../../static/Img/Main/WinZoom-20px@2x.png" @click="Max()" v-show="showMax">
        <img class="header-btn-min" src="../../../static/Img/Main/WinMinimise-20px@2x.png" @click="Min()" v-show="showMin">
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { environment} from '../../packages/data/index.js'
export default {
    name: 'winHeadbar',
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
        isWindows() {
            return environment.os.isWindows || environment.os.isLinux;
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
    .ChatHeaderBar {
        height: 24px;
        width: 96px;
        position: absolute;
        right: 0px;
        top: 0px;
        // z-index: 50;
    }

    .header-btn-min {
        display: inline-block;
        float: right;
        width: 20px;
        height: 20px;
        line-height: 20px;
        margin: 0px 6px 0px 6px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .header-btn-min:hover {
        display: inline-block;
        float: right;
        width: 20px;
        height: 20px;
        line-height: 20px;
        margin: 0px 6px 0px 6px;
        color: red;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .header-btn-max {
        display: inline-block;
        float: right;
        width: 20px;
        height: 20px;
        line-height: 20px;
        margin: 0px 6px 0px 6px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .header-btn-max:hover {
        display: inline-block;
        float: right;
        width: 20px;
        height: 20px;
        line-height: 20px;
        margin: 0px 6px 0px 6px;
        color: red;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .header-btn-close {
        display: inline-block;
        float: right;
        width: 20px;
        height: 20px;
        line-height: 20px;
        margin: 0px 6px 0px 6px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .header-btn-close:hover {
        display: inline-block;
        float: right;
        width: 20px;
        height: 20px;
        line-height: 20px;
        color: red;
        margin: 0px 6px 0px 6px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

</style>
