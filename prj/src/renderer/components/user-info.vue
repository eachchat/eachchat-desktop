
<template>
    <div class="userInfo-view" :style="pagePosition">
        <div class="userInfoBaseInfo-view">
            <div class="userInfo-iconDiv">
                <img ondragstart="return false" class = 'userInfo-icon' src="../../../static/Img/User/user-40px@2x.png" :id="getUserInfoIconID(userInfo.matrix_id)" onerror = "this.src = './static/Img/User/user-40px@2x.png'" @click="userImageShow()">
                <div class = 'userInfo-changeIcon' @click="personalCenterIconClicked()" v-show = 'showChangeIcon'>
                    <img ondragstart="return false" class="userInfo-cameraIcon" src="../../../static/Img/personalCenter/changeAvatar-24px@2x.png">
                </div>
            </div>
            
            
            <div class="userInfo-baseInfo">
                <p class="userInfo-name">{{ GetDisplayName(userInfo.displayName, userInfo.matrix_id) }}</p>
                <p @contextmenu.prevent="openMenu" class="userInfo-title">{{ userInfo.matrix_id }}</p>
            </div>
        </div>
        <div class="userInfoAction-view" v-show="!isOwn">
            <!-- <img ondragstart="return false" class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img ondragstart="return false" class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png"> -->
            <img v-show = "bShowChatIcon"
                ondragstart="return false"
                src="../../../static/Img/Organization/UserInfo/userInfoChat_icon@2x.png" 
                @click="createDm" 
            >  <!--click jumpToChat-->
            <img ondragstart="return false" v-if = "bShowSaveContact" src="../../../static/Img/Organization/UserInfo/addToConact_32px@2x.png" @click="SaveContact" id = 'user-info-save'>
            <img ondragstart="return false" v-else src="../../../static/Img/Organization/UserInfo/inContact_32px@2x.png">
        </div>
        <div class="userInfoState-view" >
            <ul class="userInfoState-list">
                <li>
                    <p class="userInfo-key">用户名</p>
                    <input readonly = true class="userInfo-value" v-model="userInfo.userName">
                </li>
                <li v-if="userType == 'contact' || userType == 'mainUserInfo'" >
                    <p class="userInfo-key">备注</p>
                    <input :readonly = 'nameEdit' class="userInfo-value" v-model="userInfo.displayName" placeholder="输入昵称">
                </li>
                <li v-if="showPhone">
                    <p class="userInfo-key">手机</p>
                    <input :readonly = 'inputEdit' class="userInfo-phone-value" v-model="userInfo.phone.mobile" placeholder="输入手机号">
                </li>
                <li v-if="showTelephone">
                    <p class="userInfo-key">座机</p>
                    <input :readonly = 'inputEdit' class="userInfo-phone-value" v-model="userInfo.phone.work" placeholder="输入座机号">
                </li>
                <li v-if="showEmail">
                    <p class="userInfo-key">邮箱</p>
                    <input :readonly = 'inputEdit' class="userInfo-email-value" v-model="userInfo.email[0].email_value" placeholder="输入邮箱">
                </li>
                <li v-if="showStatusDescription">
                    <p class="userInfo-key">个人状态</p>
                    <input :readonly = 'inputEdit' class="userInfo-value" v-model="userInfo.statusDescription">
                </li>
                <li v-if="showWorkDescription">
                    <p class="userInfo-key">工作描述</p>
                    <input :readonly = 'inputEdit' class="userInfo-value" v-model="userInfo.workDescription">
                </li>
                <li v-if="showRelation">
                    <p class="userInfo-key">汇报关系</p>
                    <p class="userInfo-report-value" @click="reportRelationClicked()">查看</p>
                </li>
               <li v-if="showDepartment">
                    <p class="userInfo-key">部门</p>
                    <input :readonly = 'inputEdit' class="userInfo-value" v-model="userInfo.department.display_name"  placeholder="输入部门名称">
                </li>
                <li v-if="showCompany">
                    <p class="userInfo-key">公司</p>
                    <input :readonly = 'inputEdit' class="userInfo-value" v-model="userInfo.company"  placeholder="输入公司名称">
                </li>
                <li>
                    <p class="userInfo-key">职位</p>
                    <input :readonly = 'inputEdit' class="userInfo-email-value" v-model="userInfo.title" placeholder="输入职位名称">
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import {Contact} from '../../packages/data/sqliteutil.js'
import confservice from '../../packages/data/conf_service.js'
import {ComponentUtil} from '../script/component-util.js'
import DMRoomMap from '../../packages/data/DMRoomMap.js'
import * as Rooms from "../../packages/data/Rooms"
import * as RoomUtil from '../script/room-util'
import * as utils from '../../packages/core/Utils.js'
import { openRemoteMenu } from '../../utils/commonFuncs'

