<template>
    <div class="groupInfo" id="groupInfoTipId">
        <div class="groupInfoTitleDiv">
            <p class="groupInfoTitle">设置</p>
        </div>
        <div class="groupInfo-view">
            <div class="groupInfoImageDiv">
                <img id="groupInfoImageId" class="groupInfoImage" src="../../../static/Img/User/user.jpeg">
                <img id="groupInfoImageChangeId" class="groupInfoImageChange" src="../../../static/Img/Chat/updateHeadImg-24px@2x.png" @click="updateGroupImg" v-show="isOwner">
            </div>
            <div class="groupInfoNoticeAndName">
                <div class="groupInfoName">
                    <input class="groupInfoNameInput" id="groupInfoNameInputId" type="text" v-model="newGroupName" :placeholder="this.groupName" @keyup="keyUpdateGroupName($event)" @mouseenter="showNameEdit" @mouseout="hideNameEdit"/>
                    <p class="groupInfoNameEdit" id="groupInfoNameEditId" v-show="isOwner"></p>
                </div>
                <div class="groupInfoNotice" @click="updateGroupNotice">
                    <input class="groupInfoNoticeInput" id="groupInfoNoticeInputId" type="text" v-model="newGroupNotice" name="groupInfoNotice" :placeholder="this.groupNotice" @mouseenter="showNoticeEdit" @mouseout="hideNoticeEdit"/>
                    <p class="groupInfoNoticeEdit" id="groupInfoNoticeEditId" v-show="isOwner"></p>
                </div>
            </div>
        </div>
        <div class="groupSettingSilenceDiv">
            <label class="groupSettingSlienceLabel">消息免打扰</label>
            <el-switch class="groupSettingSlienceSwitch" v-model="slienceState" @change="slienceStateChange(slienceState)">
            </el-switch>
        </div>
        <div class="groupSettingTopDiv">
            <label class="groupSettingTopLabel">置顶聊天</label>
            <el-switch class="groupSettingTopSwitch" v-model="groupTopState" @change="groupTopStateChange(groupTopState)">
            </el-switch>
        </div>
        <div class="groupSettingFavouriteDiv" v-show="isGroup">
            <label class="groupSettingFavouriteLabel">保存到收藏</label>
            <el-switch class="groupSettingFavouriteSwitch" v-model="groupFavouriteState" @change="groupFavouriteStateChange(groupFavouriteState)">
            </el-switch>
        </div>
        <div class="groupSettingOwnerTransferDiv" v-show="isGroup">
            <label class="groupSettingOwnerTransferLabel">群组转让</label>
            <img id="groupSettingOwnerTransferImageId" class="groupSettingOwnerTransferImage" src="../../../static/Img/Chat/arrow-20px@2x.png">
        </div>
        <div class="groupMemberAddDiv" v-show="isGroup">
            <label class="groupMemberAddDivLabel">群成员</label>
            <img id="groupMemberAddDivImageId" class="groupMemberAddDivImage" src="../../../static/Img/Chat/add-20px@2x.png">
        </div>
        <div class="groupMember-view">
            <ul class="groupMember-list">
                <li v-for="(item, index) in memberListShow" class="memberItem">
                    <div class="groupMemberInfoDiv">
                        <img :id="getIdThroughMemberUid(item.user_id)" class="groupMemberInfoImage" @click="showUserInfoTip">
                        <label class="groupMemberInfoLabel">{{item.user_display_name}}</label>
                    </div>
                    <img class="groupMemberClickOut" src="../../../static/Img/Chat/delete-20px@2x.png">
                </li>
            </ul>
        </div>
        <div class="groupLeave-view" v-show="isGroup">
            <p class="groupLeaveDiv" @click="leave()">
                退出群聊
            </p>
        </div>
        <div class="groupDismiss-view" v-show="isGroup">
            <p class="groupDismissDiv" @click="dismiss()">
                解散群聊
            </p>
        </div>
    </div>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {services} from '../../packages/data/index.js'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {ipcRenderer, remote} from 'electron'
