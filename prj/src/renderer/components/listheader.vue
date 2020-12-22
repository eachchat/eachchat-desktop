<template>
    <div class="ListHeadBar">
        <div class="Search">
            <eSearch :cleanSearchKey="cleanSearchKey" @toSearch="toSearch"/>
        </div>
        <div class="new-chat-content-div" id="new-chat-button-id" @click="showCreateNewChatDropDown">
            <img class="new-chat-content-div-img" src="../../../static/Img/Main/create-new-chat-button-nor-24px@2x.png" height="30px">
        </div>
        <div class="new-chat-dropdown-content" id="new-chat-dropdown-content-id" v-show="showCreateNewChat">
            <div class="normal-chat" @click.stop="mxDmDlgChange()"> <!--showCreateGroup-->
                <img class="normal-chat-img" src="../../../static/Img/Main/jdr.png">
                <span class="normal-chat-label">发起聊天</span>
            </div>
            <div class="normal-chat" @click.stop="mxCreateRoom()"> <!--showCreateGroup-->
                <img class="normal-chat-img" src="../../../static/Img/Main/jql.png">
                <span class="normal-chat-label">发起群聊</span>
            </div>
            <!-- <div class="normal-chat" @click.stop="mxDmDlgChangeErp()"> 
                <img class="normal-chat-img" src="../../../static/Img/Main/cjml.png">
                <span class="normal-chat-label">发起密聊</span>
            </div> -->
            <div class="secret-chat" @click.stop="mxSquare()"> <!--@click="showCreateEncryptGroup(true)"-->
                <img class="secret-chat-img" src="../../../static/Img/Main/jgc.png">
                <span class="secret-chat-label">公共群聊</span> <!--发起密聊-->
            </div>
        </div>
        <!-- <el-dialog title="发起群聊" :visible.sync="dialogVisible" width="70%" @close="handleDialogClose()">
            <div class="el-dialog-content">
                <chatGroupCreater :disableUsers="disabledusers" ref="chatGroupCreater" @getCreateGroupUsersSelected="getUsersSelected">
                </chatGroupCreater>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button class="dialog-confirm-button" type="primary" @click="createGroup()">确 定</el-button>
            </span>
        </el-dialog> -->
        <chatCreaterDlg v-show="showChatCreaterDlg" @getCreateGroupInfo="getCreateGroupInfo" @closeChatCreaterDlg="closeChatCreaterDlg" :isSecret="isSecret" :rootDepartments="chatCreaterDialogRootDepartments" :disableUsers="chatCreaterDisableUsers" :dialogTitle="chatCreaterDialogTitle" :key="chatCreaterKey">
        </chatCreaterDlg>
        <encryptChatCreater v-show="showencryptChatCreaterDlg" @getCreateGroupInfo="getEncryptCreateGroupInfo" @closeChatCreaterDlg="closeEncryptChatCreaterDlg" :isSecret="isSecret" :rootDepartments="chatCreaterDialogRootDepartments" :disableUsers="chatCreaterDisableUsers" :dialogTitle="chatCreaterDialogTitle" :key="chatEncryptCreaterKey">
        </encryptChatCreater>
        <mxMemberSelectDlg 
            v-if="mxSelectMemberOpen" 
            @close="mxSelectMember"
            :roomId="newRoomId"
        >
        </mxMemberSelectDlg>
        <mxCreateRoomDlg 
            v-if="mxCreateRoomOpen" 
            @close="mxCreateRoom" 
            @nextStep="mxCreateRoomNextStep">
        </mxCreateRoomDlg>
        <mxSquareDlg 
            v-if="mxSquareOpen"
            @close="mxSquare" 
        >
        </mxSquareDlg>
        <mxDmDlg
            v-if="mxDmDlgOpen"
            :erpDm="erpDm"
            @close="mxDmDlgChange"
        >
        </mxDmDlg>
        <mxXxr 
            v-if="mxXxrOpen" 
            @close="closeMxXxr"
            :roomInfo="roomInfo"
        >
        </mxXxr>
    </div>
</template>


<script>
import {createGroup} from '../../packages/data/services'
import {APITransaction} from '../../packages/data/transaction.js'
import {services} from '../../packages/data/index.js'
import eSearch from './searchbar.vue'
import {strMsgContentToJson} from '../../packages/core/Utils.js'
import chatCreaterDlg from './chatCreaterDlg.vue'
import encryptChatCreater from './encryptChatCreater.vue'
import { Group, Message, Department, UserInfo } from '../../packages/data/sqliteutil.js'
import mxCreateRoomDlg from './mxCreateRoomDlg.vue'
import mxMemberSelectDlg from './mxMemberSelectDlg.vue'
import mxSquareDlg from './mxSquareDlg.vue'
import mxDmDlg from './mxDmDlg.vue'
import mxXxr from './mxXxr.vue'