export default {
    name: 'user-info',
    data() {
        return {
            bShowChatIcon: true,
            bShowSaveContact: false,
            pagePosition: {},
            inputEdit: true,
            nameEdit: true,
            services: null,
            data: false,
            showChangeIcon: false
        }
    },
    props: {
        userInfo: {
            type:Object,
            default:function () {
                return {};
            }
        },
        originPosition:{
            type: Object,
            default:function () {
                return {};
            }
        },
        isOwn: {
            type: Boolean,
            default: false
        },

        userType:{
            type: String,
            default: "organise"
        }
    },
    watch:{
        userInfo: function(){
            console.log(this.userInfo)
        }
    },

    computed: {
        showStatusDescription: function() {
            if(this.userType == 'contact')
                return false;
            if (this.userInfo == undefined){
                return false;
            }
            return !this.isEmpty(this.userInfo.statusDescription);
        },
        showWorkDescription: function() {
            if(this.userType == 'contact')
                return false;
            if (this.userInfo == undefined){
                return false;
            }
            return !this.isEmpty(this.userInfo.workDescription);
        },
        showPhone: function() {
            if(this.userType == 'contact')
                return true;
            if (this.userInfo.phone == undefined){
                return false;
            }
            return !this.isEmpty(this.userInfo.phone.mobile);
        },
        showTelephone: function (){
            if(this.userType == 'contact')
                return true;
            if (this.userInfo.phone == undefined){
                return false;
            }
            return !this.isEmpty(this.userInfo.phone.work);
        },
        showEmail: function() {
            if(this.userType == 'contact')
                return true;
            if (this.userInfo.email == undefined){
                return false;
            }
            return this.userInfo.email.length > 0 && this.userInfo.email[0].email_value.length != 0;
        },
        showDepartment: function() {
            if(this.userType == 'contact')
                return false;
            if (this.userInfo == undefined){
                return false;
            }
            if(this.userInfo.department != undefined && this.userInfo.department.display_name){
                return true;
            }
            return false;
        },
        showCompany: function(){
            if(this.userType == 'contact')
                return true;
            if (this.userInfo == undefined){
                return false;
            }
            if(this.userInfo.company != undefined && this.userInfo.company){
                return true;
            }
            return false;
        },
        
        showRelation: function() {
            if (this.userInfo == undefined || this.userType == "mainUserInfo"){
                return false;
            }
            return !this.isEmpty(this.userInfo.managerId);
        }
    },
    methods: {
        openMenu() {
            openRemoteMenu()
        },
        nHandleFiles:async function(e, paths) {
            // Select Same File Failed.
            var fileList = paths;
            // console.log("======", fileList)
            if(fileList.filePaths.length === 0) {
                alert("请选择一个图片文件");
            }
            //this.showImageCropper = true;
            this.selectImageSource = fileList.filePaths[0];
            var showfu = new utils.FileUtil(this.selectImageSource);
            var stream = showfu.ReadfileSync(this.selectImageSource);
            let uploadFile = showfu.GetUploadfileobj();
            let matrixClient = global.mxMatrixClientPeg.matrixClient;
            const httpPromise = matrixClient.uploadContent(uploadFile).then((url)=> {
                    var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(url);
                    let userIconElement = document.getElementById(this.getUserInfoIconID(this.userInfo.matrix_id));
                    if(avaterUrl != '') {
                        userIconElement.setAttribute("src", avaterUrl);
                    }
                    matrixClient.setAvatarUrl(url);
                    var elementImg = document.getElementById("userHead");
                    elementImg.setAttribute("src", avaterUrl);

                    elementImg = document.getElementsByClassName('personalCenter-icon')[0];
                    if(elementImg)
                        elementImg.setAttribute("src", avaterUrl);
            });       
        },

        async userImageShow() {
            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(this.userInfo.matrix_id);
            var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
            const ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.send('showPersonalImageViewWindow', avaterUrl);
        },

        personalCenterIconClicked(){
            const ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.send('open-image-dialog-avatar', 'openFile');
            ipcRenderer.on('selectedAvatarImageItem', this.nHandleFiles);
            
        },

        async ControlShowElement(){
            let matrix_id = "";
            let userID = localStorage.getItem("mx_user_id");
            if(this.userInfo && this.userInfo.matrix_id){
                matrix_id = this.userInfo.matrix_id;
                if(matrix_id == userID)
                    this.bShowChatIcon = false;
                else
                    this.bShowChatIcon = true;

                let conctacts = await Contact.GetContactInfo(matrix_id);
                if(conctacts)
                    this.bShowSaveContact = false;
                else
                    this.bShowSaveContact = true;
            }
            
        },

        SaveContact: async function(){
            if(this.userType === "organise"){
                let contact = await ComponentUtil.OrgUserInfoToContact(this.userInfo);
                await this.services.AddContact(contact);
            }
            this.bShowSaveContact = false;
            console.log("save ", this.userInfo)
        },

        createRoom: function(opts) {
            return RoomUtil.CreateRoom(opts).then((res) => {
                console.log('--create success!!--', res);
                let roomId = res.room_id;
                if(roomId)
                    Rooms.setDMRoom(roomId, opts.dmUserId);
                const obj = {data: res, handler: 'viewRoom'};
                this.$emit('close', obj);
                if(res && res.room_id)
                    this.jumpToChat(res.room_id);
            })
        },
        createDm: function() {
            if (this.loading) return;
            // if (!this.choosenMembers || !this.choosenMembers) return;
            this.loading = true;
            const client = window.mxMatrixClientPeg.matrixClient;
            console.log('-----this.userInfo----', this.userInfo)
            const targetIds = [this.userInfo.matrix_id];
            const existingRoom = DMRoomMap.shared().getDMRoomForIdentifiers(targetIds);
            console.log('------existingRoom------', existingRoom);
            
            if (existingRoom) {
                let roomMember = existingRoom.getInvitedAndJoinedMemberCount();
                console.log("roomMember ", roomMember)
                existingRoom.room_id = existingRoom.roomId
                const obj = {data: existingRoom, handler: 'viewRoom'};
                this.$emit('close', obj);
                this.jumpToChat(existingRoom.room_id);
                return;
            }

            const createRoomOptions = {inlineErrors: true};
            //TODO 加密处理

            let createRoomPromise = Promise.resolve();
            const isSelf = targetIds.length === 1 && targetIds[0] === client.getUserId();
            if (targetIds.length === 1 && !isSelf) {
                createRoomOptions.dmUserId = targetIds[0];
                createRoomPromise = this.createRoom(createRoomOptions);
            } else if (isSelf) {
                createRoomPromise = this.createRoom(createRoomOptions);
            } else {
                console.log('后续增加更多人选');
                //TODO
                // // Create a boring room and try to invite the targets manually.
                // createRoomPromise = createRoom(createRoomOptions).then(roomId => {
                //     return inviteMultipleToRoom(roomId, targetIds);
                // }).then(result => {
                //     if (this._shouldAbortAfterInviteError(result)) {
                //         return true; // abort
                //     }
                // });
            }
        },
        GetDisplayName: function(displayName, userid){
            return ComponentUtil.GetDisplayName(displayName, userid);
        },

        jumpToChat: async function(roomId) {
            if(this.$route.name == "organization" || this.$route.name == "favourite") {
                this.$router.push(
                    {
                        name: 'ChatContent', 
                        params: {
                            group_id: roomId
                        }
                    })
            }
            else {
                console.log("*** jump to exist room")
                this.$emit('JumpToDistRoom', roomId);
            }
            this.dialogVisible = false;
        },
        isEmpty(obj){
            if(typeof obj == "undefined" || obj == null || obj == ""){
                return true;
            }else{
                return false;
            }
        },
        userChatButtonClicked() {
        },
        userAudioButtonClicked() {

        },
        userVideoButtonClicked() {

        },
        reportRelationClicked:async function() {
            let leaders = this.userInfo.leaders;
            let proArray = [];
            for(let item of leaders){
                let matrixID = item.matrix_id;
                proArray.push(global.mxMatrixClientPeg.matrixClient.getProfileInfo(matrixID))
            }
            Promise.all(proArray).then(urls => {
                for(let index in leaders){
                    leaders[index].user_avatar_url = this.matrixClient.mxcUrlToHttp(urls[index].avatar_url);
                }
                const ipcRender = require('electron').ipcRenderer;
                ipcRender.send('showReportRelationWindow', this.userInfo);
            })
            

        },
        getPageHeight(){
            var total = 210;
            var count = 2;

            if(this.showRelation){
                count ++;
            }
            if(this.showDepartment){
                count ++;
            }
            if(this.showCompany){
                count++;
            }
            if(this.showPhone){
                count ++;
            }
            if(this.showTelephone){
                count ++;
            }
            if(this.showEmail){
                count ++;
            }
            return total + count * 36;
        },
        getUserImg: async function (userInfo){
            if(!userInfo.matrix_id)
                return;
            let userIconElement = document.getElementById(this.getUserInfoIconID(userInfo.matrix_id));
            if(!userIconElement)
                return;
            try{
                var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(userInfo.matrix_id);
                if(!profileInfo.avatar_url)
                    return;
                let validUrl = this.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
                userIconElement.setAttribute("src", validUrl);
            }catch(e){
                console.log(e)
            }
            
            
        },
        getUserInfoIconID(id){
            return "userInfo" + id;
        }
    },

    created () {
        console.log('-----userInfo------', this.userInfo)
        this.originDisplayName = this.userInfo.displayName;
        this.services = global.services.common;
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;

        if(this.userType == 'contact'){
            this.inputEdit = false;
            this.nameEdit = false;
        }
        else if(this.userType == 'mainUserInfo' ){
            this.inputEdit = true;
            this.nameEdit = false;
        }
        else{
            this.inputEdit = true;
            this.nameEdit = true;
        }
        var pageWidth = 280;
        var pageHeight = this.getPageHeight();
        var showScreenHeight = document.documentElement.clientHeight;
        var showScreenWidth = document.documentElement.clientWidth;
        var topPosition = this.originPosition.top + 20 - (pageHeight / 2);
        if( topPosition < 20) {
            topPosition = 20;
        }
        if((pageHeight + topPosition + 40) > showScreenHeight){
            topPosition = showScreenHeight - pageHeight - 20;
        }
        if(this.originPosition.left + 45 + pageWidth > showScreenWidth){
            this.originPosition.left = this.originPosition.left - pageWidth - 17;
        }else{
            this.originPosition.left += 45;
        }
        
        
        this.pagePosition.left = this.originPosition.left.toString() + "px";
        this.pagePosition.top = topPosition.toString() + "px";
        if(this.userType == 'mainUserInfo'){
            this.pagePosition.left = "364px";
            this.pagePosition.top = "32px";
            this.showChangeIcon = true;
        }
        this.ControlShowElement();
        this.$nextTick(function(){
            this.getUserImg(this.userInfo);
        });
    },

    destroyed(){
        if(this.userType == 'contact')
        {
            this.services.UpdateContact(this.userInfo.matrix_id,
                                        this.userInfo.displayName,
                                        this.userInfo.email[0].email_value,
                                        this.userInfo.phone.mobile,
                                        this.userInfo.phone.work,
                                        this.userInfo.company,
                                        this.userInfo.title);
        }
        if(this.userType == 'mainUserInfo')
        {
            if(this.originDisplayName != this.userInfo.displayName)
                global.mxMatrixClientPeg.matrixClient.setDisplayName(this.userInfo.displayName)
        }
    }
}
</script>
<style lang="scss" scoped>
.userInfo-view {
    height: auto;
    width: 280px;
    padding: 0px;
    border: 1px solid rgb(242, 242, 246);
    box-shadow:0px 0px 30px 0px rgba(103,103,103,0.24);
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    position: absolute;
    cursor: default;
    z-index: 3;
}
.userInfoBaseInfo-view {
    height: 128px;
    margin: 0px;
}

