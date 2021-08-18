<template>
    <div class="search">
        <img class="echat-search-ico" @click="search" src="../../../static/Img/Main/search@2x.png">
        <input class="echat-search-input" @contextmenu.prevent="openMenu" :placeholder="$t('search')" @keyup.enter="search" v-model="searchKey" @input="inputChange">
        <img class="echat-delete-ico" v-show = 'bShowDelIco' @click="clearSearch" src="../../../static/Img/SearchDlg/clear-20px.png">
    </div>
</template>

<script>
import {environment} from '../../packages/data/index.js'
import { openBaseMenu } from '../../utils/commonFuncs'
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
            this.bShowDelIco = false;
            this.$emit("toSearch", this.searchKey);
        }
    },
    data () {
        return {
            searchKey: '',
            bShowDelIco: false,
            toSearchInterval: null,
        }
    },
    methods: {
        inputChange: function() {
            if(this.toSearchInterval) {
                clearTimeout(this.toSearchInterval);
            }
            this.toSearchInterval = setTimeout(() => {
                console.log("this.searchKey is ", this.searchKey);
                this.$emit("toSearch", this.searchKey);
            }, 500)
            if(this.searchKey == "worklyai-open-dev-tools") {
                ipcRenderer.send("openDevTools");
            }
            if(this.searchKey.length == 0) this.bShowDelIco = false;
            else this.bShowDelIco = true;
        },
        search: function() {
            console.log("I am searching ", this.searchKey, " and cur os isWindows  ", environment.os.isWindows);
        },

        clearSearch(){
            this.searchKey = "";
            this.$emit("toSearch", this.searchKey);
            this.bShowDelIco = false;
        },
        openMenu:() => {
            openBaseMenu()
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
        height: 30px;
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

    .echat-search-ico {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 6px 6px 6px 6px;
        color: rgb(51, 51, 51);
    }
    
    .echat-delete-ico {
        display: inline-block;
        float: right;
        width: 20px;
        height: 20px;
        margin: 6px 6px 6px 6px;
        color: rgb(51, 51, 51);
    }

    .echat-search-input {
        display: inline-block;
        position: absolute;
        width: 133px;
        padding: 0;
        margin: 0px;
        height: 31px;
        outline:none;
        border: 0px;
        font-family:PingFangSC-Regular;
        font-weight:400;
        line-height:18px;
        letter-spacing: 0px;
        font-size: 12px;
        color: rgb(102, 102, 102);
        background-color: rgba(1, 1, 1, 0);
    }

    .echat-search-input::placeholder {
        height: 18px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: #999999;
        line-height: 18px;
    }
</style>
