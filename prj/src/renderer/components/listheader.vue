<template>
    <div class="ListHeadBar">
        <div class="Search">
            <eSearch :cleanSearchKey="cleanSearchKey" @toSearch="toSearch"/>
        </div>
        <el-dropdown class="new-chat-dropdown" trigger="click">
            <div class="new-chat-content-div">
                <img class="el-icon-circle-plus-outline" src="../../../static/Img/Main/create-chat-nor-20px@2x.png" height="20px">
                <el-dropdown-menu class="new-chat-content" slot="dropdown">
                    <el-dropdown-item class="create-new-group" icon="el-icon-connection" @click.native="showCreateGroup">
                    发起群聊
                    </el-dropdown-item>
                    <!-- <el-dropdown-item class="create-new-secret" icon="el-icon-lock">
                    进入密聊
                    </el-dropdown-item> -->
                </el-dropdown-menu>
            </div>
        </el-dropdown>
        <!-- <el-dialog title="发起群聊" :visible.sync="dialogVisible" width="70%" @close="handleDialogClose()">
            <div class="el-dialog-content">
                <chatGroupCreater :disableUsers="disabledusers" ref="chatGroupCreater" @getCreateGroupUsersSelected="getUsersSelected">
                </chatGroupCreater>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button class="dialog-confirm-button" type="primary" @click="createGroup()">确 定</el-button>
            </span>
        </el-dialog> -->
        <chatCreaterDlg v-show="showChatCreaterDlg" @getCreateGroupInfo="getCreateGroupInfo" @closeChatCreaterDlg="closeChatCreaterDlg" :rootDepartments="chatCreaterDialogRootDepartments" :disableUsers="chatCreaterDisableUsers" :dialogTitle="chatCreaterDialogTitle" :key="chatCreaterKey">
        </chatCreaterDlg>
    </div>
</template>