import {getElementTop, getElementLeft, pathDeal} from '../../packages/core/Utils.js'
export default {
    name: 'group-info',
    data() {
        return {
            newGroupName: '',
            newGroupNotice: '',
            memberListShow: [],
            absoluteTop: 0,
            absoluteLeft: 0,
            groupName: '',
            groupAvarar: '',
            groupNotice: '',
            slienceState: true,
            groupTopState: true,
            groupFavouriteState: true,
            groupId: '',
            isGroup: true,
            isOwner: false,
            nameEditElement: null,
            noticeEditElement: null,
        }
    },
    components: {
    },
    props: {
        "showGroupInfo": { 
            type:Object,
            default:{}
        },
        "cleanCache": {
            type: Boolean,
            default: false
        },
        'updateUser': {
            type: Array,
            default: []
        },
        "updateNotice": {
            type: String,
            default: ""
        }
    },
    computed: {
    },
    methods: {
        showNameEdit: function(e) {
            console.log("show name edit ", e)
            if(this.nameEditElement == null) {
                this.nameEditElement = document.getElementById("groupInfoNameEditId");
            }
            this.nameEditElement.style = "width: 21px;height: 21px;float: right;margin: 0px;padding: 0px;background-size: auto 100%;background-image: url('../../../static/Img/Chat/edit-20px@2x.png');background-repeat: no-repeat;"
        },
        hideNameEdit: function(e) {
            console.log("show name edit ", e)
            if(this.nameEditElement == null) {
                this.nameEditElement = document.getElementById("groupInfoNameEditId");
            }
            this.nameEditElement.style = "width: 21px;height: 21px;float: right;margin: 0px;padding: 0px;";
        },
        showNoticeEdit: function(e) {
            console.log("show name edit ", e)
            if(this.noticeEditElement == null) {
                this.noticeEditElement = document.getElementById("groupInfoNoticeEditId");
            }
            this.noticeEditElement.style = "width: 20px;height: 20px;float: right;margin: 0px;padding: 0px;background-size: auto 100%;background-image: url('../../../static/Img/Chat/arrow-20px@2x.png');background-repeat: no-repeat;"
        },
        hideNoticeEdit: function(e) {
            console.log("show name edit ", e)
            if(this.noticeEditElement == null) {
                this.noticeEditElement = document.getElementById("groupInfoNoticeEditId");
            }
            this.noticeEditElement.style = "width: 21px;height: 21px;float: right;margin: 0px;padding: 0px;";
        },
        updateGroupImg: function(e, args) {
            if(args != undefined && args.length != 0) {
                var state = args[0];
                var stateInfo = args[1];
                var id = args[2];
                var localPath = args[3];
                if(id != this.groupId) {
                    return;
                }
                let elementImg = document.getElementById("groupInfoImageId");
                elementImg.setAttribute("src", "");
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                var reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
            }
            else {
                remote.dialog.showOpenDialog({
                        defaultPath: 'c:/',
                        filters: [
                                { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
                            ],
                        properties: ['multiSelections']
                    }, async (files) => {
                    if(files && files.length > 0) {
                        var targetDir = confservice.getUserThumbHeadPath();
                        var targetPath = path.join(targetDir, this.groupId + '.png');
                        if(fs.existsSync(targetPath)) {
                            fs.unlinkSync(targetPath);
                        }
                        var distFilePath = pathDeal(files[0]);
                        
                        var ret = await services.common.UpdateGroupAvatar(this.groupId, distFilePath, this.groupAvarar);
                        console.log("ret is ", ret);
                        // if(ret.ok == true && ret.success == true) {
                        //     ipcRenderer.send('modifyGroupInfo', [this.groupId, distFilePath]);
                        // }
                        
                    }
                })
            }
        },
        showUserInfoTip: async function(e) {
            console.log("e ", e);
            var elementId = e.target.id;
            var uid = this.getUidThroughElementId(elementId);

            var curAbsoluteTop = e.target.offsetTop;
            var curAbsoluteLeft = e.target.offsetLeft;
            var isMine = uid == this.curUserInfo.id;

            var curUserInfo = services.common.GetDistUserinfo(uid);
            var tipInfos = {
                "userInfo": curUserInfo[0],
                "absoluteTop": curAbsoluteTop,
                "absoluteLeft": curAbsoluteLeft,
                "isMine": isMine,
            }
            console.log("emit absoluteTop ", curAbsoluteTop);
            console.log("emit absoluteLeft ", curAbsoluteLeft);
            console.log("emit openUserInfoTip ", tipInfos);
            this.$emit("openUserInfoTip", tipInfos);
        },
        showAddMembers: function() {
            this.$emit("showAddMembers", this.memberList);
        },
        keyUpdateGroupName: function(event) {
            if(event.code == "Enter") {
                if(this.newGroupName == this.groupName){
                    return;
                }
                var updateGroupNameInputElement = document.getElementById("groupInfoNameInputId")
                updateGroupNameInputElement.blur();
                services.common.UpdateGroupName(this.groupId, this.newGroupName);
                this.groupName = this.newGroupName;
            }
        },
        updateGroupName: function() {
            if(this.newGroupName == this.groupName){
                return;
            }
            var updateGroupNameInputElement = document.getElementById("groupInfoNameInputId")
            updateGroupNameInputElement.blur();
            services.common.UpdateGroupName(this.groupId, this.newGroupName);
            this.groupName = this.newGroupName;
        },
        updateGroupNotice: function(event) {
            this.$emit("updateChatGroupNotice", this.groupId, this.groupNotice);
        },
        Close: function() {
            this.$emit("closeGroupInfo");
        },
        leave: function() {
            console.log("leave all");
        },
        dismiss: function() {
            console.log("leave all");
        },
        clearAll: function() {
            console.log("clear all");
        },
        slienceStateChange: async function(state){
            services.common.GroupStatus(this.groupId, this.groupTopState, this.slienceState)
                .then((ret) => {
                    this.$emit("updateChatGroupStatus", this.groupId, ret, "slience");
                    console.log("slienceStateChange ", ret);
                })
        },
        groupTopStateChange: async function(state){
            services.common.GroupStatus(this.groupId, this.groupTopState, this.slienceState)
                .then((ret) => {
                    this.$emit("updateChatGroupStatus", this.groupId, ret, 'top');
                    console.log("groupTopStateChange ", ret);
                })
        },
        groupFavouriteStateChange: function(state){
            console.log("groupFavouriteStateChange ", state)
        },
        getClassNameThroughMemberUid: function(memberUid) {
            return "member-img-class-" + memberUid;
        },
        getIdThroughMemberUid: function(memberUid) {
            return "member-img-id-" + memberUid;
        },
        getIdThroughMemberUid2: function(memberUid) {
            return "member-img-div-id-" + memberUid;
        },
        getUidThroughElementId: function(elementId) {
            var uid = elementId.slice("member-img-div-id-".length, elementId.length);
            return uid;
        },
        getMemberImage: async function() {
            for(var i=0; i < this.memberListShow.length; i++) {
                var distUserInfo = this.memberListShow[i];
                console.log("distuserinfo.uid ", distUserInfo.user_id);
                var targetPath = '';
                if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(distUserInfo.avatar_t_url, distUserInfo.user_id))){
                    var distElement = document.getElementById(this.getIdThroughMemberUid(distUserInfo.user_id));
                    distElement.setAttribute("src", targetPath);
                }
            }
        },
        updateUserImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            console.log("group info updateuserimage args ", args)

            var distElement = document.getElementById(this.getIdThroughMemberUid(id));
            distElement.setAttribute("src", localPath);
        },
    },
    async created () {
        this.loginInfo = await services.common.GetLoginModel();
        console.log("userinfo-tip login info is ", this.loginInfo);
        this.curUserInfo = await services.common.GetSelfUserModel();
    },
    mounted() {
        setTimeout(() => {
            this.$nextTick(() => {
                ipcRenderer.on('updateGroupImg', this.updateGroupImg);
            })
        }, 0)
    },
    watch: {
        showGroupInfo: async function() {
            if(this.wholeTipElement == null) {
                this.wholeTipElement = document.getElementById("groupInfoTipId");
                // console.log("this.wholeTipElement ", this.wholeTipElement)
            }
            // console.log("this.showGroupInfo ", this.showGroupInfo)
            // console.log("this.wholeTipElement ", this.wholeTipElement)
            if(this.showGroupInfo == undefined || this.wholeTipElement == null) {
                return;
            }
            this.memberList = this.showGroupInfo.memberList;
            this.groupName = this.showGroupInfo.groupName;
            this.groupAvarar = this.showGroupInfo.groupAvarar;
            // this.groupNotice = this.showGroupInfo.groupNotice;
            this.groupId = this.showGroupInfo.groupId;
            this.isGroup = this.showGroupInfo.isGroup;
            this.slienceState = this.showGroupInfo.isSlience;
            this.groupTopState = this.showGroupInfo.isTop;
            this.isOwner = this.showGroupInfo.isOwner;
            // console.log("this.groupTopState ", this.groupTopState)
            // console.log("this.slienceState ", this.slienceState)
            for(var i=0;i<this.memberList.length;i++) {
                let memberInfoTmp = await services.common.GetDistUserinfo(this.memberList[i]);
                this.memberListShow.push(memberInfoTmp[0]);
            }
            // console.log("watch memberListShow is ", this.memberListShow);
            this.$nextTick(() => {
                this.getMemberImage();
            })
            this.wholeTipElement.style.right = "0px";
            this.wholeTipElement.style.top = "0px";

            let elementImg = document.getElementById("groupInfoImageId");
            // console.log("elementImg is ", elementImg);
            var targetPath = "";
            if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.groupAvarar, this.groupId))){
                elementImg.setAttribute("src", targetPath);
            }
            // services.common.downloadGroupAvatar(this.groupAvarar, this.groupId);
            // .then((ret) => {
            //     elementImg.setAttribute("src", URL.createObjectURL(ret.data));
            //     elementImg.onload = () => {
            //         URL.revokeObjectURL(elementImg.getAttribute("src"))
            //     }
            // })

            if(this.groupNotice.length == 0) {
                this.groupNotice = "未设置"
            }
        },
        cleanCache: function() {
            console.log("cleancache is ", this.cleanCache)
            if(this.cleanCache) {
                this.memberList = [];
                this.memberListShow = [];
                this.groupName = '';
                this.groupAvarar = '';
                this.groupNotice = '';
            }
        },
        updateUser: function() {
            var state = this.updateUser[0];
            var stateInfo = this.updateUser[1];
            var id = this.updateUser[2];
            var localPath = this.updateUser[3];

            console.log("group info updateuserimage args ", this.updateUser)

            var distElement = document.getElementById(this.getIdThroughMemberUid(id));
            if(distElement == null) {
                return
            }
            distElement.setAttribute("src", localPath);
        },
        updateNotice: function() {
            this.groupNotice = this.updateNotice;
        },
    }
}
</script>