export default {
    name: 'listHeadbar',
    props: {
        cleanSearchKey: {
            type: Boolean,
            default: false
        },
    },
    data () {
        return {
            chatCreaterDisableUsers: [],
            chatCreaterDialogRootDepartments:[],
            chatCreaterKey:1,
            chatEncryptCreaterKey: 9,
            chatCreaterDialogTitle: '',
            showChatCreaterDlg: false,
            showencryptChatCreaterDlg: false,
            searchKey: '',
            dialogVisible: false,
            disabledusers: [],
            showCreateNewChat: false,
            isSecret: false,
            mxCreateRoomOpen: false,
            mxSelectMemberOpen: false,
            newRoomId: '',
            mxSquareOpen: false,
            mxDmDlgOpen: false,
            erpDm: false,
            roomInfo: undefined,
            mxXxrOpen: false
        }
    },
    methods: {
        closeMxXxr() {
            this.mxXxrOpen = false;
            this.showCreateNewChat = false;
            console.log('-----closeMxXxr----', this.mxXxrOpen)
        },
        mxDmDlgChangeErp: function(close) {
            console.log('mxDmDlgErp???', close)
            if (close) {
                if (close.data) this.$emit(close.handler, close.data);
                this.showCreateNewChat = false;
                return this.mxDmDlgOpen = false;
            }
            this.erpDm = true;
            this.mxDmDlgOpen = true;
        },
        mxDmDlgChange: function(close) {
            console.log('mxDmDlg???', close)
            if (close) {
                if (close.data) this.$emit(close.handler, close.data);
                this.showCreateNewChat = false;
                return this.mxDmDlgOpen = false;
            }
            this.erpDm = false;
            this.mxDmDlgOpen = true;
        },
        mxSquare: function(close) {
            console.log('???', close)
            if (close) {
                // if (close.data) this.$emit(close.handler, close.data);
                this.showCreateNewChat = false;
                return this.mxSquareOpen = false;
            }
            this.mxSquareOpen = true;
        },
        mxSelectMember: function(close) {
            // if (close.data) this.$emit(close.handler, close.data);
            this.showCreateNewChat = false;
            this.mxSelectMemberOpen = false;
        },
        mxCreateRoomNextStep: function(res) {
            console.log('--mxCreateRoomNextStep--', res);
            // this.newRoomId = res.room_id;
            this.mxCreateRoomOpen = false;
            // this.mxSelectMemberOpen = true;
            this.roomInfo = res;
            this.mxXxrOpen = true;
        },
        mxCreateRoom: function(close) {
            console.log('???', close)
            if (close) {
                this.showCreateNewChat = false;
                return this.mxCreateRoomOpen = false;
            }
            this.mxCreateRoomOpen = true;
        },
        showCreateNewChatDropDown: function() {
            this.showCreateNewChat = true;
            var createNewChatBtnElement = document.getElementById("new-chat-button-id");
            var crateNewChatMenuElement = document.getElementById("new-chat-dropdown-content-id");
            var top = createNewChatBtnElement.offsetTop + createNewChatBtnElement.offsetHeight + 11;
            var left = createNewChatBtnElement.offsetLeft - 54;
            // crateNewChatMenuElement.style.display = "block";
            crateNewChatMenuElement.style.top = top + "px";
            crateNewChatMenuElement.style.left = left + "px";
        },
        toSearch (searchKey) {
            this.$emit("toSearch", searchKey);
        },
        getCreateGroupInfo(groupinfo) {
            this.$emit("getCreateGroupInfo", groupinfo);
        },
        getEncryptCreateGroupInfo(groupinfo) {
            this.$emit("getCreateGroupInfo", groupinfo);
        },
        closeChatCreaterDlg(content) {
            this.showChatCreaterDlg = false;
            this.chatCreaterDisableUsers = [];
        },
        closeEncryptChatCreaterDlg(content) {
            this.showencryptChatCreaterDlg = false;
            this.chatCreaterDisableUsers = [];
        },
        showCreateEncryptGroup: async function(isSecret=false) {
            // this.disabledusers = [this.curUserInfo.id];
            // this.dialogVisible = true;
            // console.log("this disabledusers is ", this.disabledusers)
            /////////////////////////////////////////////////////////
            this.isSecret = isSecret;
            var self = await services.common.GetSelfUserModel();
            var selfUserInfo = await UserInfo.GetUserInfo(self.id);
            if(selfUserInfo == undefined) {
                selfUserInfo = {
                    "user_id": self.id,
                }
            }
            console.log("self is ", self);
            this.chatCreaterDisableUsers.push(selfUserInfo.user_id);
            console.log("chatCreaterDisableUsers is ", this.chatCreaterDisableUsers);
            var root = await Department.GetRoot();
            console.log("root is ", root);
            var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
            console.log("rootDepartmentModels is ", rootDepartmentModels);
            var temp = rootDepartmentModels;
            this.chatCreaterDialogRootDepartments =  temp.sort(this.compare("show_order"));
            
            this.chatEncryptCreaterKey ++;
            this.showencryptChatCreaterDlg = true;
            this.chatCreaterDialogTitle = "选择密聊";
        },
        showCreateGroup: async function(isSecret=false){
            // this.disabledusers = [this.curUserInfo.id];
            // this.dialogVisible = true;
            // console.log("this disabledusers is ", this.disabledusers)
            /////////////////////////////////////////////////////////
            this.isSecret = isSecret;
            var self = await services.common.GetSelfUserModel();
            var selfUserInfo = await UserInfo.GetUserInfo(self.id);
            if(selfUserInfo == undefined) {
                selfUserInfo = {
                    "user_id": self.id,
                }
            }
            console.log("self is ", self);
            this.chatCreaterDisableUsers.push(selfUserInfo.user_id);
            console.log("chatCreaterDisableUsers is ", this.chatCreaterDisableUsers);
            var root = await Department.GetRoot();
            console.log("root is ", root);
            var rootDepartmentModels = await Department.GetSubDepartment(root.department_id);
            console.log("rootDepartmentModels is ", rootDepartmentModels);
            var temp = rootDepartmentModels;
            this.chatCreaterDialogRootDepartments =  temp.sort(this.compare("show_order"));
            
            this.chatCreaterKey ++;
            this.showChatCreaterDlg = true;
            this.chatCreaterDialogTitle = "添加成员";
        },
        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
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
                groupName = groupUserName.join(",");
            }
            else if(groupUserName.length == 4) {
                groupName = groupUserName.join(",");
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
                var groupCheck = await Group.SearchChatByNameKey(chatName);
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
        },
        closeInfoTip(e){
            // console.log("e.target.classname ", e.target.className)

            var createNewElement = document.getElementById("new-chat-dropdown-content-id");
            if(createNewElement != null && !createNewElement.contains(e.target) && e.target.className != "new-chat-content-div-img" && e.target.className != "new-chat-content-div"){
                // console.log("=========== close create new chat ");
                this.showCreateNewChat = false;
            }
        },
    },
    components: {
        chatCreaterDlg,
        eSearch,
        encryptChatCreater,
        mxCreateRoomDlg,
        mxMemberSelectDlg,
        mxSquareDlg,
        mxDmDlg,
        mxXxr
    },
    created: async function () {
        // this.loginInfo = await services.common.GetLoginModel();
        // this.curUserInfo = await services.common.GetSelfUserModel();
        document.addEventListener('click',this.closeInfoTip)
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

    .new-chat-content-div {
        width:30px;
        height:30px;
        background:rgba(255,255,255,1);
        border-radius:16px;
        border:0px solid rgba(221,221,221,1);
        display: inline-block;
    }

    .new-chat-dropdown-content {
        display: block;
        position: absolute;
        background-color: rgba(255, 255, 255, 1);
        width: 128px;
        height: 120px;
        box-shadow:0px 0px 12px 0px rgba(103,103,103,0.14);;
        border:1px solid rgba(221,221,221,1);
        border-radius: 4px;
        z-index: 2;
    }

    .new-chat-dropdown-content div:hover {
        background-color: rgba(243, 244, 247, 1);
        cursor: pointer;
    }

    .normal-chat {
        display: block;
        width: 128px;
        height: 40px;
    }

    .normal-chat-img {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 10px 8px 10px 16px;
        background-color: rgba(0, 0, 0, 0);
    }
    
    .normal-chat-label {
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: PingFangSC-Regular;
        vertical-align: top;
        background-color: rgba(0, 0, 0, 0);
    }

    .secret-chat {
        display: block;
        width: 128px;
        height: 40px;
    }

    .secret-chat-img {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 10px 8px 10px 16px;
        background-color: rgba(0, 0, 0, 0);
    }
    
    .secret-chat-label {
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(51, 51, 51, 1);
        font-family: PingFangSC-Regular;
        vertical-align: top;
        background-color: rgba(0, 0, 0, 0);
    }

    //////////////////////////////////////

    .new-chat-content-div-img {
        background-color: white;
        line-height: 32px;
        margin-top: 0px;
        margin-bottom: 2.5px;
        margin-right: 0px;
        margin-left: 0px;
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
