
<template>
    <div class="userInfo-view" :style="pagePosition">
        <div class="userInfoBaseInfo-view">
            <img ondragstart="return false" class="userInfo-icon" src="../../../static/Img/User/user-40px@2x.png" :id="getUserInfoIconID(userInfo.matrix_id)">
            <div class="userInfo-baseInfo">
                <p class="userInfo-name">{{ GetDisplayName(userInfo.displayName, userInfo.matrix_id) }}</p>
                <p class="userInfo-title">{{ userInfo.matrix_id }}</p>
            </div>
        </div>
        <div class="userInfoAction-view" v-show="!isOwn">
            <!-- <img ondragstart="return false" class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img ondragstart="return false" class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png"> -->
            <img ondragstart="return false" class="userInfoChatIcon" src="../../../static/Img/Organization/UserInfo/userInfoChat_icon@2x.png" @click="jumpToChat" >
        </div>
        <div class="userInfoState-view" >
            <ul class="userInfoState-list">
                <li v-if="userType == 'contact'">
                    <p class="userInfo-key">备注</p>
                    <input :readonly = 'inputEdit' class="userInfo-value" v-model="userInfo.displayName" placeholder="输入备注名...">
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
 
                <li v-if="showPhone">
                    <p class="userInfo-key">手机</p>
                    <input :readonly = 'inputEdit' class="userInfo-phone-value" v-model="userInfo.phone.mobile" placeholder="输入手机号...">
                </li>
                <li v-if="showTelephone">
                    <p class="userInfo-key">座机</p>
                    <input :readonly = 'inputEdit' class="userInfo-phone-value" v-model="userInfo.phone.work" placeholder="输入座机号...">
                </li>
                <li v-if="showEmail">
                    <p class="userInfo-key">邮箱</p>
                    <input :readonly = 'inputEdit' class="userInfo-email-value" v-model="userInfo.email[0].email_value" placeholder="输入邮箱...">
                </li>
               <li v-if="showDepartment">
                    <p class="userInfo-key">部门</p>
                    <input :readonly = 'inputEdit' class="userInfo-value" v-model="userInfo.department.display_name"  placeholder="输入部门名称...">
                </li>
                <li>
                    <p class="userInfo-key">职位</p>
                    <input :readonly = 'inputEdit' class="userInfo-email-value" v-model="userInfo.title" placeholder="输入职位名称...">
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import { services } from '../../packages/data'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import { functions } from 'electron-log'
import {ComponentUtil} from '../script/component-util.js'


export default {
    name: 'user-info',
    data() {
        return {
            pagePosition: {},
            inputEdit: true,
            services: null
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
            default: "origanise"
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
            return this.userInfo.email.length > 0;
        },
        showDepartment: function() {
            if(this.userType == 'contact')
                return true;
            if (this.userInfo == undefined){
                return false;
            }
            if(this.userInfo.department != undefined && this.userInfo.department.display_name){
                return true;
            }
            return false;
        },
        showRelation: function() {
            if (this.userInfo == undefined){
                return false;
            }
            return !this.isEmpty(this.userInfo.managerId);
        }
    },
    methods: {
        GetDisplayName: function(displayName, userid){
            return ComponentUtil.GetDisplayName(displayName, userid);
        },

        jumpToChat: async function() {
            if(this.$route.name == "organization" || this.$route.name == "favourite") {
                this.$router.push(
                    {
                        name: 'ChatContent', 
                        params: {
                            user_id: this.userInfo.matrix_id
                        }
                    })
            }
            else {
                this.curUserInfo = await this.services.GetSelfUserModel();
                console.log("JumpToChat")
                var groupItem = {};
                console.log("userInfos is ", this.userInfo);
                var chatAvater = this.userInfo.avatarTUrl;
                var chatName = this.userInfo.displayName;
                var groupCheck = '';
                // console.log("chat name is ", chatName)
                try {
                    groupCheck = await Group.SearchChatByNameKey(chatName);
                }
                catch(error) {
                    console.log("get grou name exception and err is ", error);
                }
                var contain_user_ids = [this.curUserInfo.matrix_id, this.userInfo.matrix_id].join(",");
                console.log("groupCheck is ", groupCheck)
                if(groupCheck.length == 0) {
                    groupItem["contain_user_ids"] = contain_user_ids;
                    groupItem["group_avarar"] = chatAvater;
                    groupItem["group_name"] = chatName;
                    groupItem["group_type"] = 102;
                    groupItem["last_message_time"] = 0;
                    groupItem["message_content"] = null;
                    groupItem["message_content_type"] = 101;
                    groupItem["message_from_id"] = this.curUserInfo.matrix_id;
                    groupItem["message_id"] = '';
                    groupItem["owner"] = null;
                    groupItem["sequence_id"] = 0;
                    groupItem["status"] = "00000000";
                    groupItem["un_read_count"] = 0;
                    groupItem["updatetime"] = new Date().getTime();
                    groupItem["user_id"] = this.userInfo.matrix_id;
                }
                else {
                    groupItem = groupCheck[0];
                }
                console.log("userinfotip emit groupitem is ", groupItem);
                this.$emit('getCreateGroupInfo', groupItem);
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
            this.curUserInfo = await this.services.GetSelfUserModel();
            var tempUserinfo = this.userInfo;
            tempUserinfo.curUserInfo = this.curUserInfo;
            const ipcRender = require('electron').ipcRenderer;
            ipcRender.send('showReportRelationWindow', this.userInfo);

        },
        getPageHeight(){
            var total = 448;
            var count = 0;
            if(!this.showStatusDescription){
                count ++;
            }
            if(!this.showWorkDescription){
                count ++;
            }
            if(!this.showRelation){
                count ++;
            }
            if(!this.showDepartment){
                count ++;
            }
            if(!this.showPhone){
                count ++;
            }
            if(!this.showTelephone){
                count ++;
            }
            if(!this.showEmail){
                count ++;
            }
            return total - count * 36;
        },
        getUserImg: async function (userInfo){
            if(!userInfo.matrix_id)
                return;
            let userIconElement = document.getElementById(this.getUserInfoIconID(userInfo.matrix_id));
            if(!userIconElement)
                return;
            var profileInfo = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(userInfo.matrix_id);
            if(!profileInfo.avatar_url)
                return;
            let validUrl = this.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
            userIconElement.setAttribute("src", validUrl);
            
        },
        getUserInfoIconID(id){
            return "userInfo" + id;
        }
    },
    created () {
        this.services = global.services.common;
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;

        if(this.userType == 'contact' )
            this.inputEdit = false;
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
                                        this.userInfo.department.display_name,
                                        this.userInfo.title);
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
.userInfo-icon {
    width: 48px;
    height: 48px;
    
    margin-top: 20px;
    margin-left: 116px;
    margin-bottom: 0px;
    border-radius: 4px;
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
    letter-spacing:2px;
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
    letter-spacing: 1px;
    color: rgb(153, 153, 153);
    font-family: PingFangSC-Regular;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.userInfoAction-view {
    height: 48px;
    width: 100%;
    margin: 0px;
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
    margin-top: 8px;
    margin-left: 124px;
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
}
.userInfo-value {
    display:inline-block;
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
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
    font-family: PingFangSC-Regular;
    font-weight: 400;
    
}




</style>