<style lang="scss" scoped>
.groupInfo {
    height: 100%;
    width: 280px;
    padding: 0px;
    border-radius: 2px;
    background:rgba(255, 255, 255, 1);
    position: absolute;
    cursor: default;
    overflow-y: hidden;
    box-shadow:0px 0px 30px 0px rgba(103,103,103,0.24);
}

.groupInfoTitleDiv {
    height: 56px;
    width: 280px;
    padding: 0px;
    margin: 0px;
    border: 0px;
    background: rgba(255, 255, 255, 1);
    cursor: default;
}

.groupInfoTitle {
    font-size: 16px;
    font-weight: 590;
    height: 56px;
    line-height: 56px;
    margin: 0 0 0 16px;
}

.groupMember-view {
    max-height: 144px;
    width: 100%;
    padding: 0px;
    border: 0px;
    background: rgba(255, 255, 255, 1);
    cursor: default;
    border-bottom: 1 solid rgba(221, 221, 221, 1);
}

.groupMember-list {
    list-style: none;
    max-height: 144px;
    margin: 0;
    padding: 0;
    display: block;
    list-style: none;
    overflow-y: scroll;
    overflow-x: hidden;
}

.memberItem {
    width: 248px;
    height: 48px;
    padding-left: 16px;
    padding-right: 16px;
}

