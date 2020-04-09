<template>
    <el-container>
        <el-aside width="280px">
            <div class="list-header">
                <listHeader></listHeader>
            </div>
            <div class="list-content">
                <ul class="item-list">
                    <li class="item" @click="organizationMenuItemClicked()">
                        <img class="item-icon" src="../../../static/Image/organization_list@2x.png">
                        <div class="item-info">
                            <p class="item-title">组织架构</p>
                        </div>
                        <div class="item-arrow">
                            <img class="right-arrow" src="../../../static/Image/right_arrow@2x.png">
                        </div>
                    </li>
                    <li class="item" @click="recentMenuItemClicked()">
                        <img class="item-icon" src="../../../static/Image/recentUsers_list@2x.png">
                        <div class="item-info">
                            <p class="item-title">常用联系人</p>
                        </div>
                        <div class="item-arrow">
                            <img class="right-arrow" src="../../../static/Image/right_arrow@2x.png">
                        </div>
                    </li>
                </ul>
            </div>
        </el-aside>
        <el-container class="right-container">
            
                <component :is="curView"></component>
            
        </el-container>
        <el-dialog title="创建群聊天" :visible.sync="dialogVisible" width="70%" :before-close="handleClose">
            <div class="el-dialog-content">
                <chatGroupCreater @getCreateGroupUsersSelected="getUsersSelected">
                </chatGroupCreater>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button class="dialog-confirm-button" type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>        
    </el-container>
</template>
<script>
import {services} from '../../packages/data/index.js';
import organizationList from './organization-list';
import chatGroupCreater from './chatgroup-creater';
import listHeader from './listheader';
export default {
    name: 'organization',
    data() {
        return {
            curindex: 0,
            curView: 'organizationList',
            Navigate:[
                {    
                    link: "/organization-list",
                    view: "organizaionList"
                }
            ],
            dialogVisible: false,
            usersSelected: [],
            recentUsers: []
        }
    },
    methods: {
        initSomeConfig: async function() {
            console.log("12312324234");
            console.log(services.common.GetAllGroups);
            console.log(services.common.GetRecentUsers);
        },
        organizationMenuItemClicked() {
            this.curindex = 0;
            this.curView = "organizationList";
        },
        myChannelMenuItemClicked() {
            
        },
        focusMenuItemClicked() {

        },
        recentMenuItemClicked() {
            this.dialogVisible = true;
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
        }
    },
    components: {
        organizationList,
        chatGroupCreater,
        listHeader
    },
    created() {
        this.initSomeConfig();
    }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar-track-piece {
    background-color: #F1F1F1;
    border-radius: 10px;
}

::-webkit-scrollbar {
    width: 8px;
    height: 12px;
}

::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: #C1C1C1;
    border-radius: 10px;
    outline: none;
}

::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #A8A8A8;
    border-radius: 10px;
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

.item {
    height: 64px;
    cursor: pointer;
    border-bottom: 1px solid rgb(221, 221, 221);
    
}

.item.active {
    height: 64px;
    background-color: rgb(245, 246, 247);
}
.item-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 0px;
    margin-bottom: 12px;
}
.item-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 92px);
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
.el-dialog-content {
    height: 300px;
    width: 600px;
    overflow: hidden;
}
.dialog-footer{
    text-align: center;
}

</style>