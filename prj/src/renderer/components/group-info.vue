<template>
    <div class="groupInfo" id="groupInfoTipId">
        <div class="groupMember-view">
            <ul class="groupMember-list">
                <li class="addMember">
                    <div class="memberAddImg">
                        <img class="memberImg" src="../../../static/Img/Chat/emoji@3x.png" height=40px  @click="showAddMembers">
                    </div>
                    <div class="memberName">添加
                    </div>
                </li>
                <li v-for="(item, index) in memberListShow" class="memberInfo">
                    <div class="memberImg" :id="getIdThroughMemberUid2(item.user_id)" @click="showUserInfoTip">
                        <img :id="getIdThroughMemberUid(item.user_id)" src="../../../static/Img/User/user.jpeg" height=40px>
                    </div>
                    <div class="memberName">{{item.user_display_name}}
                    </div>
                </li>
            </ul>
            <div class="addMore" v-show="isShowMore()" @click="showMore()">
                更多.....
            </div>
        </div>
        <div class="groupInfo-view" v-show="isGroup">
            <div class="groupInfoNameDiv">
                <label class="groupInfoNameLabel" for="群聊名称">群聊名称</label>
                <input class="groupInfoNameInput" id="groupInfoNameInputId" type="text" v-model="newGroupName" :placeholder="this.groupName" @keyup="keyUpdateGroupName($event)"/>
            </div>
            <div class="groupInfoImageDiv">
                <label class="groupInfoImageLabel">群聊头像</label>
                <img id="groupInfoImageId" class="groupInfoImage" src="../../../static/Img/User/user.jpeg" height="40px">
            </div>
            <div class="groupInfoNoticeDiv">
                <label class="groupInfoNoticeLabel" for="群公告">群公告</label>
                <input class="groupInfoNoticeInput" id="groupInfoNoticeInputId" type="text" v-model="newGroupNotice" name="groupInfoNotice" :placeholder="this.groupNotice" @keyup="keyUpdateGroupNotice($event)"/>
            </div> 
        </div>
        <div class="groupSetting-view">
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
        </div>
        <div class="groupClear-view">
            <p class="groupClearDiv" @click="clearAll()">
                清空聊天记录
            </p>
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
import {ipcRenderer} from 'electron'
import {getElementTop, getElementLeft} from '../../packages/core/Utils.js'
export default {
    name: 'group-info',
    data() {
        return {
            newGroupName: '',
            newGroupNotice: '',
            memberListShow: [],
            absoluteTop: 0,
            absoluteLeft: 0,
            allMemberList: [],
            groupName: '',
            groupAvarar: '',
            groupNotice: '',
            slienceState: true,
            groupTopState: true,
            groupFavouriteState: true,
            groupId: '',
            isGroup: true,
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
        }
    },
    computed: {
    },
    methods: {
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
        keyUpdateGroupNotice: function(event) {
            if(event.code == "Enter") {
                if(this.newGroupNotice == this.groupNotice){
                    return;
                }
                var updateGroupNoticeInputElement = document.getElementById("groupInfoNoticeInputId")
                updateGroupNoticeInputElement.blur();
                services.common.UpdateGroupNotice(this.groupId, this.newGroupNotice);
                this.groupNotice == this.newGroupNotice;
            }
        },
        updateGroupNotice: function() {
            if(this.newGroupNotice == this.groupNotice){
                return;
            }
            var updateGroupNoticeInputElement = document.getElementById("groupInfoNoticeInputId")
            updateGroupNoticeInputElement.blur();
            services.common.UpdateGroupNotice(this.groupId, this.newGroupNotice);
            this.groupNotice == this.newGroupNotice;
        },
        Close: function() {
            this.$emit("closeGroupInfo");
        },
        showMore: function() {
            this.memberListShow = this.allMemberList
            this.getMemberImage();
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
                else {
                    if(!this.ipcInited) {
                        ipcRenderer.on('updateUserImage', this.updateUserImage);
                        this.ipcInited = true;
                    }
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
        isShowMore: function() {
            if(this.memberListShow.length == this.allMemberList.length) {
                return false;
            }
            return true;
        }
    },
    async created () {
        this.loginInfo = await services.common.GetLoginModel();
        console.log("userinfo-tip login info is ", this.loginInfo);
        this.curUserInfo = await services.common.GetSelfUserModel();
    },
    mounted() {
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
            this.groupNotice = this.showGroupInfo.groupNotice;
            this.groupId = this.showGroupInfo.groupId;
            this.isGroup = this.showGroupInfo.isGroup;
            this.slienceState = this.showGroupInfo.isSlience;
            this.groupTopState = this.showGroupInfo.isTop;
            // console.log("this.groupTopState ", this.groupTopState)
            // console.log("this.slienceState ", this.slienceState)
            for(var i=0;i<this.memberList.length;i++) {
                let memberInfoTmp = await services.common.GetDistUserinfo(this.memberList[i]);
                this.allMemberList.push(memberInfoTmp[0]);
                if(i < 11) {
                    this.memberListShow.push(memberInfoTmp[0]);
                }
            }
            // console.log("watch memberListShow is ", this.memberListShow);
            this.$nextTick(() => {
                this.getMemberImage();
            })
            this.wholeTipElement.style.right = "0px";
            this.wholeTipElement.style.top = "42px";

            let elementImg = document.getElementById("groupInfoImageId");
            // console.log("elementImg is ", elementImg);
            services.common.getGroupAvatar(this.groupAvarar)
            .then((ret) => {
                elementImg.setAttribute("src", URL.createObjectURL(ret.data));
                elementImg.onload = () => {
                    URL.revokeObjectURL(elementImg.getAttribute("src"))
                }
            })

            if(this.groupNotice.length == 0) {
                this.groupNotice = "未设置"
            }
        },
        cleanCache: function() {
            console.log("cleancache is ", this.cleanCache)
            if(this.cleanCache) {
                this.memberList = [];
                this.allMemberList = [];
                this.memberListShow = [];
                this.groupName = '';
                this.groupAvarar = '';
                this.groupNotice = '';
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.groupInfo {
    height: calc(100% - 66px);
    width: 220px;
    padding: 10px;
    border: 1.5px solid rgb(242, 242, 246);
    box-shadow: 2px 2px 5px rgb(219,219,219);
    background:  rgb(245,246,247);
    position: absolute;
    cursor: default;
    overflow-y: scroll;
}

.groupMember-view {
    max-height: 260px;
    width: 220px;
    padding: 0px;
    margin: 0px;
    border: 0px;
    background: rgba(255, 255, 255, 1);
    cursor: default;
}

.groupMember-list {
    list-style: none;
    max-height: 260px;
    margin: 0;
    padding: 0;
    display: block;
    flex-direction: column;
    list-style: none;
    // height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;

    & > li {
        border: 1px solid rgb(242, 242, 246);
        width: 40px !important;
        height: 40px !important;
        text-align: center;
        display: inline-block;
        line-height: 40px;
        margin: 4px;
        cursor: pointer;
        & > img {
        width: 100%;
        height: 100%;
        }
    }
}

.memberImg {
    width: 40px;
    height: 40px;
}

.memberAddImg {
    width: 40px;
    height: 40px;
}

.memberName {
    width: 40px;
    height: 20px;
    max-width: 40px;
    max-height: 20px;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.addMore {
    width: 200px;
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
}

.groupInfo-view {
    margin-top: 15px;
    padding: 5px 5px 5px 5px;
    background: rgba(255, 255, 255, 1);
    border-top: 1px solid rgb(245,246,247);
}

.groupInfoNameDiv {
    width: 100%;
    margin-top: 5px;
    margin-bottom: 5px;
}

.groupInfoNameLabel{
    width: 100%;
    font-size: 13px;
    font-family:Microsoft Yahei;
}

.groupInfoNameInput {
    width: 100%;
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 13px;
}

.groupInfoNameInput:focus {
    width: 100%;
    border: 0px;
    outline: none;
    font-family:Microsoft Yahei;
    font-size: 13px;
    border: 0px;
}

.groupInfoImageDiv {
    width: 100%;
    height: 40px;
    margin-top: 5px;
    margin-bottom: 5px;
}

.groupInfoImageLabel {
    height: 40px;
    font-size: 13px;
    line-height: 40px;
    font-family:Microsoft Yahei;
}

.groupInfoImage {
    float: right;
}

.groupInfoNoticeDiv {
    width: 100%;
    margin-top: 5px;
    margin-bottom: 5px;
}

.groupInfoNoticeLabel {
    width: 100%;
    font-size: 13px;
    font-family:Microsoft Yahei;
}

.groupInfoNoticeInput {
    width: 100%;
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 13px;
}

.groupInfoNoticeInput:focus {
    width: 100%;
    border: 0px;
    outline: none;
    font-family:Microsoft Yahei;
    font-size: 13px;
}

.groupSetting-view {
    margin-top: 15px;
    padding: 5px 5px 5px 5px;
    background: rgba(255, 255, 255, 1);
    border-top: 1px solid rgb(245,246,247);
}

.groupSettingSilenceDiv {
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
}

.groupSettingSlienceLabel {
    font-size: 13px;
    font-family:Microsoft Yahei;
}

.groupSettingSlienceSwitch {
    float: right;
}

.groupSettingTopDiv {
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
}

.groupSettingTopLabel {
    font-size: 13px;
    font-family:Microsoft Yahei;
}

.groupSettingTopSwitch {
    float: right;
}

.groupSettingFavouriteDiv {
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
}

.groupSettingFavouriteLabel {
    font-size: 13px;
    font-family:Microsoft Yahei;
}

.groupSettingFavouriteSwitch {
    float: right;
}

.groupClear-view{
    margin-top: 15px;
    padding: 5px 5px 5px 5px;
    background: rgba(255, 255, 255, 1);
    border-top: 1px solid rgb(245,246,247);
}

.groupClearDiv{
    margin-top: 5px;
    margin-bottom: 5px;
    width: 100%;
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 13px;
    color: red;
    text-align: center;
}

.groupLeave-view{
    margin-top: 15px;
    padding: 5px 5px 5px 5px;
    background: rgba(255, 255, 255, 1);
    border-top: 1px solid rgb(245,246,247);
}

.groupLeaveDiv{
    margin-top: 5px;
    margin-bottom: 5px;
    width: 100%;
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 13px;
    color: red;
    text-align: center;
}

.groupDismiss-view{
    margin-top: 15px;
    padding: 5px 5px 5px 5px;
    background: rgba(255, 255, 255, 1);
    border-top: 1px solid rgb(245,246,247);
}

.groupDismissDiv{
    margin-top: 5px;
    margin-bottom: 5px;
    width: 100%;
    border: 0px;
    font-family:Microsoft Yahei;
    font-size: 13px;
    color: red;
    text-align: center;
}

.members {
    width: 100%;
    float:right;
    margin-top: 8px;
    margin-bottom: 8px;
}

.user-icon {
    width: 56px;
    height: 56px;
    display: inline-block;
    margin: 0px;
    border-radius: 4px;
}

.user-baseInfo {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 72px);
}

.user-name {
    height: 20px;
    margin-top: 6px;
    margin-bottom: 6px;
    margin-left: 16px;
    font-size: 16px;
    line-height: 20px;
}

.user-title {
    height: 18px;
    margin-top: 0px;
    margin-left: 16px;
    font-size: 12px;
    line-height: 18px;
    color: rgb(153, 153, 153);
}

.userAction-view {
    height: 54px;
    width: 100%;
    margin: 0px;
    display: inline-block;
    vertical-align: top;
    border-bottom: 1px solid rgb(221, 221, 221);
    margin-bottom: 8px;
}

.userAudioIcon {
    height: 28px;
    width: 28px;
    margin-top: 13px;
    margin-left: 0px;
}

.userVideoIcon {
    height: 28px;
    width: 28px;
    margin-top: 13px;
    margin-left: 14px;
}

.userChatIcon {
    height: 28px;
    width: 28px;
    margin-top: 13px;
    margin-left: 14px;
}

.userState-view {
    width: 100%;
    margin-bottom: 10px;
}

.userState-list {
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;

}

.userOrganization-list {
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;

}

.userContact-list {
    padding: 0;
    margin: 0;
    list-style: none;
}

.li {
    height: 34px;
    line-height: 34px;
    width: 100%;
}

.userInfo-key {
    display:inline-block;
    line-height: 18px;
    width: 48px;
    font-size: 12px;
    color: rgb(153, 153, 153);
}

.userInfo-value {
    display:inline-block;
    line-height: 18px;
    width: 216px;
    font-size: 12px;
    padding-left: 20px;
    cursor: pointer;
}

.userInfo-phone-value{
    display:inline-block;
    line-height: 18px;
    width: 216px;
    font-size: 12px;
    padding-left: 20px;
    color: rgb(62, 180, 240);
    
}

.userOrganizationInfo-view {
    width: 100%;
    margin-bottom: 10px;
}
</style>