.userInfo-iconDiv{
    padding: 0px;
    margin: 0px;
    display: inline-block;
    //border-radius: 50%;
    width: 48px;
    height: 48px; 
    margin-top: 20px;
    margin-left: 116px;
    margin-bottom: 0px;

    .userInfo-icon {
        width: 48px;
        height: 48px;
        position: absolute;
        border-radius: 4px;
        border-radius: 50%;
        display: inline-block;
        cursor: pointer;   
    }
    .userInfo-changeIcon{
        display: none;
        width: 48px;
        height: 48px;
        position: absolute;
        border-radius: 4px;
        z-index: 3;
        background-color: rgba(0,0,0,0.4);;
        .userInfo-cameraIcon{
            width: 24px;
            height: 24px;
            position: absolute;
            left: 12px;
            top: 12px;
        }
    }
}



.userInfo-iconDiv:hover{
    .userInfo-changeIcon{
        display: inline-block;
    }
}




.userInfo-baseInfo {
    height: 60px;
    width: 100%;
}
.userInfo-name {
    height: 22px;
    margin: 0px;
    margin-top: 16px;
    margin-bottom: 4px;
    width: 100%;
    text-align: center;
    font-size: 16px;
    font-weight:500;
    color:rgba(0,0,0,1);
    line-height:22px;
    letter-spacing: 0px;
    font-family: PingFangSC-Medium;
}
.userInfo-title {
    width: 100%;
    height: 18px;
    margin: 0px;
    font-weight: 400;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0px;
    color: rgb(153, 153, 153);
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    font-family: PingFangSC-Regular;
}
.userInfoAction-view {
    height: 48px;
    width: 100%;
    margin: 0px;
	text-align: center;
}

