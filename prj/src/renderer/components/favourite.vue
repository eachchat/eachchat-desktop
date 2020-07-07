<template>
    <el-container>
        <el-header>
            <div class="win-header">
                <winHeaderBar v-show="isWindows" @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
            </div>
        </el-header>
        <el-container>
            <el-aside width="280px">
                <div class="list-header">
                    <div class="search">
                        <input class="search-input" v-model="searchKey" @input="search" placeholder="搜索..." >
                    </div><div class="search-action">
                            
                            <div class="search-delete">
                                <img class="icon-delete" v-show="searchKey" @click="searchDeleteClicked()" src="../../../static/Img/Navigate/searchDelete-20px@2x.png">
                                
                            </div><div class="search-search">
                        
                                <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" >
                            </div>
                            </div>
                </div>
                <div class="list-content">
                    <div class="organization-view">
                        <div class="item" @click="messageMenuItemClicked()">
                            <img class="item-icon" src="../../../static/Img/Favorite/Navigate/message@2x.png">
                            <div class="item-info">
                                <p class="item-title">消息</p>
                            </div>
                            <div class="item-arrow">
                                <img class="right-arrow" src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                            </div>
                        </div>
                    </div>
                    <div class="organization-view">
                        <div class="item" @click="imageMenuItemClicked()">
                            <img class="item-icon" src="../../../static/Img/Favorite/Navigate/Image@2x.png">
                            <div class="item-info">
                                <p class="item-title">图片</p>
                            </div>
                            <div class="item-arrow">
                                <img class="right-arrow" src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                            </div>
                        </div>
                    </div>
                    <div class="organization-view">
                        <div class="item" @click="fileMenuItemClicked()">
                            <img class="item-icon" src="../../../static/Img/Favorite/Navigate/file@2x.png">
                            <div class="item-info">
                                <p class="item-title">文件</p>
                            </div>
                            <div class="item-arrow">
                                <img class="right-arrow" src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                            </div>
                        </div>
                    </div>
                    <div class="organization-view">
                        <div class="item" @click="groupMenuItemClicked()">
                            <img class="item-icon" src="../../../static/Img/Favorite/Navigate/group@2x.png">
                            <div class="item-info">
                                <p class="item-title">群组</p>
                            </div>
                            <div class="item-arrow">
                                <img class="right-arrow" src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                            </div>
                        </div>
                    </div>
                </div>
            </el-aside>
            <el-container class="right-container">
                
                    <favouriteList :favouriteType="favouriteType" :showSearchView="showSearchView" :searchKey="searchKey" :key="listKey"></favouriteList>
                
            </el-container>
        </el-container>
    </el-container>
</template>
<script>
import {services} from '../../packages/data/index.js';
import listHeader from './listheader';
import favouriteList from './favourite-list'
import winHeaderBar from './win-header.vue';
import {ipcRenderer} from 'electron'
export default {
    name: 'favourite',
    data() {
        return {
            favouriteType:'message',
            searchKey: '',
            listKey: 1,
            showSearchView: false,
            searchFavouriteInfo:{},
        }
    },

    methods: {
        Close: function() {
            ipcRenderer.send("win-close");
        },
        Min: function() {
            ipcRenderer.send("win-min");
        },
        Max: function() {
            ipcRenderer.send("win-max");
        },
        isWindows() {
            return environment.os.isWindows;
        },
        searchDeleteClicked(){
            this.searchKey = '';
            this.showSearchView = false;
            this.favouriteType = 'message';
            this.listKey ++;
        },
        search:async function () {
            
            if(this.searchKey == ''){
                this.showSearchView = false;
                this.favouriteType = 'message';
                this.listKey ++;
                return;
            }
            this.showSearchView = true;
            this.listKey ++;
        },
        searchDeleteClicked(){
            this.searchKey = '';
            this.showSearchView = false;
        },
        messageMenuItemClicked() {
            this.showSearchView = false;
            this.favouriteType = 'message';
            this.listKey ++;
        },
        imageMenuItemClicked() {
            this.showSearchView = false;
            this.favouriteType = 'image';
            this.listKey ++;
        },
        fileMenuItemClicked() {
            this.showSearchView = false;
            this.favouriteType = 'file';
            this.listKey ++;
        },
        groupMenuItemClicked() {
            this.showSearchView = false;
            this.favouriteType = 'group';
            this.listKey ++;
        }
    },
    components: {
        listHeader,
        favouriteList,
        winHeaderBar
    },
    created() {
        this.showSearchView = false;
        this.favouriteType = 'message';
        listKey ++;
    }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
.list-header {
    width: 100%;
    height: 56px;
    line-height: 56px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    margin: 0px 0px 0px 0px;
    display: block;
}

.el-header {
    height: 24px !important;
    padding: 0px;
    line-height: 24px;
}

.list-content {
    height: 100%;
}
.item-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    // border-top: 1px solid rgb(221, 221, 221);
    // border-bottom: 1px solid rgb(221, 221, 221);
}
.item {
    height: 60px;
    cursor: pointer;
    //border-bottom: 1px solid rgb(221, 221, 221);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
    background-color: white;
}
.item:hover{
    height: 60px;
    background:rgba(243,244,247,1);
}
.item:active {
    height: 60px;
    background:rgba(243,244,247,1);
}

.item-icon {
    width: 24px;
    height: 24px;
    display: inline-block;
    margin-left: 24px;
    margin-top: 18px;
    margin-right: 0px;
    margin-bottom: 12px;
    border-radius: 4px;
}
.item-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 88px);
}
.item-title {
    text-align: left;
    height: 40%;
    width: 70%;
    margin-top: 19px;
    margin-left: 12px;
    font-size: 14px;
    font-weight:400;
    color:rgba(0,0,0,1);
    line-height:20px;
    letter-spacing:1px;
}
.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 6.5px;
    margin-top: 23.5px;
    margin-right: 0px;
    margin-bottom: 0px;
    width: 7px;
    height: 13px;
}

.el-container {
    width: auto;
    height: 100%; 
    border:1px solid #eee;   
    background-color: white; 
    .el-aside {
        width: 150px;
        overflow: hidden;
        border-right: 1px solid rgb(221, 221, 221);
    }
    .right-container {
        width: 100%;
        height: 100%;  
        background-color: white; 
        border: hidden;
    }
}
    .search {
        margin: 12px 0px 0px 16px;
        text-align: left;
        width: calc(100% - 86px);
        height: 32px;
        border: 1px solid rgb(221, 221, 221);
        border-right: none;
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        display: inline-block;
    }
    .search-action{
        border: 1px solid rgb(221, 221, 221);
        border-left: none;
        margin: 12px 16px 12px 0px;
        text-align: left;
        width: 52px;
        height: 32px;
        display: inline-block;
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
    }
    .search-delete{
        display: inline-block;
        height: 20px;
        width: 20px;
        font-size: 0px;
        margin: 6px 0px 6px 0px;
    }
    .search-search{
        display: inline-block;
        height: 20px;
        width: 30px;
        font-size: 0px;
        margin: 6px 0px 6px 0px;
    }
    .icon-delete{
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin-right: 2px;
    }
    .icon-search {
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin-right: 8px;
        color: rgb(51, 51, 51);
    }
    
    .icon-search:hover {
        display: inline-block;
        color: rgb(255,204,102);
    }
    
    .search-input {
        display: inline-block;
        position: absolute;
        text-indent: 10px;
        width: 194px;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: 'Microsoft YaHei';
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
        letter-spacing:1px;
    }
</style>