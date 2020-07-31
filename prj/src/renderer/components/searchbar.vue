<template>
    <div class="search">
        <input class="echat-search-input" placeholder="搜索..." @keyup.enter="search" v-model="searchKey" @input="inputChange">
        <i class="el-icon-search" @click="search"></i>
    </div>
</template>

<script>
import {services, environment} from '../../packages/data/index.js'
import { ipcRenderer } from 'electron';
export default {
    name: 'eSearch',
    props: {
        cleanSearchKey: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        cleanSearchKey: function() {
            this.searchKey = "";
        }
    },
    data () {
        return {
            searchKey: '',
        }
    },
    methods: {
        inputChange: function() {
            console.log("this.searchKey is ", this.searchKey);
            this.$emit("toSearch", this.searchKey);
            if(this.searchKey == "worklyai-open-dev-tools") {
                ipcRenderer.send("openDevTools");
            }
        },
        search: function() {
            console.log("I am searching ", this.searchKey, " and cur os isWindows  ", environment.os.isWindows);
        }
    },
    components: {
    },
    created: function () {
    }
}
</script>

<style lang="scss" scoped>
    .search {
        margin: 0px 0px 0px 16px;
        text-align: left;
        width: 200px;
        height: 32px;
        border: 1px solid rgb(221, 221, 221);
        border-radius: 3px;
    }

    .el-icon-search {
        display: inline-block;
        float: right;
        height: 32px;
        line-height: 32px;
        margin: 0 10px 0 10px;
        color: rgb(51, 51, 51);
    }
    
    .el-icon-search:hover {
        display: inline-block;
        float: right;
        height: 32px;
        line-height: 32px;
        margin: 0 10px 0 10px;
        color: rgb(255,204,102);
    }
    
    .echat-search-input {
        display: inline-block;
        position: absolute;
        text-indent: 10px;
        width: 173px;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: 'Microsoft YaHei';
        font-weight:400;
        line-height:18px;
        letter-spacing:1px;
        font-size: 12px;
        color: rgb(102, 102, 102);
        background-color: rgba(1, 1, 1, 0);
    }
</style>
