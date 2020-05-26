<template>
    <el-container>
        <el-aside width="280px">
            <div class="list-header">
                <listHeader></listHeader>
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
            
                <favouriteList :favouriteType="favouriteType" :key="listKey"></favouriteList>
            
        </el-container>
    </el-container>
</template>
<script>
import {services} from '../../packages/data/index.js';
import listHeader from './listheader';
import favouriteList from './favourite-list'
export default {
    name: 'favourite',
    data() {
        return {
            favouriteType:'message',
            listKey:1
        }
    },

    methods: {
        messageMenuItemClicked() {
            this.favouriteType = 'message';
            this.listKey ++;
        },
        imageMenuItemClicked() {
            this.favouriteType = 'image';
            this.listKey ++;
        },
        fileMenuItemClicked() {
            this.favouriteType = 'file';
            this.listKey ++;
        },
        groupMenuItemClicked() {
            this.favouriteType = 'group';
            this.listKey ++;
        }
    },
    components: {
        listHeader,
        favouriteList
    },
    created() {

    }
}
</script>

<style lang="scss">
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
.recentUsers-view {
    width: 100%;
    height: 70%;
    padding: 0;
    margin: 0;
}
.recentUsers-menu-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    overflow: scroll;
}
.user {
    height: 64px;
    cursor: pointer;
    //border-bottom: 1px solid rgb(221, 221, 221);
}
.user-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 36px;
    margin-top: 12px;
    margin-right: 0px;
    margin-bottom: 12px;
    border-radius: 4px;
}
.user-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 108px);
}
.user-name {
    height: 20px;
    width: 100%;
    margin-top: 12px;
    margin-bottom: 2px;;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
}
.user-title {
    height: 20px;
    width: 100%;
    margin-top: 0px;
    margin-bottom: 12px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
}

.item {
    height: 64px;
    cursor: pointer;
    border-bottom: 1px solid rgb(221, 221, 221);
    background-color: white;
}

.item:hover {
    height: 64px;
    //background-color:red;
}
.item-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 12px;
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
    margin-top: 21px;
    margin-left: 16px;
    font-size: 14px;
    line-height: 22px;
}
.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 6.5px;
    margin-top: 25.5px;
    margin-right: 0px;
    margin-bottom: 0px;
    width: 7px;
    height: 13px;
}
.organization {
    width:100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    margin: 0px;
}

.el-dialog {
    height: 250px;
    overflow: none;
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

</style>