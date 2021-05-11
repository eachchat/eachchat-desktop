<template>
    <el-container>
        <el-aside width="280px">
            <div class="list-header">
                <div class="searchDiv">
                    <eSearch @toSearch="search"/>
                </div>
            </div>
            <div class="list-content">
                <div class="organization-view">
                    <div :class='["item", {"active-tab": this.favouriteType == "message"}]'
                        @click="messageMenuItemClicked()">
                        <img ondragstart="return false" class="item-icon" src="../../../static/Img/Favorite/Navigate/message@2x.png">
                        <div class="item-info">
                            <p class="item-title">{{$t("favourite.message")}}</p>
                        </div>
                        <div class="item-arrow">
                            <img ondragstart="return false" class="right-arrow" src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </div>
                </div>
                <div class="organization-view">
                    <div :class='["item", {"active-tab": this.favouriteType == "image"}]'
                        @click="imageMenuItemClicked()">
                        <img ondragstart="return false" class="item-icon" src="../../../static/Img/Favorite/Navigate/Image@2x.png">
                        <div class="item-info">
                            <p class="item-title">{{$t("favourite.picture")}}</p>
                        </div>
                        <div class="item-arrow">
                            <img ondragstart="return false" class="right-arrow" src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </div>
                </div>
                <div class="organization-view">
                    <div 
                        :class='["item", {"active-tab": this.favouriteType == "file"}]'
                        @click="fileMenuItemClicked()">
                        <img ondragstart="return false" class="item-icon" src="../../../static/Img/Favorite/Navigate/file@2x.png">
                        <div class="item-info">
                            <p class="item-title">{{$t("favourite.file")}}</p>
                        </div>
                        <div class="item-arrow">
                            <img ondragstart="return false" class="right-arrow" src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </div>
                </div>
                <!-- <div class="organization-view">
                    <div class="item" @click="groupMenuItemClicked()">
                        <img ondragstart="return false" class="item-icon" src="../../../static/Img/Favorite/Navigate/group@2x.png">
                        <div class="item-info">
                            <p class="item-title">群组</p>
                        </div>
                        <div class="item-arrow">
                            <img ondragstart="return false" class="right-arrow" src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </div>
                </div> -->
            </div>
        </el-aside>
        <el-container class="right-container">
            
                <favouriteList :favouriteType="favouriteType" :showSearchView="showSearchView" :searchKey="searchKey" :key="listKey"></favouriteList>
            
        </el-container>
        <div class="win-header">
            <winHeaderBar @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
        </div>
    </el-container>
</template>
<script>
import listHeader from './listheader';
import favouriteList from './favourite-list'
import winHeaderBar from './win-header-login.vue';
import {ipcRenderer} from 'electron'
import eSearch from './searchbar.vue'
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

    watch:{
        searchKey: function(){
            if(this.searchKey.length == 0){
                this.showSearchView = false;
            }
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

        searchDeleteClicked(){
            
        },
        search:async function (searchKey) {
            this.searchKey = searchKey;
            if(searchKey == ''){
                this.showSearchView = false;
                this.favouriteType = 'message';
            }
            else{
                this.showSearchView = true;
            }
            this.listKey ++;
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
        winHeaderBar,
        eSearch
    },
    created() {
        this.showSearchView = false;
        this.favouriteType = 'message';
        this.listKey ++;
    }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
display: none;
}


.active-tab.active-tab.active-tab{
    background-color: #dddddd;
}

.list-header {
    width: 100%;
    height: 56px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    margin: 0px 0px 0px 0px;
    display: block;
    -webkit-app-region: drag;
}
* {
    -webkit-app-region: no-drag;
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
    width: 32px;
    height: 32px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 14px;
    margin-right: 0px;
    margin-bottom: 14px;
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
    font-family: PingFangSC-Regular;
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
        margin-top: -1px;
        margin-left: -1px;
        border-right: 1px solid rgb(221, 221, 221);
    }
    .right-container {
        width: 100%;
        height: 100%;  
        background-color: white; 
        border: hidden;
    }
}
    .searchDiv {
        text-align: left;
        width: calc(100% - 20px);
        height: 32px;
        border-right: none;
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        display: inline-block;
        margin-top: 12.5px;
        margin-bottom: 7.5px;
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
        width: 248px;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
    }
</style>