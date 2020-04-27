<template>
    <div class="ListHeadBar">
        <div class="Search">
            <eSearch/>
        </div>
        <el-dropdown class="new-chat-dropdown" trigger="click">
            <i class="el-icon-circle-plus-outline"></i>
            <el-dropdown-menu class="new-chat-content" slot="dropdown">
                <el-dropdown-item class="create-new-group" icon="el-icon-connection" @click.native="showCreateGroup">
                创建群聊
                </el-dropdown-item>
                <!-- <el-dropdown-item class="create-new-secret" icon="el-icon-lock">
                进入密聊
                </el-dropdown-item> -->
            </el-dropdown-menu>
        </el-dropdown>
        <el-dialog title="发起聊天" :visible.sync="dialogVisible" width="70%" @close="handleDialogClose()">
            <div class="el-dialog-content">
                <chatGroupCreater :disable-users="disabledusers" ref="chatGroupCreater" @getCreateGroupUsersSelected="getUsersSelected">
                </chatGroupCreater>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button class="dialog-confirm-button" type="primary" @click="createGroup()">确 定</el-button>
            </span>
        </el-dialog>        
    </div>
</template>


<script>
import chatGroupCreater from './chatgroup-creater'
import {createGroup} from '../../packages/data/services'
import {APITransaction} from '../../packages/data/transaction.js'
import eSearch from './searchbar.vue'
export default {
    name: 'listHeadbar',
    data () {
        return {
            searchKey: '',
            dialogVisible: false,
            disabledusers: [this.$store.state.userInfo.id],
        }
    },
    methods: {
        showCreateGroup: function(){
            console.log("this disabledusers is ", this.disabledusers)
            this.dialogVisible = true;
        },
        createGroup: function() {
            var groupUserIds = [];
            console.log("this.usersSelected = ", this.usersSelected);
            for(var j=0;j<this.disabledusers.length;j++) {
                groupUserIds.push(this.disabledusers[j]);
            }
            var groupUserName = []
            for(var i=0;i<this.usersSelected.length;i++) {
                groupUserIds.push(this.usersSelected[i].id)
                if(i < 4) {
                    groupUserName.push(this.usersSelected[i].userName)
                }
            }
            var groupName = '';
            if(groupUserName.length > 1) {
                groupName = groupUserName.join("、");
            }
            else if(groupUserName.length == 4) {
                groupName = groupUserName.join("、");
                groupName = groupName + "...";
            }
            else {
                groupName = groupUserName[0];
            }
            console.log("group user ids is ", groupUserIds)
            // if(groupUserIds.length <= 2) {
            //     var groupItem = {};
            //     groupItem["group"] = ret.data.obj;
            //     groupItem["message"] = ret.data.message;
            //     groupItem["noReaderCount"] = 0;
            //     this.$emit('getCreateGroupInfo', groupItem);
            //     this.dialogVisible = false;
            // }
            // else {
                // this.serverapi.createGroup(this.$store.state.accesstoken, groupName, groupUserIds)
                servcies.createGroup(groupName, groupUserIds)
                    .then((ret) => {
                        if(ret.data.code == 200) {
                            console.log("the ret of create group is ", ret)
                            var groupItem = {};
                            groupItem["group"] = ret.data.obj;
                            groupItem["message"] = ret.data.message;
                            groupItem["noReaderCount"] = 0;
                            this.$emit('getCreateGroupInfo', groupItem);
                            this.dialogVisible = false;
                        }
                    })
            // }
        },
        handleDialogClose() {
            this.$refs.chatGroupCreater.initData();
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
        }
    },
    components: {
        chatGroupCreater,
        eSearch
    },
    created: function () {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
    }
}
</script>

<style lang="scss" scoped>
    .ListHeadBar {
        height: 41px;
        width: 280px;
        line-height: 41px;
        -webkit-app-region: drag;
    }
    * {
        -webkit-app-region: no-drag;
    } 

    .Search {
        width: calc(100% - 50px);
        height: 34px;
        line-height: 34px;
        font-size: 14px;
        display: inline-block;
        padding: 0px;
        margin: 0px 0px 0px 0px;
    }

    .new-chat-dropdown {
        display: inline-block;
        font-size: 20px;
        height: 34px;
        line-height: 34px;
        padding: 0px;
        margin: 0px 0px 0px 0px;
        overflow: hidden;
    }

    .el-icon-circle-plus-outline {
        background-color: white;
        line-height: 32px;
        color: rgb(211, 211, 211)
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
