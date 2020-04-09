<template>
    <div class="userInfo-view">
        <div class="userBaseInfo-view">
            <img class="user-icon" :src="userInfo.avatarTUrl">
            <div class="user-baseInfo">
                <p class="user-name">{{ userInfo.displayName }}</p>
                <p class="user-title">{{ userInfo.title }}</p>
            </div>
        </div>
        <div class="userAction-view">
            <img class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png">
            <img class="userChatIcon" src="../../../static/Image/userInfoChat_icon@2x.png">
        </div>
        <div class="userState-view">
            <ul class="userState-list">
                <li>
                    <p class="userInfo-key">状态</p>
                    <p class="userInfo-value">{{ userInfo.statusDescription }}</p>
                </li>
                <li>
                    <p class="userInfo-key">工作计划</p>
                    <p class="userInfo-value">{{ userInfo.workDescription }}</p>
                </li>
            </ul>
        </div>
        <div class="userOrganizationInfo-view">
            <div class="userOrganization-header">
                组织信息
            </div>
            <ul class="userOrganization-list">
                <li>
                    <p class="userInfo-key">汇报关系</p>
                    <p class="userInfo-value">查看</p>
                </li>
                <li>
                    <p class="userInfo-key">所属部门</p>
                    <p class="userInfo-value">{{ userInfo.department.displayName }}</p>
                </li>
            </ul>
        </div>
        <div class="userContact-view">
            <div class="userContact-header">
                联系信息
            </div>
            <ul class="userContact-list">
                <li>
                    <p class="userInfo-key">手机号</p>
                    <p class="userInfo-value">{{ userInfo.phoneNumbers[0].value }}</p>
                </li>
                <li>
                    <p class="userInfo-key">固话</p>
                    <p class="userInfo-value">{{ userInfo.phoneNumbers[1].value }}</p>
                </li>
                <li>
                    <p class="userInfo-key">电子邮箱</p>
                    <p class="userInfo-value">{{ userInfo.emails[0].value }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
export default {
    name: 'user-info',
    data() {
        return {
            
        }
    },
    props: {
        "userInfo": {
            type:Object,
            default:{}
        }
    },
    methods: {
        userChatButtonClicked() {

        },
        userAudioButtonClicked() {

        },
        userVideoButtonClicked() {

        },
        reportRelationClicked() {

        }
    },
    created () {
        console.log(this.userInfo);
    }
}
</script>
<style lang="scss" scoped>
.userInfo-view {
    height: auto;
    width: 296;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 20px;
    margin-bottom: 18px;
}
.userBaseInfo-view {
    height: 56px;
    margin: 0px;
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
    width: calc(100% - 78px);
    font-size: 12px;
    
}
.userOrganizationInfo-view {
    width: 100%;
    margin-bottom: 10px;
}



</style>