.userInfoAction-view img{
    margin-top: 8px;
    height: 32px;
    width: 32px;
}

.userInfoAudioIcon {
    height: 28px;
    width: 28px;
    margin-top: 13px;
    margin-left: 0px;
}
.userInfoVideoIcon {
    height: 28px;
    width: 28px;
    margin-top: 13px;
    margin-left: 14px;
}
.userInfoChatIcon {
    height: 32px;
    width: 32px;
    //margin: auto;
    margin-left: 10px;
    margin-right: 10px;
}

.userInfoState-view {
    width: calc(100% - 40px);
    margin-left: 20px;
    margin-bottom: 12px;
}
.userInfoState-list {
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;

}
.li {
    height: 36px;
    vertical-align: top;
    width: 100%;
}

input::-webkit-input-placeholder {
    /* placeholder颜色 */
    color: rgb(153, 153, 153);
    /* placeholder字体大小 */
    font-size: 12px;
}

.userInfo-key {
    display:inline-block;
    line-height: 18px;
    width: 52px;
    margin-top: 9px;
    margin-bottom: 5px;
    font-size: 12px;
    color: rgb(153, 153, 153);
    font-weight: 400;
    font-family: PingFangSC-Regular;
}
.userInfo-value {
    display:inline-block;
    line-height: 18px;
    width: 150px;
    font-size: 12px;
    border: 0;
    padding-left: 16px;
    margin-top: 9px;
    margin-bottom: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: bottom;
    font-weight: 400;
    font-family: PingFangSC-Regular;
    outline:none;
}
.userInfo-report-value {
    display:inline-block;
    cursor: pointer;
    line-height: 18px;
    width: 100px;
    font-size: 12px;
    border: 0;
    padding-left: 16px;
    margin-top: 9px;
    margin-bottom: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: bottom;
    font-weight: 400;
    font-family: PingFangSC-Regular;
    outline:none;
    color: #5B6A91;
}
.userInfo-email-value {
    -webkit-user-select: text;
    display:inline-block;
    line-height: 18px;
    width: 150px;
    font-size: 12px;
    border: 0;
    padding-left: 16px;
    margin-top: 9px;
    margin-bottom: 5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: bottom;
    font-weight: 400;
    font-family: PingFangSC-Regular;
    outline:none;
}
.userInfo-phone-value{
    -webkit-user-select: text;
    display:inline-block;
    line-height: 18px;
    width: 150px;
    font-size: 12px;
    border: 0;
    padding-left: 16px;
    margin-top: 9px;
    margin-bottom: 5px;
    font-weight: 400;
    font-family: PingFangSC-Regular;
    outline:none;
}


</style>