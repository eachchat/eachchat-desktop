<template>
    <div class="ListHeadBar">
        <div class="Search">
            <eSearch :cleanSearchKey="cleanSearchKey" @toSearch="toSearch"/>
        </div>
        <div class="new-chat-content-div" id="new-chat-button-id" @click.stop="showCreateNewChatDropDown">
            <img class="new-chat-content-div-img img-disable-drag" src="../../../static/Img/Main/create-new-chat-button-nor-24px@2x.png" height="30px">
        </div>
        <div class="new-chat-dropdown-content" id="new-chat-dropdown-content-id" v-show="showCreateNewChat">
            <div class="normal-chat " @click.stop="mxDmDlgChange()">
                <img class="normal-chat-img img-disable-drag" src="../../../static/Img/Main/jdr.png">
                <span class="normal-chat-label">发起聊天</span>
            </div>
            <div class="normal-chat" @click.stop="openMxXxr()">
                <img class="normal-chat-img img-disable-drag" src="../../../static/Img/Main/jql.png">
                <span class="normal-chat-label">发起群聊</span>
            </div>
            <!-- <div class="normal-chat" @click.stop="mxDmDlgChangeErp()"> 
                <img class="normal-chat-img" src="../../../static/Img/Main/cjml.png">
                <span class="normal-chat-label">发起密聊</span>
            </div> -->
            <div class="secret-chat" @click.stop="mxSquare()">
                <img class="secret-chat-img img-disable-drag" src="../../../static/Img/Main/jgc.png">
                <span class="secret-chat-label">发现群聊</span> <!--发起密聊-->
            </div>
        </div>

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
            :mxInvite="mxInvite"
            @preStep="preStep"
        >
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
        >
        </mxXxr>
    </div>
</template>


<script>
import eSearch from './searchbar.vue'
import encryptChatCreater from './encryptChatCreater.vue'
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
            mxXxrOpen: false,
            mxInvite: []
        }
    },
    methods: {
        preStep() {
            this.mxCreateRoomOpen = false;
            this.mxXxrOpen = true;
        },
        openMxXxr() {
            this.mxXxrOpen = true;
        },
        closeMxXxr(data) {
            this.mxXxrOpen = false;
            this.showCreateNewChat = false;
            if (data && data.invite) {
                this.mxInvite = [...data.invite];
                console.log('check data', data);
                this.mxCreateRoomOpen = true;
            }
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
                if (close.data) this.$emit(close.handler, close.data);
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
        closeEncryptChatCreaterDlg(content) {
            this.showencryptChatCreaterDlg = false;
            this.chatCreaterDisableUsers = [];
        },
        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
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
        eSearch,
        encryptChatCreater,
        mxCreateRoomDlg,
        mxMemberSelectDlg,
        mxSquareDlg,
        mxDmDlg,
        mxXxr
    },
    created: async function () {
        document.addEventListener('click',this.closeInfoTip)
    }
}
</script>

<style lang="scss" scoped>
    .ListHeadBar {
        height: 32px;
        width: 100%;
        line-height: 32px;
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
        margin-left: 8px;
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
