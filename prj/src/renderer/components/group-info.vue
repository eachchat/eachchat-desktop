<template>
    <div class="groupInfo" id="groupInfoTipId">
        <div class="groupInfoTitleDiv">
            <p class="groupInfoTitle">设置</p>
        </div>
        <div class="groupInfo-view">
            <div class="groupInfoImageDiv">
                <img id="groupInfoImageId" class="groupInfoImage" src="../../../static/Img/User/user-40px@2x.png">
                <img id="groupInfoImageChangeId" class="groupInfoImageChange" src="../../../static/Img/Chat/updateHeadImg-24px@2x.png" @click="updateGroupImg" v-show="isOwner">
            </div>
            <div class="groupInfoNoticeAndName">
                <div class="groupInfoName">
                    <!-- <input class="groupInfoNameInput" id="groupInfoNameInputId" type="text" :disabled="!isOwner" v-model="newGroupName" @input="inputChanget($event)" @keyup="keyUpdateGroupName($event)" @mousemove="showNameEdit" @mouseout="hideNameEdit"/> -->
                    <div class="chat-name">{{groupName}}</div>
                    <p class="groupInfoNameEdit" id="groupInfoNameEditId" v-show="isOwner" @click.stop="changeChateInfo()"></p>
                </div>
                <div class="chat-desc">{{showGroupInfo.groupTopic}}</div>
                <!-- <div class="peopleInfo" v-if="!isGroup">
                    <input class="peopleInfoInput" id="peopleInfoInputId" type="text" :disabled="!isOwner" v-model="peopleState" name="peopleInfo" placeholder="未设置"/>
                </div>
                <div class="groupInfoNotice" @click="updateGroupNotice" v-else>
                    <input class="groupInfoNoticeInput" id="groupInfoNoticeInputId" type="text" :disabled="!isOwner" v-model="groupNotice" name="groupInfoNotice" placeholder="未设置" @mousemove="showNoticeEdit" @mouseout="hideNoticeEdit"/>
                    <p class="groupInfoNoticeEdit" id="groupInfoNoticeEditId"></p>
                </div> -->
            </div>
        </div>
        <div class="secretGroupDiv" v-show="!isGroup && isSecret" @click="showSecretType()">
            <span class="secretTypeButton" @click="showSecretType()">加密等级</span>
            <span class="secretType" id="secretTypeId" @click="showSecretType()">自动</span>
            <!-- <img class="secretTypeImg" src="../../../static/Img/Chat/secretArrow-20px@2x.png"> -->
        </div>
        <div class="secretTypeDropdownContent" id="secretTypeDropdownContentId" v-show="showSecretOption">
            <div class="secretTypeAuto" @click="selectAuto()">
                <span class="secretTypeAutoLabel">自动</span>
            </div>
        </div>
        <div class="groupSettingSilenceDiv" @click.stop="openSetting()">
            <label class="groupSettingSlienceLabel">群聊设置</label>
        </div>
        <div class="groupSettingSilenceDiv" v-show="isGroup">
            <label class="groupSettingSlienceLabel">消息免打扰</label>
            <el-switch class="groupSettingSlienceSwitch" v-model="mxMute" @change="mxMuteChange(mxMute)">
            </el-switch>
        </div>
        <div class="groupSettingTopDiv" v-show="!isSecret">
            <label class="groupSettingTopLabel">置顶聊天</label>
            <el-switch class="groupSettingTopSwitch" v-model="groupTopState" @change="groupTopStateChange(groupTopState)">
            </el-switch>
        </div>
        <div class="groupSettingFavouriteDiv" v-show="isGroup">
            <label class="groupSettingFavouriteLabel">保存到收藏</label>
            <el-switch class="groupSettingFavouriteSwitch" v-model="groupFavouriteState" @change="groupFavouriteStateChange(groupFavouriteState)">
            </el-switch>
        </div>
        <div class="groupSettingOwnerTransferDiv" v-show="isGroup && isOwner" @click="ownerTransfer">
            <label class="groupSettingOwnerTransferLabel">转让群主</label>
            <img id="groupSettingOwnerTransferImageId" class="groupSettingOwnerTransferImage" src="../../../static/Img/Chat/arrow-20px@2x.png">
        </div>
        <div class="groupMemberDiv" v-show="isGroup">
            <div class="groupMemberSearchDiv" v-if="isSearch">
                <input type="text" class="searchMemberInput" v-model="searchKey" @input="searchMember">
                <p class="searchMemberCancel" @click="showAdd">取消</p>
            </div>
            <div class="groupMemberAddDiv" v-else>
                <label class="groupMemberAddDivLabel">群成员</label>
                <img class="groupMemberSearchImage" src="../../../static/Img/Chat/search-20px@2x.png" @click="showSearch">
                <img id="groupMemberAddDivImageId" class="groupMemberAddDivImage" src="../../../static/Img/Chat/add-20px@2x.png" @click="showAddMembers">
            </div>
        </div>
        <div :class="groupListViewClassName()" v-show="isGroup">
            <ul class="groupMember-list">
                <li v-for="(item, index) in mxMembers" class="memberItem" @mouseout="hideDeleteButton(item)" @mousemove="showDeleteButton(item)">
                    <div class="groupMemberInfoDiv">
                        <img :id="getIdThroughMemberUid(item.userId)" class="groupMemberInfoImage" @click="showUserInfoTip($event, item)">
                        <label :id="getLabelIdThroughMemberUid(item.userId)" class="groupMemberInfoLabel" @click="showUserInfoTip($event, item)">{{item.name}}</label>
                    </div>
                    <img class="groupMemberClickOut" :id="getDeleteIdThroughMemberUid(item.user_id)" src="../../../static/Img/Chat/delete-20px@2x.png" @click="deleteMember(item)" v-show="notOwner(item)">
                </li>
            </ul>
        </div>
        <div class="footer">
            <div class="groupLeave-view" v-show="isGroup">
                <p class="groupLeaveDiv" @click="leave()">
                    退出群聊
                </p>
            </div>
            <div class="groupDismiss-view" v-show="isGroup && isOwner">
                <p class="groupDismissDiv" @click="dismiss()">
                    解散群聊
                </p>
            </div>
            <div class="groupDelete-view" v-show="!isGroup">
                <p class="groupDeleteDiv" @click="dismiss()">
                    删除聊天
                </p>
            </div>
        </div>
        <image-cropper v-if="showImageCropper" :groupId="groupId" :imageSource="selectImageSource" @closeCropperDlg="closeCropperDlg"></image-cropper>
        <AlertDlg :AlertContnts="alertContnets" :alertType="alertType" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="clearCache"/>
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
import { stat } from 'fs'
import imageCropper from './imageCropper.vue'
import { UserInfo } from '../../packages/data/sqliteutil.js'
import AlertDlg from './alert-dlg.vue'
export default {
    name: 'group-info',
    data() {
        return {
            showSecretOption: false,
            isSecret: false,
            canSelecteFile: true,
            alertContnets: {},
            alertType: '',
            showAlertDlg: false,
            showImageCropper:false,
            selectImageSource: '',
            newGroupName: '',
            memberListShow: [],
            memberListShowOriginal: [],
            absoluteTop: 0,
            absoluteLeft: 0,
            groupName: '',
            groupAvarar: '',
            groupNotice: '',
            peopleState: '',
            slienceState: true,
            groupTopState: true,
            groupFavouriteState: true,
            groupId: '',
            isGroup: true,
            isOwner: false,
            nameEditElement: null,
            noticeEditElement: null,
            isSearch: false,
            searchKey: "",
            searchId: 0,
            ownerId: '',
            cursorX: 0,
            cursorY: 0,
            //matrix data
            mxMute: 0,
            mxMembers: [],
        }
    },
    components: {
        imageCropper,
        AlertDlg,
    },
    props: {
        "showGroupInfoTips": {
            type: Boolean,
            default: false
        },
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
        // "updateNotice": {
        //     type: String,
        //     default: ""
        // }
    },
    computed: {
    },
    methods: {
        changeChateInfo: function() {
            this.$emit('openChatInfoDlg')
        },
        openSetting: function() {
            this.$emit('openSetting')
        },
        mxGetMembers: function() {
            const roomId = this.showGroupInfo.groupId;
            const cli = window.mxMatrixClientPeg.matrixClient;
            console.log('mxGetMembers roomId', roomId);
            const xie1 = cli.getRoom(roomId);
            const xie2 = cli.getRoomPushRule("global", roomId);
            console.log('----xie1----', xie1);
            console.log('----xie2----', xie2);
            const mxMembers = [];
            for(let key in xie1.currentState.members) {
                mxMembers.push(xie1.currentState.members[key]);
            }
            console.log('mxMembers', mxMembers);
            this.mxMembers = [...this.mxMembers, ...mxMembers];
        },
        mxMuteChange: function(mxMute) {
            console.log('---mxMuteChange---', this.mxMute);
            if (mxMute) { // set mute
                const cli = window.mxMatrixClientPeg.matrixClient;
                const promises = [];
                const roomId = this.showGroupInfo.groupId;
                const roomRule = cli.getRoomPushRule('global', roomId);
                if (roomRule) {
                    promises.push(cli.deletePushRule('global', 'room', roomRule.rule_id));
                }

                // add/replace an override rule to squelch everything in this room
                // NB. We use the room ID as the name of this rule too, although this
                // is an override rule, not a room rule: it still pertains to this room
                // though, so using the room ID as the rule ID is logical and prevents
                // duplicate copies of the rule.
                promises.push(cli.addPushRule('global', 'override', roomId, {
                    conditions: [
                        {
                            kind: 'event_match',
                            key: 'room_id',
                            pattern: roomId,
                        },
                    ],
                    actions: [
                        'dont_notify',
                    ],
                }));
                console.log('--set mute!!--')
                return Promise.all(promises);
            } else { //set unmute

            }
        },
        getRoomNotifsState: function(roomId) { //message setting relevant
            if (window.mxMatrixClientPeg.matrixClient.isGuest()) {
                console.log('---isGuest MUTE---');              
                this.mxMute = 1; 
                return 'ALL_MESSAGES';
            }
            // look through the override rules for a rule affecting this room:
            // if one exists, it will take precedence.
            const muteRule = this.findOverrideMuteRule(roomId);
            if (muteRule) {
                console.log('---MUTE---');              
                this.mxMute = 0;
                return 'MUTE';
            }
            // for everything else, look at the room rule.
            let roomRule = null;
            try {
                roomRule = window.mxMatrixClientPeg.matrixClient.getRoomPushRule('global', roomId);
                console.log('?????>>?>?>>?>?', roomRule);
            } catch (err) {
                // Possible that the client doesn't have pushRules yet. If so, it
                // hasn't started eiher, so indicate that this room is not notifying.
                console.log('----err return----', err);
                return null;
            }
            console.log('----roomRule----', roomRule);
            // XXX: We have to assume the default is to notify for all messages
            // (in particular this will be 'wrong' for one to one rooms because
            // they will notify loudly for all messages)
            if (!roomRule || !roomRule.enabled) {
                console.log('---ALL_MESSAGES---');
                this.mxMute = 1;
                return 'ALL_MESSAGES';
            }
            // a mute at the room level will still allow mentions
            // to notify
            if (this.isMuteRule(roomRule)) {
                console.log('---MENTIONS_ONLY---');
                this.mxMute = 1; 
                return 'MENTIONS_ONLY'; 
            }

            console.log('---just return---')
            // const actionsObject = PushProcessor.actionListToActionsObject(roomRule.actions);
            // if (actionsObject.tweaks.sound) return ALL_MESSAGES_LOUD;

            return null;
        },
        findOverrideMuteRule: function(roomId) { //message setting relevant
            if (!window.mxMatrixClientPeg.matrixClient.pushRules ||
                !window.mxMatrixClientPeg.matrixClient.pushRules['global'] ||
                !window.mxMatrixClientPeg.matrixClient.pushRules['global'].override) {
                return null;
            }
            for (const rule of window.mxMatrixClientPeg.matrixClient.pushRules['global'].override) {
                if (this.isRuleForRoom(roomId, rule)) {
                    if (this.isMuteRule(rule) && rule.enabled) {
                        return rule;
                    }
                }
            }
            return null;
        },
        isRuleForRoom: function(roomId, rule) { //message setting relevant	
            if (rule.conditions.length !== 1) {
                return false;
            }
            const cond = rule.conditions[0];
            return (cond.kind === 'event_match' && cond.key === 'room_id' && cond.pattern === roomId); 
        },
        isMuteRule: function(rule) { //message setting relevant
            return (rule.actions.length === 1 && rule.actions[0] === 'dont_notify');
        },
        showSecretType: function() {
            this.showSecretOption = true;
            var secretTypeBtnElement = document.getElementById("secretTypeId");
            var secretOptionMenuElement = document.getElementById("secretTypeDropdownContentId");
            var top = secretTypeBtnElement.offsetTop + secretTypeBtnElement.offsetHeight;
            var left = secretTypeBtnElement.offsetLeft;
            secretOptionMenuElement.style.display = "block";
            secretOptionMenuElement.style.top = top + "px";
            secretOptionMenuElement.style.left = left + "px";
        },
        selectAuto: function() {
            this.showSecretOption = false;
        },
        groupListViewClassName: function() {
            if(this.isOwner) {
                return "groupMember-view-owner"
            }
            else {
                return "groupMember-view"
            }
        },
        closeAlertDlg: function() {
            this.showAlertDlg = false;
        },
        closeCropperDlg(){
            this.showImageCropper = false;
        },
        notOwner: function(distUser) {
            if(distUser.user_id == this.ownerId) {
                return false;
            }
            return true;
        },
        deleteMember: async function(distUser) {
            var ret = await services.common.DeleteGroupUsers(this.groupId, [distUser.user_id]);
            console.log("ret is ", ret);
            if(ret) {
                for(let i=0;i<this.memberListShow.length;i++) {
                    if(this.memberListShow[i].user_id == distUser.user_id) {
                        this.memberListShow.splice(i, 1);
                        break;
                    }
                }
                for(let i=0;i<this.memberListShowOriginal.length;i++) {
                    if(this.memberListShowOriginal[i].user_id == distUser.user_id) {
                        this.memberListShowOriginal.splice(i, 1);
                        break;
                    }
                }
            }
            this.$emit("closeGroupInfo");
        },
        ownerTransfer: function() {
            this.$emit("showOwnerTransferDlg");
        },
        searchMember: function() {
            if(this.searchKey.length == 0) {
                this.memberListShow = this.memberListShowOriginal;
                this.getMemberImage();
            }
            var curSearchId = new Date().getTime();
            console.log("searchkey is ", this.searchKey);
            var searchResult = {
                "id": curSearchId,
                "searchList": []
            };
            this.searchId = curSearchId;
            for(let i=0;i<this.memberListShowOriginal.length;i++) {
                if(this.memberListShowOriginal[i].user_display_name.indexOf(this.searchKey) != -1) {
                    searchResult.searchList.push(this.memberListShowOriginal[i]);
                }
            }

            if(searchResult.id == this.searchId) {
                this.memberListShow = searchResult.searchList;
                this.getMemberImage();
            }
        },
        showSearch: function() {
            console.log("showsearch ");
            this.isSearch = true;
        },
        showAdd: function() {
            this.searchKey = '';
            this.memberListShow = this.memberListShowOriginal;
            this.isSearch = false;
            this.$nextTick(()=> {
                this.getMemberImage();
            })
        },
        showNameEdit: function(e) {
            // console.log("show name edit ", e)
            if(!this.isOwner) {
                return;
            }
            if(this.nameEditElement == null) {
                this.nameEditElement = document.getElementById("groupInfoNameEditId");
            }
            this.nameEditElement.style = "width: 21px;height: 21px;float: right;margin: 0px;padding: 0px;background-size: auto 100%;background-image: url('../../../static/Img/Chat/edit-20px@2x.png');background-repeat: no-repeat;"
        },
        hideNameEdit: function(e) {
            // console.log("show name edit ", e)
            if(this.nameEditElement == null) {
                this.nameEditElement = document.getElementById("groupInfoNameEditId");
            }
            this.nameEditElement.style = "width: 21px;height: 21px;float: right;margin: 0px;padding: 0px;";
        },
        showNoticeEdit: function(e) {
            if(!this.isOwner) {
                return;
            }
            // console.log("show name edit ", e)
            if(this.noticeEditElement == null) {
                this.noticeEditElement = document.getElementById("groupInfoNoticeEditId");
            }
            this.noticeEditElement.style = "width: 20px;height: 20px;float: right;margin: 0px;padding: 0px;background-size: auto 100%;background-image: url('../../../static/Img/Chat/arrow-20px@2x.png');background-repeat: no-repeat;"
        },
        hideNoticeEdit: function(e) {
            // console.log("hide name edit ", e)
            if(this.noticeEditElement == null) {
                this.noticeEditElement = document.getElementById("groupInfoNoticeEditId");
            }
            this.noticeEditElement.style = "width: 21px;height: 21px;float: right;margin: 0px;padding: 0px;";
        },
        showDeleteButton: function(distUser) {
            if(!this.isOwner) {
                return;
            }
            // console.log("show name edit ", distUser)
            var distId = this.getDeleteIdThroughMemberUid(distUser.user_id)
            var userDeleteElement = document.getElementById(distId);
            userDeleteElement.style.opacity = 1; 
        },
        hideDeleteButton: function(distUser) {
            // console.log("hide name edit ", distUser)
            var distId = this.getDeleteIdThroughMemberUid(distUser.user_id)
            var userDeleteElement = document.getElementById(distId);
            userDeleteElement.style.opacity = 0; 
        },
        updateGroupImg: function(e, args) {
            console.log("group info updategroupimg args is ", args)
            if(args != undefined && args.length != 0) {
                var state = args[0];
                var stateInfo = args[1];
                var id = args[2];
                var localPath = args[3];
                if(id != this.groupId) {
                    return;
                }
                let elementImg = document.getElementById("groupInfoImageId");
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                var reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
            }
            else {
                if(this.canSelecteFile) {
                    this.canSelecteFile = false;
                    remote.dialog.showOpenDialog({
                            defaultPath: 'c:/',
                            filters: [
                                    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
                                ],
                        }, async (files) => {
                            this.canSelecteFile = true;
                            if(files && files.length > 0) {
                                this.showImageCropper = true;
                                this.selectImageSource = files[0];
                                // var targetDir = confservice.getUserThumbHeadPath();
                                // var targetPath = path.join(targetDir, this.groupId + '.png');
                                // if(fs.existsSync(targetPath)) {
                                //     fs.unlinkSync(targetPath);
                                // }
                                // var distFilePath = pathDeal(files[0]);
                                
                                // var ret = await services.common.UpdateGroupAvatar(this.groupId, distFilePath, this.groupAvarar);
                                // console.log("ret is ", ret);
                                // if(ret.ok == true && ret.success == true) {
                                //     ipcRenderer.send('modifyGroupImg', [this.groupId, distFilePath]);
                                // }
                                
                            }
                    })
                }
            }
        },
        showUserInfoTip: async function(e, item) {
            console.log("e is ", e.target.id);
            console.log("item is ", item)
            var distElement = e.target;
            if(this.wholeTipElement == null) {
                this.wholeTipElement = document.getElementById("groupInfoTipId");
                // console.log("this.wholeTipElement ", this.wholeTipElement)
            }
            var wholeWinTop = this.wholeTipElement.offsetTop;
            var wholeWinLeft = this.wholeTipElement.offsetLeft;
            var uid = item.user_id;

            if(distElement == undefined) {
                distElement = document.getElementById(this.getLabelIdThroughMemberUid(uid));
            }

            var curAbsoluteTop = distElement.offsetTop;
            var curAbsoluteLeft = distElement.offsetLeft;
            var isMine = (uid == this.curUserInfo.id);

            console.log("uid is ", uid);
            var curUserInfo = await services.common.GetDistUserinfo(uid);
            console.log("curuser inf os ", curUserInfo)
            var tipInfos = {
                "userInfo": curUserInfo[0],
                // "absoluteTop": curAbsoluteTop + wholeWinTop,
                "absoluteTop": this.cursorY,
                // "absoluteLeft": curAbsoluteLeft + wholeWinLeft,
                "absoluteLeft": this.cursorX - 330,
                "isMine": isMine,
                "showLeft": true,
            }
            // console.log("emit absoluteTop ", curAbsoluteTop + wholeWinTop);
            // console.log("emit absoluteLeft ", curAbsoluteLeft + wholeWinLeft);
            // console.log("emit openUserInfoTip ", tipInfos);
            this.$emit("openUserInfoTip", tipInfos);
        },
        showAddMembers: function() {
            this.$emit("showAddMembers", this.memberList);
        },
        inputChanget: function(event) {
            console.log(this.newGroupName)
            if(this.newGroupName.length > 25) {
                this.newGroupName = this.newGroupName.substring(0, 25);
            }
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
            if(this.newGroupName.trim().length > 25) {
                this.$toastMessage({message:'群名称超长，最多只支持25个字符，请重新输入。', time:1500, type:'success'});
                return;
            }
            var updateGroupNameInputElement = document.getElementById("groupInfoNameInputId")
            updateGroupNameInputElement.blur();
            services.common.UpdateGroupName(this.groupId, this.newGroupName);
            this.groupName = this.newGroupName;
        },
        updateGroupNotice: function(event) {
            this.$emit("updateChatGroupNotice", this.groupId, this.groupNotice, this.isOwner);
        },
        Close: function() {
            this.$emit("closeGroupInfo");
        },
        clearCache: async function(alertType) {
            if(alertType == "leaveGroup") {
                var ret = await services.common.QuitGroup(this.groupId);
                this.$emit("leaveGroup", this.groupId);
            }
            else if(alertType == "dismissGroup") {
                var ret = await services.common.DeleteGroup(this.groupId);
                this.$emit("leaveGroup", this.groupId);
            }
            this.closeAlertDlg();
        },
        leave: async function() {
            this.alertContnets = {
                "Details": "确定要退出群聊吗？",
                "Abstrace": "提醒"
            };
            this.alertType = "leaveGroup";
            this.showAlertDlg = true;
        },
        dismiss: async function() {
            this.alertContnets = {
                "Details": "确定要解散群聊吗？",
                "Abstrace": "提醒"
            };
            this.alertType = "dismissGroup";
            this.showAlertDlg = true;
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
            // console.log("fav state is ", state);
            if(state) {
                services.common.CollectGroup(this.groupId)
                    .then((ret) => {
                        console.log("CollectGroup ", ret);
                        this.$emit("updateChatGroupStatus", this.groupId, true, 'fav');
                    })
            }
            else {
                services.common.DeleteCollectionGroup(this.groupId)
                    .then((ret) => {
                        console.log("DeleteCollectionGroup ", ret);
                        this.$emit("updateChatGroupStatus", this.groupId, false, 'fav');
                    })
            }
        },
        getClassNameThroughMemberUid: function(memberUid) {
            return "member-img-class-" + memberUid;
        },
        getIdThroughMemberUid: function(memberUid) {
            return "member-img-id-" + memberUid;
        },
        getLabelIdThroughMemberUid: function(memberUid) {
            return "member-label-id-" + memberUid;
        },
        getDeleteIdThroughMemberUid: function(memberUid) {
            return "delete-member-id-" + memberUid;
        },
        getUidThroughElementId: function(elementId) {
            var uid = elementId.slice("member-img-id-".length, elementId.length);
            return uid;
        },
        getMemberImage: async function() {
            for(var i=0; i < this.memberListShow.length; i++) {
                var distUserInfo = this.memberListShow[i];
                // console.log("getMemberImage distuserinfo ", distUserInfo);
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
        updateCursorPosition: function(e) {
            // console.log("client x ", e.clientX)
            // console.log("client y ", e.clientY)
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
        }
    },
    async created () {
        // await services.common.init();
        // this.loginInfo = await services.common.GetLoginModel();
        // console.log("userinfo-tip login info is ", this.loginInfo);
        // this.curUserInfo = await services.common.GetSelfUserModel();
    },
    mounted() {
        setTimeout(() => {
            this.$nextTick(() => {
                ipcRenderer.on('updateGroupImg', this.updateGroupImg);
            })
        }, 0)
        document.addEventListener('click', this.updateCursorPosition);
    },
    watch: {
        showGroupInfoTips: function() {
            if (this.showGroupInfoTips) {
                this.getRoomNotifsState();
                this.mxGetMembers();
                console.log('----watch showGroupInfoTips----');
            }
        },
        showGroupInfo: async function() {
            if(this.wholeTipElement == null) {
                this.wholeTipElement = document.getElementById("groupInfoTipId");
                // console.log("this.wholeTipElement ", this.wholeTipElement)
            }
            console.log("this.showGroupInfo ", this.showGroupInfo)
            // console.log("this.wholeTipElement ", this.wholeTipElement)
            if(this.showGroupInfo.groupNotice == undefined || this.wholeTipElement == null) {
                return;
            }
            this.memberList = this.showGroupInfo.memberList;
            this.groupName = this.showGroupInfo.groupName;
            console.log('xxxxxx', this.showGroupInfo.groupName)
            this.groupAvarar = this.showGroupInfo.groupAvarar;
            this.groupNotice = this.showGroupInfo.groupNotice;
            this.groupId = this.showGroupInfo.groupId;
            this.isGroup = this.showGroupInfo.isGroup;
            this.slienceState = this.showGroupInfo.isSlience;
            this.groupTopState = this.showGroupInfo.isTop;
            this.groupFavouriteState = this.showGroupInfo.isFav;
            this.isOwner = this.showGroupInfo.isOwner //this.showGroupInfo.groupType == 101 ? this.showGroupInfo.isOwner : false;
            this.ownerId = this.showGroupInfo.ownerId;
            if(this.showGroupInfo.groupType == 102) {
                var ownerUserInfo = await UserInfo.GetUserInfo(this.ownerId);
                console.log("ownerUserInfo ", ownerUserInfo);
                if(ownerUserInfo != undefined) {
                    this.peopleState = ownerUserInfo.status_description;
                }
            }
            this.isSecret = this.showGroupInfo.isSecret;
            console.log("this.peopleState ", this.peopleState)
            // console.log("this.slienceState ", this.slienceState)
            var adddedMemberId = [];
            for(var i=0;i<this.memberList.length;i++) {
                let memberInfoTmp = await services.common.GetDistUserinfo(this.memberList[i]);
                if(memberInfoTmp.length != 0) {
                    this.memberListShow.push(memberInfoTmp[0]);
                    this.memberListShowOriginal.push(memberInfoTmp[0]);
                    adddedMemberId.push(this.memberList[i]);
                }
                if(i > 20) {
                    break;
                }
            }
            // console.log("watch memberListShow is ", this.memberListShow);
            this.wholeTipElement.style.right = "0px";
            this.wholeTipElement.style.top = "0px";

            let elementImg = document.getElementById("groupInfoImageId");
            console.log("elementImg is ", elementImg);
            var targetPath = "";
            if(fs.existsSync(targetPath = await services.common.downloadGroupAvatar(this.groupAvarar, this.groupId))){
                var showfu = new FileUtil(targetPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
            }
            // services.common.downloadGroupAvatar(this.groupAvarar, this.groupId);
            // .then((ret) => {
            //     elementImg.setAttribute("src", URL.createObjectURL(ret.data));
            //     elementImg.onload = () => {
            //         URL.revokeObjectURL(elementImg.getAttribute("src"))
            //     }
            // })
            console.log("this.groupNotice is ", this.groupNotice);
            if(this.groupNotice.length == 0) {
                this.groupNotice = ""
            }
            this.newGroupName = this.groupName;
            setTimeout(() => {
                this.$nextTick(() => {
                    this.getMemberImage();
                })
            }, 0)

            for(var i=0;i<this.memberList.length;i++) {
                let memberInfoTmp = await services.common.GetDistUserinfo(this.memberList[i]);
                if(memberInfoTmp.length != 0) {
                    if(adddedMemberId.indexOf(this.memberList[i]) == -1) {
                        this.memberListShow.push(memberInfoTmp[0]);
                        this.memberListShowOriginal.push(memberInfoTmp[0]);
                    }
                }
                if(i%20 == 0 && i != 0) {
                    setTimeout(() => {
                        this.$nextTick(() => {
                            this.getMemberImage();
                        })
                    }, 0)
                }
            }
            setTimeout(() => {
                this.$nextTick(() => {
                    this.getMemberImage();
                })
            }, 0)
        },
        cleanCache: function() {
            console.log("cleancache is ", this.cleanCache)
            if(this.cleanCache) {
                this.memberList = [];
                this.memberListShow = [];
                this.memberListShowOriginal = [];
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
        // updateNotice: function() {
        //     this.groupNotice = this.updateNotice;
        // },
    }
}
</script>

<style lang="scss" scoped>
  ::-webkit-scrollbar-track-piece {
    background-color: #F1F1F1;
    border-radius: 5px;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 12px;
  }

  ::-webkit-scrollbar-thumb {
    height: 50px;
    background-color: #C1C1C1;
    border-radius: 5px;
    outline: none;
  }

  ::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #A8A8A8;
    border-radius: 5px;
  }

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
    font-weight: 500;
    height: 56px;
    line-height: 56px;
    margin: 0 0 0 16px;
    font-family: PingFangSC-Medium;
    letter-spacing: 2px;
}

.groupMember-view {
    height: calc(100% - 348px);
    width: 100%;
    padding: 0px;
    border: 0px;
    background: rgba(255, 255, 255, 1);
    cursor: default;
    border-bottom: 1 solid rgba(221, 221, 221, 1);
}

.groupMember-view-owner {
    height: calc(100% - 440px);
    width: 100%;
    padding: 0px;
    border: 0px;
    background: rgba(255, 255, 255, 1);
    cursor: default;
    border-bottom: 1 solid rgba(221, 221, 221, 1);
}

.groupMember-list {
    height: 100%;
    list-style: none;
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
    border-radius:4px;
    cursor: pointer;
}

.groupMemberInfoLabel {
    display: inline-block;
    width: calc(100% - 68px);
    height: 48px;
    line-height: 48px;
    vertical-align: top;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    padding-left: 8px;
    cursor: pointer;
}

.groupMemberClickOut {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 20px;
    float: right;
    opacity: 0;
    cursor: pointer;
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
    border-radius:4px;
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
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing: 2px;
    font-size: 15px;
    white-space: nowrap;
    text-overflow: ellipsis;
    letter-spacing: 1px;
}

.groupInfoNameInput:disabled {
    width: calc(100% - 30px);
    border: 0px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    font-size: 15px;
    white-space: nowrap;
    text-overflow: ellipsis;
    background-color: white;
    letter-spacing: 1px;
}

.groupInfoNameInput:focus {
    width: calc(100% - 30px);
    border: 0px;
    outline: none;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    font-size: 15px;
    border: 0px;
    outline: none;
    letter-spacing: 1px;
}

.chat-name {
    display: inline-block;
    width: 100px;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.chat-desc {
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.groupInfoNameEdit {
    // width: 21px;
    // height: 21px;
    // float: right;
    // margin: 0px;
    // padding: 0px;
    margin-left: 8px;
    display: inline-block;
    width: 20px;
    height: 20px;
//     float: right;
    margin: 0px;
    padding: 0px;
    background-size: auto 100%;
    background-image: url("../../../static/Img/Chat/edit-20px@2x.png");
    background-repeat: no-repeat;
}

// .groupInfoNameEdit:hover {
//     width: 21px;
//     height: 21px;
//     float: right;
//     margin: 0px;
//     padding: 0px;
//     background-size: auto 100%;
//     background-image: url("../../../static/Img/Chat/edit-20px@2x.png");
//     background-repeat: no-repeat;
// }

.peopleInfo{
    width: 100%;
    display: inline-block;
}

.peopleInfoInput {
    width: calc(100% - 30px);
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: rgba(153, 153, 153, 1);
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    letter-spacing: 1px;
}

.peopleInfoInput:disabled {
    width: calc(100% - 30px);
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: rgba(103, 103, 103, 1);
    white-space: nowrap;
    text-overflow: ellipsis;
    background-color: white;
    cursor: pointer;
    letter-spacing: 1px;
}

.peopleInfoInput:focus {
    width: calc(100% - 30px);
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: rgba(103, 103, 103, 1);
    outline: none;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    letter-spacing: 1px;
}

.groupInfoNotice {
    width: 100%;
    display: inline-block;
}

.groupInfoNoticeInput {
    width: calc(100% - 30px);
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: rgba(153, 153, 153, 1);
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    letter-spacing: 1px;
}

.groupInfoNoticeInput:disabled {
    width: calc(100% - 30px);
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: rgba(103, 103, 103, 1);
    white-space: nowrap;
    text-overflow: ellipsis;
    background-color: white;
    cursor: pointer;
    letter-spacing: 1px;
}

.groupInfoNoticeInput:focus {
    width: calc(100% - 30px);
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: rgba(103, 103, 103, 1);
    outline: none;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    letter-spacing: 1px;
}

.groupInfoNoticeEdit {
    width: 20px;
    height: 20px;
    float: right;
    cursor: pointer;
}

.secretGroupDiv {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 16px;
    padding-right: 16px;
}

.secretTypeButton {
    display: inline-block;
    height: 48px;
    line-height: 48px;
    width: calc(100% - 168px);
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    vertical-align: top;
    color: rgba(51, 51, 51, 1);
}

.secretType {
    display: inline-block;
    height: 30px;
    text-indent: 5px;
    line-height: 30px;
    width: 132px;
    margin: 8px 10px 8px 10px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    vertical-align: top;
    background-repeat: no-repeat;
    background-position:center right;
    background-image: url("../../../static/Img/Chat/secretArrow-20px@2x.png");
    background-size: auto 60%;
    border: 1px solid rgba(211, 211, 211, 1);
    border-radius: 2px;
}

.secretTypeDropdownContent {
    display: none;
    position: absolute;
    background-color: rgba(0, 0, 0, 0);
    width: 132px;
    height: 30px;
    border-radius: 4px;
    box-shadow:0px 0px 12px 0px rgba(103,103,103,0.14);
    border:1px solid rgba(221,221,221,1);
}

.secretTypeDropdownContent div:hover {
    background-color: rgba(221, 221, 221, 1);
    cursor: pointer;
}

.secretTypeAuto {
    display: block;
    width: 132px;
    height: 30px;
}

.secretTypeAutoLabel {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: rgba(51, 51, 51, 1);
    font-family: 'PingFangSC-Regular';
    font-weight: 400;
    letter-spacing: 1px;
    vertical-align: top;
    background-color: rgba(0, 0, 0, 0);
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(51, 51, 51, 1);
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(51, 51, 51, 1);
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(51, 51, 51, 1);
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
    cursor: pointer;
}

.groupSettingOwnerTransferLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 68px);
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(51, 51, 51, 1);
}

.groupSettingOwnerTransferImage {
    padding-top: 14px;
    padding-bottom: 14px;
    height: 20px;
    width: 20px;
    float: right;
    cursor: pointer;
}

.groupMemberDiv {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 16px;
    padding-right: 16px;
}

.groupMemberSearchDiv {
    height: 48px;
    width: 100%;
}

.searchMemberInput {
    display: inline-block;
    height: 24px;
    line-height: 24px;
    margin-top: 12px;
    margin-bottom: 12px;
    width: calc(100% - 56px);
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(51, 51, 51, 1);
    padding: 0px;
    border: 1px solid rgb(221, 221, 221);
    border-radius: 2px;
}

.searchMemberInput:focus {
    display: inline-block;
    height: 24px;
    line-height: 24px;
    margin-top: 12px;
    margin-bottom: 12px;
    width: calc(100% - 56px);
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(51, 51, 51, 1);
    padding: 0px;
    border: 1px solid rgb(221, 221, 221);
    border-radius: 2px;
    outline: none;
}

.searchMemberCancel {
    display: inline-block;
    padding-right: 6px;
    margin: 0px;
    height: 48px;
    line-height: 48px;
    float: right;
    font-size: 14px;
    cursor: pointer;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(153, 153, 153, 1);
}

.searchMemberCancel:hover {
    display: inline-block;
    padding-right: 6px;
    margin: 0px;
    height: 48px;
    line-height: 48px;
    float: right;
    font-size: 14px;
    cursor: pointer;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(36, 179, 107, 1);
}

.groupMemberAddDiv {
    height: 48px;
}

.groupMemberAddDivLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 136px);
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(51, 51, 51, 1);
}

.groupMemberAddDivImage {
    padding-top: 14px;
    padding-bottom: 14px;
    padding-right: 6px;
    height: 20px;
    width: 20px;
    float: right;
    cursor: pointer;
}

.groupMemberSearchImage {
    padding-top: 14px;
    padding-bottom: 14px;
    padding-left: 6px;
    height: 20px;
    width: 20px;
    float: right;
    cursor: pointer;
}

.footer{
    position: absolute;
    left: 0px;
    bottom: 0px;
    width: 100%;
}

.groupLeave-view{
    height: 48px;
    padding: 0px;
    background: rgba(255, 255, 255, 1);
    border: 0px solid rgba(221, 221, 221, 1);
}

.groupLeaveDiv{
    height: 48px;
    line-height: 48px;
    width: 100%;
    border: 0px;
    padding: 0px;
    margin: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    color: red;
    text-align: center;
    cursor: pointer;
}

.groupLeaveDiv:hover{
    height: 48px;
    line-height: 48px;
    width: 100%;
    border: 0px;
    padding: 0px;
    margin: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    color: red;
    text-align: center;
    cursor: pointer;
    background: #F7F8FA;
}

.groupDismiss-view{
    height: 48px;
    padding: 0px;
    background: rgba(255, 255, 255, 1);
    border: 0px;
}

.groupDelete-view {
    height: 48px;
    padding: 0px;
    background: rgba(255, 255, 255, 1);
    border: 0px;
}

.groupDeleteDiv {
    height: 48px;
    line-height: 48px;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 0px;
    margin: 0px;
    width: 100%;
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    color: red;
    text-align: center;
    cursor: pointer;
}

.groupDeleteDiv:hover{
    height: 48px;
    line-height: 48px;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 0px;
    margin: 0px;
    width: 100%;
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    color: red;
    text-align: center;
    cursor: pointer;
    background: #F7F8FA;
}

.groupDismissDiv{
    height: 48px;
    line-height: 48px;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 0px;
    margin: 0px;
    width: 100%;
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    color: red;
    text-align: center;
    cursor: pointer;
}

.groupDismissDiv:hover{
    height: 48px;
    line-height: 48px;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 0px;
    margin: 0px;
    width: 100%;
    border: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 14px;
    color: red;
    text-align: center;
    cursor: pointer;
    background: #F7F8FA;
}
</style>