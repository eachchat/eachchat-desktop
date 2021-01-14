<template>
    <div class="groupInfo" id="groupInfoTipId" @click="closeOptionItem">
        <div class="groupInfoTitleDiv">
            <p class="groupInfoTitle">设置</p>
        </div>
        <div class="groupInfo-view">
            <div class="groupInfoImageDiv" v-if="!isDm">
                <input style="display:none;" id="mxavai" @change="_onAvatarChanged" type="file" accept="image/*">
                <img id="groupInfoImageId" class="groupInfoImage" :src="mxAvatar">
                <img 
                    id="groupInfoImageChangeId" 
                    class="groupInfoImageChange" 
                    src="../../../static/Img/Chat/updateHeadImg-24px@2x.png" 
                    @click="mxUploadAvatar" 
                    v-show="showGroupInfo.userLevel >= showGroupInfo.totalLevels.canAvatar">
            </div>
            <div v-else class="groupInfoImageDiv">
                <img 
                    id="groupInfoImageId" 
                    class="groupInfoImage" 
                    :src="mxAvatar">
            </div>
            <div class="groupInfoNoticeAndName" v-if="!isDm">
                <div class="groupInfoName">
                    <!-- <input class="groupInfoNameInput" id="groupInfoNameInputId" type="text" :disabled="!isOwner" v-model="newGroupName" @input="inputChanget($event)" @keyup="keyUpdateGroupName($event)" @mousemove="showNameEdit" @mouseout="hideNameEdit"/> -->
                    <div class="chat-name">{{groupName}}</div>
                    <p 
                        class="groupInfoNameEdit" 
                        id="groupInfoNameEditId" 
                        v-show="showGroupInfo.userLevel >= showGroupInfo.totalLevels.canName" 
                        @click.stop="changeChateInfo()"></p>
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
            <div class="groupInfoNoticeAndName" v-else>
                <div class="groupInfoName">
                    <!-- <input class="groupInfoNameInput" id="groupInfoNameInputId" type="text" :disabled="!isOwner" v-model="newGroupName" @input="inputChanget($event)" @keyup="keyUpdateGroupName($event)" @mousemove="showNameEdit" @mouseout="hideNameEdit"/> -->
                    <div class="chat-name">{{dmMember.dspName || dmMember.name}}</div>
                </div>
                <div class="chat-desc">{{dmMember.userId || ''}}</div>
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
        <div v-if="isDm" class="groupSettingSilenceDiv qsz" @click.stop="changeMxXxr()">
            <label class="groupSettingFavouriteLabelA">创建群聊</label>
            <img style="height:20px; width:20px" src="../../../static/Img/Main/yjt.png">
        </div>
        <div v-if="!isDm && showGroupInfo.userLevel>=100" class="groupSettingSilenceDiv qsz" @click.stop="openSetting()">
            <label class="groupSettingFavouriteLabelA">群聊设置</label>
            <img style="height:20px; width:20px" src="../../../static/Img/Main/yjt.png">
        </div>
        <!-- <div class="groupSettingSilenceDiv" v-if="isDm && showGroupInfo.userLevel >= showGroupInfo.totalLevels.canEncryption">
            <label class="groupSettingSlienceLabel">端到端加密</label>
            <el-switch 
                class="groupSettingSlienceSwitch" 
                v-model="mxEncryption" 
                @change="setMxEncryption"
                :active-color="'#24B36B'"
                :disabled="mxEncryption"
            >
            </el-switch>
        </div> -->
        <div class="groupSettingSilenceDiv"> <!--v-show="isGroup"-->
            <label class="groupSettingSlienceLabel">消息免打扰</label>
            <el-switch 
                class="groupSettingSlienceSwitch" 
                v-model="mxMute" 
                @change="mxMuteChange(mxMute)"
                :active-color="'#24B36B'"
            >
            </el-switch>
        </div>
        <div class="groupSettingFavouriteDiv" v-show="isGroup">
            <label class="groupSettingFavouriteLabel">置顶聊天</label>
            <el-switch 
                class="groupSettingFavouriteSwitch" 
                v-model="mxFavo" 
                @change="mxFavoChange(mxFavo)"
                :active-color="'#24B36B'"
            >
            </el-switch>
        </div>
        <!-- <div class="groupSettingTopDiv" v-show="!isSecret">
            <label class="groupSettingTopLabel">置顶聊天</label>
            <el-switch 
                class="groupSettingTopSwitch" 
                v-model="groupTopState" 
                @change="groupTopStateChange(groupTopState)"
                :active-color="'#24B36B'"
            >
            </el-switch>
        </div> -->
        <!-- <div class="groupSettingFavouriteDiv" v-show="isGroup">
            <label class="groupSettingFavouriteLabel">保存到收藏</label>
            <el-switch 
                class="groupSettingFavouriteSwitch" 
                v-model="groupFavouriteState" 
                @change="groupFavouriteStateChange(groupFavouriteState)"
                :active-color="'#24B36B'"
            >
            </el-switch>
        </div> -->
        <!-- <div class="groupSettingOwnerTransferDiv" v-show="isGroup && isOwner" @click="ownerTransfer">
            <label class="groupSettingOwnerTransferLabel">转让群主</label>
            <img id="groupSettingOwnerTransferImageId" class="groupSettingOwnerTransferImage" src="../../../static/Img/Chat/arrow-20px@2x.png">
        </div> -->
        <div class="groupMemberDiv" v-if="isGroup && !isDm">
            <div class="groupMemberSearchDiv" v-if="isSearch">
                <input 
                    type="text" 
                    class="searchMemberInput" 
                    v-model="memberFilter" 
                    @input="mxSearchMem"
                > <!--
                    v-model="searchKey" 
                    @input="searchMember"
                    -->
                <p class="searchMemberCancel" @click="closeSearchMem">取消</p> <!--@click="showAdd"-->
            </div>
            <div class="groupMemberAddDiv" v-else>
                <label class="groupMemberAddDivLabel">群成员</label>
                <img class="groupMemberSearchImage" src="../../../static/Img/Chat/search-20px@2x.png" @click="showSearch">
                <img 
                    id="groupMemberAddDivImageId" 
                    class="groupMemberAddDivImage" 
                    src="../../../static/Img/Chat/add-20px@2x.png" 
                    @click="mxAddMember"
                    v-if="showGroupInfo.isOwner"
                > <!--@click="showAddMembers"-->
            </div>
        </div>
        <div :class="groupListViewClassName()" v-if="isGroup && !isDm">
            <ul class="groupMember-list">
                <li v-for="(item, index) in mxMembers" class="memberItem"> <!--todo @mouseout="hideDeleteButton(item)" @mousemove="showDeleteButton(item)"-->
                    <!-- <div class="groupMemberInfoDiv">
                        <img :id="getIdThroughMemberUid(item.userId)" class="groupMemberInfoImage" @click="showUserInfoTip($event, item)" src="../../../static/Img/User/user-40px@2x.png">
                        <label :id="getLabelIdThroughMemberUid(item.userId)" class="groupMemberInfoLabel" @click="showUserInfoTip($event, item)">{{item.name}}</label>
                    </div> -->
                    <!-- <img class="groupMemberClickOut" :id="getDeleteIdThroughMemberUid(item.user_id)" src="../../../static/Img/Chat/delete-20px@2x.png" @click="deleteMember(item)" v-show="notOwner(item)"> -->
                    <div class="memberItemLeft">
                        <img :src="item.mxAvatar" class="memberItemAvatar" :id="getIdThroughMemberUid(item.userId)" @click="showUserInfoTip($event, item)"> <!--todo 头像需要更替-->
                        <div class="memberItemContent"  @click="showUserInfoTip($event, item)">
                            <div class="memberItemName">
                                <span>{{item.dspName}}</span>
                                <span v-if="item.powerLevel==100" class="adminBadge">管理者</span>
                                <span v-if="item.powerLevel==50" class="adminBadge">主持人</span>
                            </div>
                            <div class="memberItemMxId">{{item.userId}}</div>
                        </div>
                    </div>
                    <img 
                        src="../../../static/Img/Main/sandian.png" 
                        class="memberItemOptionsImg"
                        @click.self.stop="switchOption(index)"
                        v-if="currentUser.powerLevel > item.powerLevel"
                    >
                    <div class="memberItemOptions" v-show="item.choosen">
                        <div class="optionItem" @click.stop="setPowerLevel(item, 100, index)" v-if="currentUser.powerLevel > item.powerLevel && currentUser.powerLevel>=100">设为管理者</div>
                        <div class="optionItem" @click.stop="setPowerLevel(item, 50, index)" v-if="currentUser.powerLevel > item.powerLevel && currentUser.powerLevel>=50">设为主持人</div>
                        <div class="optionItem" @click.stop="setPowerLevel(item, 0, index)" v-if="currentUser.powerLevel > item.powerLevel && currentUser.powerLevel>=50">设为普通用户</div>
                        <div class="optionItem" @click.stop="kickMember(item, index)" v-if="currentUser.powerLevel > item.powerLevel && currentUser.powerLevel>=showGroupInfo.totalLevels.canKick">移除成员</div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="footer" v-if="!isDm">
            <div class="groupLeave-view"> <!--v-show="isGroup"-->
                <p class="groupLeaveDiv" @click.stop="mxLeaveRoom()"> <!--@click="leave()"-->
                    退出
                </p>
            </div>
            <!-- <div class="groupDismiss-view" v-show="isGroup && isOwner">
                <p class="groupDismissDiv" @click="dismiss()">
                    解散群聊
                </p>
            </div>
            <div class="groupDelete-view" v-show="!isGroup">
                <p class="groupDeleteDiv" @click="dismiss()">
                    删除聊天
                </p>
            </div> -->
        </div>
        <image-cropper v-if="showImageCropper" :groupId="groupId" :imageSource="selectImageSource" @closeCropperDlg="closeCropperDlg"></image-cropper>
        <AlertDlg :AlertContnts="alertContnets" :alertType="alertType" v-show="showAlertDlg" @closeAlertDlg="closeAlertDlg" @clearCache="clearCache"/>
        <encryWarn 
            v-if="encryptionWarning"
            @close="closeEncryWarn"
            :room="currentRoom"
        />
        <!-- <mxMemberSelectDlg 
            v-if="mxSelectMemberOpen" 
            @close="mxSelectMember"
            :roomId="showGroupInfo.groupId"
        >
        </mxMemberSelectDlg> -->
        <mxXxr 
            v-if="mxXxrOpen" 
            @close="changeMxXxr"
            :creDir="isDm"
            :dmMember="dmMember"
        >
        </mxXxr>
        <mxDmDlg
            v-if="mxSelectMemberOpen" 
            @close="mxSelectMember"
            :roomId="showGroupInfo.groupId"
        >
        </mxDmDlg>
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
import { UserInfo, Contact } from '../../packages/data/sqliteutil.js'
import AlertDlg from './alert-dlg.vue'
import encryWarn from './encryptionWarning.vue'
import { getRoomNotifsState, setRoomNotifsState, MUTE, ALL_MESSAGES } from "../../packages/data/RoomNotifs.js"
import mxMemberSelectDlg from './mxMemberSelectDlg.vue'
import mxXxr from './mxXxr.vue'
import mxDmDlg from './mxDmDlg.vue'
import {ComponentUtil} from '../script/component-util'

