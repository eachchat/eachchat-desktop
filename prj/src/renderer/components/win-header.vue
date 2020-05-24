<template>
    <div class="ChatHeaderBar">
        <div class="header-list">
        </div>
        <div class="header-chat">
            <div class="Buttons">
                <i class="el-icon-close" @click="Close()">
                </i>
                <button class="header-btn-max" @click="Max()" v-show="false">
                    <i class="el-icon-max"></i>
                </button>
                <i class="el-icon-minus" @click="Min()">
                </i>
            </div>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
    name: 'winHeadbar',
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
        height: 20px;
        width: 100%;
    }

    .header-list {
        display: inline-block;
        margin:0;
        height: 20px;
        width: 280px;
        border-right: 1px solid rgb(242, 242, 246);
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
    }

    .header-chat {
        display: inline-block;
        margin:0;
        height: 20px;
        width: calc(100% - 288px);
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
    }


    .Buttons {
        display: block;
        margin:0;
        float: right;
        height: 100%;
        width: 130px;
    }

    .el-icon-minus {
        display: inline-block;
        float: right;
        width: 20px;
        height: 18px;
        line-height: 18px;
        margin: 1px 5px 1px 5px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .el-icon-minus:hover {
        display: inline-block;
        float: right;
        width: 20px;
        height: 18px;
        line-height: 18px;
        margin: 1px 5px 1px 5px;
        color: red;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .el-icon-close {
        display: inline-block;
        float: right;
        width: 20px;
        height: 18px;
        line-height: 18px;
        margin: 1px 5px 1px 5px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .el-icon-close:hover {
        display: inline-block;
        float: right;
        width: 20px;
        height: 18px;
        line-height: 18px;
        color: red;
        margin: 1px 5px 1px 5px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

</style>
