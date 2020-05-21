<template>
    <div class="userInfo-view" id="userInfoTipId">
        <div class="userInfo-Top"></div>
        <div class="userBaseInfo-view">
            <div class="user-baseInfo">
                <p class="user-name">{{ userInfo.user_display_name }}</p>
                <p class="user-title">{{ userInfo.user_title }}</p>
            </div>
            <img class="user-icon" id="userInfoTipUserImg" :src="getUserImg()">
        </div>
        <div class="userAction-view">
            <!-- <img class="userAudioIcon" src="../../../static/Image/userInfoAudio_icon@2x.png">
            <img class="userVideoIcon" src="../../../static/Image/userInfoVideo_icon@2x.png"> -->
            <img class="userChatIcon" src="../../../static/Img/Organization/UserInfo/userInfoChat_icon@2x.png">
        </div>
        <div class="userOrganizationInfo-view" v-show="showOrganizationView">
            <div class="userOrganization-header">
                组织信息
            </div>
            <ul class="userOrganization-list">
                <li v-show="showRelation">
                    <p class="userInfo-key">汇报关系</p>
                    <p class="userInfo-value">查看</p>
                </li>
                <li v-show="showDepartment">
                    <p class="userInfo-key">所属部门</p>
                    <p class="userInfo-value">{{ getDepartmentName }}</p>
                </li>
            </ul>
        </div>
        <div class="userContact-view" v-show="showContractView">
            <div class="userContact-header">
                联系信息
            </div>
            <ul class="userContact-list">
                <li v-show="showPhone">
                    <p class="userInfo-key">手机号</p>
                    <p class="userInfo-phone-value">9527</p>
                </li>
                <li v-show="showPhone">
                    <p class="userInfo-key">固话</p>
                    <p class="userInfo-phone-value">t00</p>
                </li>
                <li v-show="showEmail">
                    <p class="userInfo-key">电子邮箱</p>
                    <p class="userInfo-value">{{ userInfo.user_name }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import { services } from '../../packages/data'
import {downloadGroupAvatar} from '../../packages/core/Utils.js'
export default {
    name: 'user-info',
    data() {
        return {
            departmentName: '',
            wholeTipElement: null,
            userIconElement: null,
            // Used for get click class name 
            holdElement: null,
            userInfo: {},
            absoluteTop: 0,
            absoluteLeft: 0,
        }
    },
    props: {
        "tipInfos": {
            type:Object,
            default:{}
        }
    },
    computed: {
        getDepartmentName: async function() {
            var departmentInfo = await services.common.GetDistDepartmentsModel(this.userInfo.belong_to_department_id);
            if(departmentInfo != undefined && departmentInfo.length != 0){
                this.departmentName = departmentInfo.display_name;
            }
            return this.departmentName;
        },
        showOrganizationView: function() {
            return this.showDepartment||this.showRelation;
        },
        showContractView: function() {
            return this.showPhone||this.showEmail;
        },
        showPhone: function() {
            // return !this.isEmpty(this.userInfo.phone.phone_value);
            return true;
        },
        showEmail: function() {
            return !this.isEmpty(this.userInfo.user_name);
        },
        showDepartment: function() {
            if(this.departmentName){
                return true;
            }
            return false;
        },
        showRelation: function() {
            return !this.isEmpty(this.userInfo.managerId);
        }
    },
    methods: {
        getUserImg(){
            if(this.userInfo == undefined || this.userInfo == null) {
                return "";
            }
            
            this.userIconElement = document.getElementById("userInfoTipUserImg");
            if(this.userIconElement == undefined) {
                return;
            }
            var distTAvarar = this.userInfo.avatar_t_url;

            downloadGroupAvatar(distTAvarar, this.loginInfo.access_token)
            .then((ret) => {
                this.userIconElement.setAttribute("src", URL.createObjectURL(ret.data));
                this.userIconElement.onload = () => {
                    URL.revokeObjectURL(this.userIconElement.getAttribute("src"))
                }
            })
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
        reportRelationClicked() {

        }
    },
    async created () {
        this.loginInfo = await services.common.GetLoginModel();
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
        tipInfos: function() {
            if(this.wholeTipElement == null) {
                this.wholeTipElement = document.getElementById("userInfoTipId");
            }
            // if(this.holdElement == null) {
            //     this.holdElement = document.getElementById("userInfo-Top");
            // }
            if(this.tipInfos == "" || this.wholeTipElement == null) {
                return;
            }
            console.log("this.tipInfos is ", this.tipInfos)
            this.userInfo = this.tipInfos.userInfo;
            this.absoluteTop = this.tipInfos.absoluteTop;
            this.absoluteLeft = this.tipInfos.absoluteLeft;
            if(this.tipInfos.isMine){
                this.wholeTipElement.style.left = (this.absoluteLeft - this.wholeTipElement.offsetWidth).toString() + "px";
            }
            else {
                this.wholeTipElement.style.left = (this.absoluteLeft + 46).toString() + "px";
            }
            this.wholeTipElement.style.top = this.absoluteTop.toString() + "px";
            
            // this.holdElement.style.left = (this.absoluteLeft - this.wholeTipElement.offsetWidth).toString() + "px";
            // this.holdElement.style.top = this.absoluteTop.toString() + "px";
        }
    }
}
</script>

<style lang="scss" scoped>
.userInfo-view {
    height: auto;
    width: 296px;
    padding: 20px;
    border: 1px solid rgb(242, 242, 246);
    box-shadow: 2px 2px 5px rgb(219,219,219);
    background: rgba(255, 255, 255, 1);
    position: absolute;
    cursor: default;
}

.userInfo-Top {
    height: calc(100% - 20px);
    width: 296px;
    padding: 0px;
    margin: 0px;
    border: 0px;
    background: rgba(255, 255, 255, 0);
    position: absolute;
    cursor: default;
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