.groupMemberInfoDiv {
    width: calc(100% - 48px);
    height: 48px;
    margin: 0px;
    display: inline-block;
}

.groupMemberInfoImage {
    display: inline-block;
    padding-top: 8px;
    padding-bottom: 8px;
    width: 32px;
    height: 32px;
}

.groupMemberInfoLabel {
    display: inline-block;
    width: calc(100% - 68px);
    height: 48px;
    line-height: 48px;
    vertical-align: top;
    font-size: 14px;
    font-family:Microsoft Yahei;
    padding-left: 8px;
}

.groupMemberClickOut {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 20px;
    float: right;
}

.groupInfo-view {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-left: 16px;
    padding-right: 16px;
}

.groupInfoImageDiv {
    width: 48px;
    height: 48px;
    margin: 0px;
    display: inline-block;
    position: relative;
}

.groupInfoImage {
    width: 40px;
    height: 40px;
    position: absolute;
    top: 0px;
    left: 0px;
}

.groupInfoImageChange {
    width: 24px;
    height: 24px;
    position: absolute;
    bottom: 0px;
    right: 0px;
}

.groupInfoNoticeAndName {
    width: calc(100% - 56px);
    height: 48px;
    margin: 0px;
    display: inline-block;
    vertical-align: top;
}

.groupInfoName {
    width: 100%;
    display: inline-block;
}