// export const ALL_MESSAGES_LOUD = 'all_messages_loud';
// export const ALL_MESSAGES = 'all_messages';
// export const MENTIONS_ONLY = 'mentions_only';
// export const MUTE = 'mute';
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
            mxMute: false,
            mxFavo: false,
            mxMembers: [],
            currentUser: undefined,
            dmRoomIdArr: [],
            isDm: true,
            mxEncryption: false,
            encryptionWarning: false,
            currentRoom: undefined,
            dmMember: {},
            mxSelectMemberOpen: false,
            memberFilter: '',
            mxAvatar: '',
            mxRoom: {},
            mxXxrOpen: false
        }
    },
    components: {
        imageCropper,
        AlertDlg,
        encryWarn,
        mxMemberSelectDlg,
        mxXxr,
        mxDmDlg
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
        async _onAvatarChanged(e) {
            console.log('-----_onAvatarChanged-----')
            const client = window.mxMatrixClientPeg.matrixClient;
            const room = this.showGroupInfo.room;
            const roomId = room.roomId;
            if (!e.target.files || !e.target.files.length) {
                // this.setState({
                //     avatarUrl: this.state.originalAvatarUrl,
                //     avatarFile: null,
                //     enableProfileSave: false,
                // });
                return;
            }
            const file = e.target.files[0];
            // const reader = new FileReader();
            // reader.onload = async (ev) => {
            //     // this.setState({
            //     //     avatarUrl: ev.target.result,
            //     //     avatarFile: file,
            //     //     enableProfileSave: true,
            //     // });
            //     console.log('---file', file)
            //     console.log('---file2', ev.target.result)
            //     const uri = await client.uploadContent(file);
            //     console.log('----uri----', uri);
            //     await client.sendStateEvent(roomId, 'm.room.avatar', {url: uri}, '');
            //     this.mxAvatar = client.mxcUrlToHttp(uri);
            // };
            // reader.readAsDataURL(file);
            console.log('---file', file)
            const uri = await client.uploadContent(file);
            console.log('----uri----', uri);
            await client.sendStateEvent(roomId, 'm.room.avatar', {url: uri}, '');
            this.mxAvatar = client.mxcUrlToHttp(uri);
        },

        mxUploadAvatar() {
            console.log('mxUploadAvatar')
            let input = document.getElementById("mxavai");
            input.click();
        },
        mxSearchMem(mf) {
            //mxMembers
            console.log('---mf---', mf)
            const client = window.mxMatrixClientPeg.matrixClient;
            const userId = client.getUserId();
            let query = this.memberFilter;
            let mxMembers = this.mxMembers
             if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(()=>{
                if (!query) return this.mxGetMembers(userId);
                let newMems = mxMembers.filter((m) => {
                    query = query.toLowerCase();
                    const matchesName = m.name.toLowerCase().indexOf(query) !== -1;
                    const matchesId = m.userId.toLowerCase().indexOf(query) !== -1;
                    if (matchesName || matchesId) {
                        return m;
                    }
                });
                this.mxMembers = [...newMems];
            },320)
        },
        closeSearchMem() {
            const client = window.mxMatrixClientPeg.matrixClient;
            const userId = client.getUserId();
            this.mxGetMembers(userId);
            this.isSearch = false;
        },
        mxSelectMember(close) {
            // if (close.data) this.$emit(close.handler, close.data);
            this.mxSelectMemberOpen = false;
        },
        mxAddMember() {
            this.mxSelectMemberOpen = true;
        },
        changeMxXxr(closeRight) {
            this.mxXxrOpen = !this.mxXxrOpen;   
            if (closeRight) this.$emit('closeGroupInfo');         
        },
        closeEncryWarn(mxEncryption) {
            this.encryptionWarning = false;
            if (mxEncryption) this.mxEncryption = true;
        },
        setMxEncryption() {
            console.log('----setMxEncryption----', this.mxEncryption)
            if (this.mxEncryption) {
                this.mxEncryption = !this.mxEncryption;
                this.encryptionWarning = true;
            }
        },
        kickMember(item, idx) {
            const client = window.mxMatrixClientPeg.matrixClient;
            const room = this.showGroupInfo.room;
            const roomId = room.roomId;
            const userId = item.userId;
            client.kick(roomId, userId, undefined).then(()=>{
                console.log("Kick success");
                // let mxMembers = this.mxMembers;
                // mxMembers.splice(idx, 1);
                // this.mxMembers = [...mxMembers];
            }).catch(()=>{alert('kick failed')})
        },
        _applyPowerChange(roomId, target, powerLevel, powerLevelEvent, idx) {
            console.log('----_applyPowerChange roomId-----', roomId)
            console.log('----_applyPowerChange powerLevelEvent-----', powerLevelEvent)
            const client = window.mxMatrixClientPeg.matrixClient;
            client.setPowerLevel(roomId, target, parseInt(powerLevel), powerLevelEvent).then(()=>{
                console.log('设置成功');
                this.closeOptionItem();
            }).catch(()=>{alert('设置失败')})
        },
        setPowerLevel(item, powerLevel, idx) {
            const room = this.showGroupInfo.room;
            console.log('----setPowerLevel room-----', room)
            const roomId = room.roomId;
            const target = item.userId;
            const powerLevelEvent = room.currentState.getStateEvents("m.room.power_levels", "");
            this._applyPowerChange(roomId, target, powerLevel, powerLevelEvent, idx);
        },
        closeOptionItem: function() {
            let mxMembers = this.mxMembers;
            mxMembers.forEach(m => m.choosen = false);
            this.mxMembers = [...mxMembers];
        },
        switchOption: function(idx) {
            let mxMembers = this.mxMembers;
            mxMembers.forEach(m => m.choosen = false);
            mxMembers[idx].choosen = true;
            this.mxMembers = [...mxMembers];
        },
        mxLeaveRoom: function() {
            console.log('----mxLeaveRoom----')
            if (!window.alertIsShow) {
                // 弹框模板有个 delete window.alertIsShow 是为了弹框关闭之后能再次显示
                console.log('----$warningDlg----')
                this.$emit("closeGroupInfo");
                const roomId = this.groupId;
                const client = window.mxMatrixClientPeg.matrixClient;
                const room = client.getRoom(roomId);
                const joinRules = room.currentState.getStateEvents('m.room.join_rules', '');
                const vtx = this;
                let warning = `确定要退出${room.name}吗？`
                if (joinRules) {
                    const rule = joinRules.getContent().join_rule;
                    if (rule !== "public") {
                        // warnings.push((
                        //     <span className="warning" key="non_public_warning">
                        //         {' '/* Whitespace, otherwise the sentences get smashed together */ }
                        //         { _t("This room is not public. You will not be able to rejoin without an invite.") }
                        //     </span>
                        // ));
                        warning += '  这个群组不是公开的，退出后无法直接加入';
                    }
                }
                vtx.$warningDlg({
                    title: `退出${room.name}`,
                    content: warning,
                    cancelBtn: true,
                    close () {
                        // 这里执行点击右上角需要做的事，默认执行关闭弹框
                    },
                    confirm () {
                        // 这里执行点击确定按钮需要做的事，默认执行关闭弹框
                        client.leave(roomId);
                    },
                    cancel () {
                        // 这里执行点击取消按钮需要做的事，默认执行关闭弹框
                    }
                })
                window.alertIsShow = true;
            }
        },
        changeChateInfo: function() {
            this.$emit('openChatInfoDlg')
        },
        openSetting: function() {
            this.$emit('openSetting')
        },
        async mxGetMembers(userId) {
            const roomId = this.showGroupInfo.groupId;
            const cli = window.mxMatrixClientPeg.matrixClient;
            const xie1 = cli.getRoom(roomId);
            const xie2 = cli.getRoomPushRule("global", roomId);
            const mxMembers = [];
            for(let key in xie1.currentState.members) {
                // let isAdmin = xie1.currentState.members[key].powerLevel == 100; 
                let o = xie1.currentState.members[key];
                o.dspName = await ComponentUtil.GetDisplayNameByMatrixID(o.userId);
                o.mxAvatar = (o.user && o.user.avatarUrl) ? cli.mxcUrlToHttp(o.user.avatarUrl) : './static/Img/User/user-40px@2x.png';
                let obj = {...o, choosen:false}
                if (obj.membership != 'leave') mxMembers.push(obj);
            }
            console.log('check xie1', xie1);
            console.log('全member', xie1.currentState.members);
            console.log('mxMembers', mxMembers);
            if (xie1.currentState.members[userId]) this.currentUser = xie1.currentState.members[userId];
            console.log('----mxMembers[userId]----', userId)
            this.mxMembers = [...mxMembers];
        },
        mxMuteChange: function(mxMute) {
            console.log('---mxMuteChange---', this.mxMute);
            const roomId = this.showGroupInfo.groupId;
            const newState = this.mxMute ? MUTE : ALL_MESSAGES;
            console.log('---newState---', newState);
            setRoomNotifsState(roomId, newState);
        },
        mxFavoChange(mxFavo) {
            const client = window.mxMatrixClientPeg.matrixClient;
            const roomId = this.showGroupInfo.groupId;
            if (this.mxFavo) {
                let metaData = {};
                client.setRoomTag(roomId, "m.favourite", metaData);
            } else {
                client.deleteRoomTag(roomId, "m.favourite");

            }
        },
        getRoomFavo(room) {
            if (room.tags['m.favourite']) {
                this.mxFavo = true;
            } else {
                this.mxFavo = false;
            }
        },
        getRoomNotifs: function(roomId) {
            const state = getRoomNotifsState(roomId);
            this.mxMute = state == MUTE;
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
            // this.$emit("closeGroupInfo");
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
            var uid = item.userId;

            if(distElement == undefined) {
                distElement = document.getElementById(this.getLabelIdThroughMemberUid(uid));
            }

            var curAbsoluteTop = distElement.offsetTop;
            var curAbsoluteLeft = distElement.offsetLeft;

            let userInfo = {
                matrix_id: uid
            }
            var tipInfos = {
                "userInfo": userInfo,
                // "absoluteTop": curAbsoluteTop + wholeWinTop,
                "absoluteTop": this.cursorY,
                // "absoluteLeft": curAbsoluteLeft + wholeWinLeft,
                "absoluteLeft": this.cursorX - 330,
                "isMine": false,
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
            this.mxMembers.forEach(async (item)=>{
                var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(item.userId);
                if(!item)
                    return;
                var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
                if(avaterUrl == '')
                    return;
                var distElement = document.getElementById(this.getIdThroughMemberUid(item.userId));
                if(!distElement)
                    return;
                distElement.setAttribute("src", avaterUrl);
            })

            for(var i=0; i < this.memberListShow.length; i++) {
                var distUserInfo = this.memberListShow[i];
                var targetPath = '';
                if(fs.existsSync(targetPath = await services.common.downloadUserTAvatar(distUserInfo.avatar_t_url, distUserInfo.user_id))){
                    
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
    // created() {
        // this.loginInfo = await services.common.GetLoginModel();
        // console.log("userinfo-tip login info is ", this.loginInfo);
        // this.curUserInfo = await services.common.GetSelfUserModel();

    // },
    destroyed() {
        
    },
    async created() {
        const roomId = this.showGroupInfo.groupId;
        const client = window.mxMatrixClientPeg.matrixClient;
        const userId = client.getUserId();
        const vtx = this;
        const mDirectEvent = global.mxMatrixClientPeg.matrixClient.getAccountData('m.direct');
        let dmRoomMap = {};
        if (mDirectEvent !== undefined) dmRoomMap = mDirectEvent.getContent();
        console.log('Room js intent check', mDirectEvent)
        console.log('----dmRoomMap----', dmRoomMap)
        console.log('----chat----', this.showGroupInfo.room)
        let currentRoom = this.showGroupInfo.room;
        let mxEncryption = client.isRoomEncrypted(roomId);
        console.log('----mxEncryption----', mxEncryption);
        this.mxEncryption = mxEncryption;
        this.currentRoom = currentRoom;
        let dmRoomIdArr = [];
        Object.keys(dmRoomMap).forEach(k=>{
            let arr = dmRoomMap[k];
            arr.forEach(a=>dmRoomIdArr.push(a))
        })
        let room = global.mxMatrixClientPeg.matrixClient.getRoom(roomId);
        // let numCount = room.getInvitedAndJoinedMemberCount(); todo
        if (dmRoomIdArr.includes(roomId)) {
            this.isDm = true;
            console.log('这是一个单聊', currentRoom);
            console.log('room===', room);
            let dmMember
            Object.keys(currentRoom.currentState.members).forEach(id => {
                if (id != userId) {
                    dmMember = currentRoom.currentState.members[id];
                    console.log( 'dmMember', dmMember)
                    console.log( 'dmMember.user', dmMember.user)
                }
            })
            if (dmMember) {
                if (!dmMember.user) dmMember.user = {};
                // dmMember.avatar = global.mxMatrixClientPeg.getRoomAvatar(room);
                dmMember.dspName = await ComponentUtil.GetDisplayNameByMatrixID(dmMember.userId);
                let xieUser = client.getUser(dmMember.userId)
                console.log( '----xie user----', xieUser)
                
                this.dmMember = {...dmMember};
            }
        } else {this.isDm = false;}
        this.dmRoomIdArr = [...dmRoomIdArr];
        this.getRoomNotifs(roomId);
        this.getRoomFavo(room);
        this.mxGetMembers(userId); //this.currentUser 是在该方法中赋值的


        this.mxRoom = this.showGroupInfo.room;
        const avatarEvent = this.mxRoom.currentState.getStateEvents("m.room.avatar", "");
        let avatarUrl = avatarEvent && avatarEvent.getContent() ? avatarEvent.getContent()["url"] : null;

        
        if (avatarUrl) {
            this.mxAvatar = client.mxcUrlToHttp(avatarUrl);
        } else {
            this.mxAvatar = this.isDm ? ((this.dmMember.user && this.dmMember.user.avatarUrl) ? client.mxcUrlToHttp(this.dmMember.user.avatarUrl) : './static/Img/User/user-40px@2x.png') : './static/Img/User/group-40px@2x.png';
        }

        console.log('----mxRoom----', this.mxRoom);
        console.log('----dmMember----', this.dmMember);

        client.on("RoomMember.powerLevel", (event, member) => {
            console.log('ppppwooooooo', member)
            // this.mxGetMembers(userId);
            // let mxMembers = this.mxMembers;
            // mxMembers = mxMembers.map(m => {
            //     if (m.userId == member.userId) {
            //         return member;
            //     }
            //     return m;
            // })
            // this.mxMembers = [...mxMembers];
            this.mxGetMembers(userId);
        });

        // client.on('RoomState.newMember', (event, state, member) => {
        //     console.log('???+++___', event)
        //     // this.mxGetMembers(userId);
        //     let mxMembers = this.mxMembers;
        //     mxMembers.push(member);
        //     this.mxMembers = [...mxMembers];
        // })

        client.on('RoomMember.membership', (event, state, member) => {
            console.log('???+++___', event);
            this.mxGetMembers(userId);
        })

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
        document.addEventListener('click', this.updateCursorPosition);

        // this.$nextTick(()=>{
        //     this.getMemberImage();
        // })
        
    },
    watch: {
        // showGroupInfoTips: function() {
        //     console.log('----watch showGroupInfoTips----', showGroupInfoTips);
        //     if (this.showGroupInfoTips) {
        //         this.getRoomNotifsState();
        //         this.mxGetMembers();
        //     }
        // },
        // showGroupInfo: {
        //     handler: async function() {
        //         if(this.wholeTipElement == null) {
        //             this.wholeTipElement = document.getElementById("groupInfoTipId");
        //             // console.log("this.wholeTipElement ", this.wholeTipElement)
        //         }
        //         console.log("this.showGroupInfo ", this.showGroupInfo)
        //         // console.log("this.wholeTipElement ", this.wholeTipElement)
        //         if(this.showGroupInfo.groupNotice == undefined || this.wholeTipElement == null) {
        //             return;
        //         }
        //         this.memberList = this.showGroupInfo.memberList;
        //         this.groupName = this.showGroupInfo.groupName;
        //         console.log('xxxxxx', this.showGroupInfo.groupName)
        //         this.groupAvarar = this.showGroupInfo.groupAvarar;
        //         this.groupNotice = this.showGroupInfo.groupNotice;
        //         this.groupId = this.showGroupInfo.groupId;
        //         this.isGroup = this.showGroupInfo.isGroup;
        //         this.slienceState = this.showGroupInfo.isSlience;
        //         this.groupTopState = this.showGroupInfo.isTop;
        //         this.groupFavouriteState = this.showGroupInfo.isFav;
        //         this.isOwner = this.showGroupInfo.isOwner //this.showGroupInfo.groupType == 101 ? this.showGroupInfo.isOwner : false;
        //         this.ownerId = this.showGroupInfo.ownerId;
        //         if(this.showGroupInfo.groupType == 102) {
        //             var ownerUserInfo = await UserInfo.GetUserInfo(this.ownerId);
        //             console.log("ownerUserInfo ", ownerUserInfo);
        //             if(ownerUserInfo != undefined) {
        //                 this.peopleState = ownerUserInfo.status_description;
        //             }
        //         }
        //         this.isSecret = this.showGroupInfo.isSecret;
        //         console.log("this.peopleState ", this.peopleState)
        //         // console.log("this.slienceState ", this.slienceState)
        //         var adddedMemberId = [];
        //         this.memberList.forEach(async (item)=>{
        //             let res = await Contact.GetContactInfo(item);
        //             if(!res)
        //                 res = await UserInfo.GetContactInfo(item);
        //             this.memberListShow.push(res);
        //             this.memberListShowOriginal.push(res)
        //         })
                
        //         // console.log("watch memberListShow is ", this.memberListShow);
        //         this.wholeTipElement.style.right = "0px";
        //         this.wholeTipElement.style.top = "0px";

        //         let elementImg = document.getElementById("groupInfoImageId");
        //         elementImg.setAttribute("src", this.groupAvarar);

        //         console.log("this.groupNotice is ", this.groupNotice);
        //         if(this.groupNotice.length == 0) {
        //             this.groupNotice = ""
        //         }
        //         this.newGroupName = this.groupName;
        //         setTimeout(() => {
        //             this.$nextTick(() => {
        //                 this.getMemberImage();
        //             })
        //         }, 0)
        //     },
        //     immediate: true
        // },
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

.qsz {
    display: flex; 
    align-items: center; 
    justify-content: space-between;
    cursor: pointer;
}  

.adminBadge {
    width: 46px;
    height: 16px;
    background: #24B36B;
    border-radius: 8px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    margin-left: 4px;
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
    top: 0;
    right: 0;
    z-index: 3;
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
    letter-spacing: 0px;
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
    height: calc(100% - 340px);
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}

.memberItemLeft {
    display: flex;
    align-items: center;
    flex:1;
}

.memberItemAvatar {
    height: 32px;
    width: 32px;
    flex-shrink: 0;
    border-radius: 50%;
}

.memberItemContent {
    height: 38px;
    flex:1;
    margin-left: 4px;
}

.memberItemName {
    color: #000000;
    font-size: 14px;
    display: flex;
    align-items: center;
}

.memberItemMxId {
    height: 18px;
    color: #999999;
    font-size: 12px;
}

.memberItemOptionsImg {
    height: 20px;
    width: 20px;
    flex-shrink: 0;
    cursor: pointer;
}


.memberItemOptions{
    position: absolute;
    width: 100px;
    // height: 96px;
    background: #FFFFFF;
    box-shadow: 0px 0px 12px 0px rgba(103, 103, 103, 0.14);
    border-radius: 4px;
    border: 1px solid #DDDDDD;
    top: 32px;
    right: 16px;
    z-index: 1;
}

.optionItem {
    background:transparent;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #333;
    cursor: pointer;
}

.optionItem:hover {
    background: #A7E0C4;
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
    letter-spacing: 0px;
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
    border-radius: 50%;
}

.groupInfoImageChange {
    width: 24px;
    height: 24px;
    position: absolute;
    bottom: 0px;
    right: 0px;
    cursor: pointer;
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
    letter-spacing: 0px;
    font-size: 15px;
    white-space: nowrap;
    text-overflow: ellipsis;
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
}

.chat-name {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 132px;
    height: 22px;
    font-size: 15px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 22px;
}

.chat-desc {
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 18px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #999999;
    line-height: 18px;
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
    cursor: pointer;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
    vertical-align: top;
    background-color: rgba(0, 0, 0, 0);
}

.groupSettingSilenceDiv {
    background: rgba(255, 255, 255, 1);
    height: 48px;
    padding-top: 0px;
    padding-bottom: 0px;
    margin-left: 16px;
    margin-right: 16px;
    border-bottom: 1px solid #EEEEEE;
    box-sizing: border-box;
}

.groupSettingSlienceLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 68px);
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    margin-left: 16px;
    margin-right: 16px;
    border-bottom: 1px solid #EEEEEE;
    box-sizing: border-box;
}

.groupSettingFavouriteLabel {
    height: 48px;
    line-height: 48px;
    width: calc(100% - 68px);
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 0px;
    color: rgba(51, 51, 51, 1);
}

.groupSettingFavouriteLabelA {
    height: 48px;
    line-height: 48px;
    // width: calc(100% - 68px);
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
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
    letter-spacing: 0px;
    font-size: 14px;
    color: red;
    text-align: center;
    cursor: pointer;
    background: #F7F8FA;
}
</style>