<template>
    <div class="groupInfo" id="groupInfoTipId">
        <div class="groupMember-view">
            <ul class="groupMember-list">
                <li class="addMember">
                    <div class="memberAddImg">
                        <img class="memberImg" src="../../../static/Img/Chat/emoji@3x.png" height=40px >
                    </div>
                    <div class="memberName">添加
                    </div>
                </li>
                <li v-for="(item, index) in memberListShow" class="memberInfo">
                    <div class="memberImg">
                        <img :class="getClassNameThroughMemberInfo(item)" src="../../../static/Img/User/user.jpeg" height=40px >
                    </div>
                    <div class="memberName">{{item.user_display_name}}
                    </div>
                </li>
            </ul>
            <div class="addMore">
                更多.....
            </div>
        </div>
        <div class="groupInfo-view" v-show="false">
            <!-- <img class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png"> -->
            <img class="userChatIcon" src="../../../static/Img/Organization/UserInfo/userInfoChat_icon@2x.png">
        </div>
        <div class="groupSetting-view" v-show="false">
            <!-- <img class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png"> -->
            <img class="userChatIcon" src="../../../static/Img/Organization/UserInfo/userInfoChat_icon@2x.png">
        </div>
        <div class="groupClear-view" v-show="false">
            <!-- <img class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png"> -->
            <img class="userChatIcon" src="../../../static/Img/Organization/UserInfo/userInfoChat_icon@2x.png">
        </div>
        <div class="groupLeave-view" v-show="false">
            <!-- <img class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png"> -->
            <img class="userChatIcon" src="../../../static/Img/Organization/UserInfo/userInfoChat_icon@2x.png">
        </div>
        <div class="groupDismiss-view" v-show="false">
            <!-- <img class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png"> -->
            <img class="userChatIcon" src="../../../static/Img/Organization/UserInfo/userInfoChat_icon@2x.png">
        </div>
    </div>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import { services } from '../../packages/data'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
export default {
    name: 'group-info',
    data() {
        return {
            memberListShow: [],
            absoluteTop: 0,
            absoluteLeft: 0,
            allMemberList: [],
        }
    },
    props: ['memberList'],
    computed: {
    },
    methods: {
        getClassNameThroughMemberInfo: function(memberInfo) {
            console.log("memberInfo is ", memberInfo);
            // return "member-img-" + memberInfo.user_id;
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
                if(this.userIconElement == undefined) {
                    this.userIconElement = document.getElementById("userInfoTipUserImg");
                }
            })
        }, 0)
    },
    watch: {
        memberList: async function() {
            if(this.wholeTipElement == null) {
                this.wholeTipElement = document.getElementById("groupInfoTipId");
            }
            if(this.memberList == undefined || this.wholeTipElement == null) {
                return;
            }
            console.log("watch memberList is ", this.memberList);
            for(var i=0;i<this.memberList.length;i++) {
                let memberInfoTmp = await services.common.GetDistUserinfo(this.memberList[i]);
                this.allMemberList.push(memberInfoTmp[0]);
                if(i < 12) {
                    this.memberListShow.push(memberInfoTmp[0]);
                }
            }
            this.wholeTipElement.style.right = "0px";
            this.wholeTipElement.style.top = "42px";
            console.log("this.wholeTipElement is ", this.wholeTipElement.style);
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
    background: rgba(255, 255, 255, 1);
    position: absolute;
    cursor: default;
}

.groupMember-view {
    height: 250px;
    width: 220px;
    padding: 0px;
    margin: 0px;
    border: 0px;
    background: rgba(255, 255, 255, 0);
    position: absolute;
    cursor: default;
}

.groupMember-list {
    list-style: none;
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
    margin-top: 10px;
    text-align: center;
    font-size: 14px;
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