.groupInfoNameInput {
    width: calc(100% - 30px);
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 15px;
    font-weight: bold;
}

.groupInfoNameInput:focus {
    width: calc(100% - 30px);
    border: 0px;
    outline: none;
    font-family:Microsoft Yahei;
    font-size: 15px;
    font-weight: bold;
    border: 0px;
}

.groupInfoNameEdit {
    width: 21px;
    height: 21px;
    float: right;
    margin: 0px;
    padding: 0px;
}

.groupInfoNameEdit:hover {
    width: 21px;
    height: 21px;
    float: right;
    margin: 0px;
    padding: 0px;
    background-size: auto 100%;
    background-image: url("../../../static/Img/Chat/edit-20px@2x.png");
    background-repeat: no-repeat;
}

.groupInfoNotice {
    width: 100%;
    display: inline-block;
}

.groupInfoNoticeInput {
    width: calc(100% - 30px);
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 12px;
    color: rgba(103, 103, 103, 0.24);
}

.groupInfoNoticeInput:focus {
    width: calc(100% - 30px);
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 12px;
    color: rgba(103, 103, 103, 0.24);
}

.groupInfoNoticeEdit {
    width: 20px;
    height: 20px;
    float: right;
}

.groupSettingSilenceDiv {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 16px;
    padding-right: 16px;
}

.groupSettingSlienceLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 68px);
    font-size: 14px;
    font-family:Microsoft Yahei;
}

.groupSettingSlienceSwitch {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 32px;
    float: right;
}

.groupSettingTopDiv {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 16px;
    padding-right: 16px;
}

.groupSettingTopLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 68px);
    font-size: 14px;
    font-family:Microsoft Yahei;
}

.groupSettingTopSwitch {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 32px;
    float: right;
}

.groupSettingFavouriteDiv {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 16px;
    padding-right: 16px;
}

.groupSettingFavouriteLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 68px);
    font-size: 14px;
    font-family:Microsoft Yahei;
}

.groupSettingFavouriteSwitch {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 32px;
    float: right;
}

.groupSettingOwnerTransferDiv {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 16px;
    padding-right: 16px;
}

.groupSettingOwnerTransferLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 68px);
    font-size: 14px;
    font-family:Microsoft Yahei;
}

.groupSettingOwnerTransferImage {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 20px;
    float: right;
    cursor: pointer;
}

.groupMemberAddDiv {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 16px;
    padding-right: 16px;
}

.groupMemberAddDivLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 68px);
    font-size: 14px;
    font-family:Microsoft Yahei;
}

.groupMemberAddDivImage {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 20px;
    float: right;
    cursor: pointer;
}

.groupLeave-view{
    height: 48px;
    padding: 0px;
    background: rgba(255, 255, 255, 1);
    border: 0px solid rgba(221, 221, 221, 1)
}

.groupLeaveDiv{
    height: 48px;
    width: 100%;
    border: 0px;
    padding: 0px;
    margin: 0px;
    font-family:Microsoft Yahei;
    font-size: 14px;
    font-weight: bold;
    color: red;
    text-align: center;
}

.groupDismiss-view{
    height: 48px;
    padding: 0px;
    background: rgba(255, 255, 255, 1);
    border: 0px;
}

.groupDismissDiv{
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 0px;
    margin: 0px;
    width: 100%;
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 14px;
    font-weight: bold;
    color: red;
    text-align: center;
}

</style>