<script>
import {createGroup} from '../../packages/data/services'
import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import eSearch from './searchbar.vue'
import {strMsgContentToJson} from '../../packages/core/Utils.js'
import chatCreaterDlg from './chatCreaterDlg.vue'
import { Group, Message, Department, UserInfo } from '../../packages/data/sqliteutil.js'
export default {
    name: 'listHeadbar',
    props: {
        cleanSearchKey: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            chatCreaterDisableUsers: [],
            chatCreaterDialogRootDepartments:[],
            chatCreaterKey:1,
            chatCreaterDialogTitle: '',
            showChatCreaterDlg: false,
            searchKey: '',
            dialogVisible: false,
            disabledusers: [],
        }
    },
    methods: {
        toSearch (searchKey) {
            this.$emit("toSearch", searchKey);
        },
        getCreateGroupInfo(groupinfo) {
            this.$emit("getCreateGroupInfo", groupinfo);
        },
        closeChatCreaterDlg(content) {
            this.showChatCreaterDlg = false;
            this.chatCreaterDisableUsers = [];
        },
        showCreateGroup: async function(){
            // this.disabledusers = [this.curUserInfo.id];
            // this.dialogVisible = true;
            // console.log("this disabledusers is ", this.disabledusers)
            /////////////////////////////////////////////////////////
            var self = await services.common.GetSelfUserModel();
            var selfUserInfo = await UserInfo.GetUserInfo(self.id);
            if(selfUserInfo == undefined) {
                selfUserInfo = {
                    "user_id": self.id,
                }
            }
            console.log("self is ", self);
            this.chatCreaterDisableUsers.push(selfUserInfo);
            console.log("chatCreaterDisableUsers is ", this.chatCreaterDisableUsers);
            var root = await Department.GetRoot();
            console.log("root is ", root);
            var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
            console.log("rootDepartmentModels is ", rootDepartmentModels);
            var temp = [];
            for(var i = 0; i < rootDepartmentModels.length; i ++) {
                var department = rootDepartmentModels[i];
                temp[department.show_order] = department;
            }
            console.log("tempt is ", temp);
            this.chatCreaterDialogRootDepartments =  temp;
            
            this.chatCreaterKey ++;
            this.showChatCreaterDlg = true;
            this.chatCreaterDialogTitle = "添加成员";
        },
        createGroup: async function() {
            var groupUserIds = [];
            console.log("this.usersSelected = ", this.usersSelected);
            console.log("this disabledusers is ", this.disabledusers)
            for(var j=0;j<this.disabledusers.length;j++) {
                groupUserIds.push(this.disabledusers[j]);
            }
            var groupUserName = []
            for(var i=0;i<this.usersSelected.length;i++) {
                groupUserIds.push(this.usersSelected[i].id)
                if(i < 4) {
                    groupUserName.push(this.usersSelected[i].displayName)
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
            console.log("group groupName ids is ", groupName)
            var contain_user_ids = groupUserIds.join(",");
            if(this.usersSelected.length == 0) {
                alert("选一个呗")
            }
            else if(this.usersSelected.length == 1) {
                var groupItem = {};
                var selectedId = this.usersSelected[0];
                var userInfos = await services.common.GetDistUserinfo(selectedId.id);
                console.log("userInfos is ", userInfos);
                var chatUserInfo = userInfos[0];
                var chatAvater = chatUserInfo.avatar_t_url;
                var chatName = chatUserInfo.user_display_name;
                var groupCheck = await services.common.GetGroupByName(chatName);
                console.log("groupCheck is ", groupCheck)
                if(groupCheck.length == 0) {
                    groupItem["contain_user_ids"] = contain_user_ids;
                    groupItem["group_avarar"] = chatAvater;
                    groupItem["group_name"] = chatName;
                    groupItem["group_type"] = 102;
                    groupItem["last_message_time"] = 0;
                    groupItem["message_content"] = null;
                    groupItem["message_content_type"] = 101;
                    groupItem["message_from_id"] = this.curUserInfo.id;
                    groupItem["message_id"] = '';
                    groupItem["owner"] = null;
                    groupItem["sequence_id"] = 0;
                    groupItem["status"] = "00000000";
                    groupItem["un_read_count"] = 0;
                    groupItem["updatetime"] = new Date().getTime();
                    groupItem["user_id"] = selectedId.id;
                }
                else {
                    groupItem = groupCheck[0];
                }

                this.$emit('getCreateGroupInfo', groupItem);
                this.dialogVisible = false;
            }
            else {
                services.common.CreateGroup(groupName, groupUserIds)
                    .then((ret) => {
                        if(ret == undefined) {
                            console.log("!!!!!!!!!!!1 ")
                            // ToDo exception notice.
                            return;
                        }
                        ret.message_content = null;
                        
                        var groupItem = {};
                        groupItem["contain_user_ids"] = ret.contain_user_ids;
                        groupItem["group_id"] = ret.group_id;
                        groupItem["group_avarar"] = ret.group_avarar;
                        groupItem["group_name"] = ret.group_name;
                        groupItem["group_type"] = ret.group_type;
                        groupItem["last_message_time"] = ret.last_message_time;
                        groupItem["message_content"] = null;
                        groupItem["message_content_type"] = ret.message_content_type;
                        groupItem["message_from_id"] = ret.message_from_id;
                        groupItem["message_id"] = ret.message_id;
                        groupItem["owner"] = ret.owner;
                        groupItem["sequence_id"] = ret.sequence_id;
                        groupItem["status"] = ret.status;
                        groupItem["un_read_count"] = ret.un_read_count;
                        groupItem["updatetime"] = ret.updatetime;
                        groupItem["user_id"] = '';
                
                        console.log("services.CreateGroup ret is ", groupItem);
                        this.$emit('getCreateGroupInfo', groupItem);
                        this.dialogVisible = false;
                    })

            }
        },
        handleDialogClose() {
            this.$refs.chatGroupCreater.initData();
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
        }
    },
    components: {
        chatCreaterDlg,
        eSearch
    },
    created: async function () {
        await services.common.init();
        this.loginInfo = await services.common.GetLoginModel();
        this.curUserInfo = await services.common.GetSelfUserModel();
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
        width: calc(100% - 55px);
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
        height: 32px;
        line-height: 32px;
        padding: 0px;
        margin: 0px 0px 2px 0px;
        overflow: hidden;
    }

    .new-chat-content-div {
        width:30px;
        height:30px;
        background:rgba(255,255,255,1);
        border-radius:16px;
        border:1px solid rgba(221,221,221,1);
    }

    .el-icon-circle-plus-outline {
        background-color: white;
        line-height: 32px;
        margin-top: 6px;
        margin-bottom: 6px;
        margin-right: 6px;
        margin-left: 5.5px;
        color: rgb(211, 211, 211)
    }

    .el-dialog {
        height: 400px;
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
