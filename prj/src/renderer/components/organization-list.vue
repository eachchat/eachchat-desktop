<template>
    <el-container>
        <el-header height="56px" class="organization-header">
            <p class="organization-header-title">{{ $t("organizeMenuName") }}</p>
        </el-header>
        <el-main style="overflow: hidden">
            <el-container class="bottom-container" id="organization-main-container">
                <div v-for="(orgItem, orgIndex) in organizationList">
                    <div class="organization-view-one">
                        <div class="departments-view" v-show="organizationList[orgIndex].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[orgIndex].departments"
                                    @click="departmentMenuItemClicked(department, orgIndex)" 
                                    :key="index">
                                    <img v-if = 'isCompany(department)' ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Image/department-40px@2x.png">
                                    <img v-else ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Image/department@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[orgIndex].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <RecycleScroller class="managers-List" :items="organizationList[orgIndex].users" :item-size="60" key-field="user_id" v-slot="{ item }">
                                <div class="manager" @click="userMenuItemClicked(item.user_id)">
                                    <img ondragstart="return false" class="manager-icon" :id="item.user_id" src="../../../static/Img/User/user-40px@2x.png" onerror = "this.src = './static/Img/User/user-40px@2x.png'">
                                    <div class="manager-info">
                                        <p class="contact-list-name">{{ item.user_display_name }}</p>
                                        <p class="contact-list-titile">{{ item.user_title }}</p>
                                    </div>
                                </div>
                            </RecycleScroller>
                        </div>
                    </div>              
                </div>
                <userInfoContent :userInfo="userInfo" :originPosition="userInfoPosition" v-if="showUserInfoTips" :key="userInfoTipKey"></userInfoContent> 
            </el-container>
        </el-main>
    </el-container>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {downloadGroupAvatar, FileUtil} from '../../packages/core/Utils.js'
import confservice from '../../packages/data/conf_service.js'
import {services} from '../../packages/data/index.js';
import {Department, UserInfo, sqliteutil} from '../../packages/data/sqliteutil.js'; 
import yidrawer from './yi-drawer';
import userInfoContent from './user-info';
import userInfoTip from './userinfo-tip';
import '../style/contact-list'
import { ComponentUtil } from '../script/component-util.js'

export default {
    name: 'organizationList',
    components: {
        yidrawer,
        userInfoContent,
        userInfoTip,
    },
    data () {
        return {
            breadCrumbs: [],
            headerTitle: '',
            departments: [],
            organizationList: [],
            users: [],
            managers: [],
            userInfo: {},
            showUserInfoTips: false,
            userInfoTipKey: 1,
            userInfoPosition: {}
        }
    },
    props:{
        parentInfo: {
            type:Object
        },
        currentDepartment:{
            default: null
        }
    },
    watch:{
        currentDepartment: function(){
            this.showCurrentDepartment();
        }
    },
    computed: {

    },
    methods: {
        isCompany(department){
            return department.department_type === 'company'
        },

        showCurrentDepartment: async function(){
            if(!this.currentDepartment || !this.currentDepartment.department_id)
                return;
            this.organizationList = [];
            let departmentModels;
            let currentDepartment;
            let id = this.currentDepartment.department_id;
            while(departmentModels = await Department.GetSubDepartment(id)){
                var organization = {};
                organization.departments = departmentModels.sort(this.compare("show_order")); //
                organization.users = await UserInfo.GetSubUserinfo(id);
                this.organizationList.unshift(organization); 
                currentDepartment = await Department.GetDepartmentInfoByDepartmentID(id);
                if(currentDepartment.parent_id == '')
                    break;
                id = currentDepartment.parent_id;
            }
        },

        departmentMenuItemClicked:async function(department, level) {
            var id = department.department_id;
            var name = department.display_name;

            var departmentModels = await Department.GetSubDepartment(id);
            var tempDepartments = [];
            var organization = {};
            organization.departments = departmentModels.sort(this.compare("show_order")); //tempDepartments;
            organization.users = await UserInfo.GetSubUserinfo(id);
            if (level == this.organizationList.length - 1) {
                this.organizationList.push(organization);
            }else {
                this.organizationList.splice(level + 1, this.organizationList.length - level - 1);
                this.organizationList.push(organization);
            }  
            setTimeout(()=>{
            this.$nextTick(function(){
                    for(var i = 0; i < organization.users.length; i ++){
                        this.getUserImg(organization.users[i]);
                    }
                    let scrollElement = document.getElementById('organization-main-container');   
                    if(scrollElement) scrollElement.scrollTo({left: 280 * level, behavior: 'smooth'})
                });
            }, 0)       
            
        },
        userMenuItemClicked:async function(id) {  
            if (this.showUserInfoTips&&(this.userInfo.id == id)){
                this.showUserInfoTips = false;
                return;
            }
            var iconElement = document.getElementById(id);
            this.userInfoPosition.left = iconElement.getBoundingClientRect().left;
            this.userInfoPosition.top = iconElement.getBoundingClientRect().top;
            console.log(iconElement.getBoundingClientRect());
            //get userinfo
            let tempUserInfo = await ComponentUtil.ShowOrgInfoByUserID(id);
            this.userInfo = tempUserInfo;
            this.userInfoTipKey ++;
            this.showUserInfoTips = true;
        },
        getUserImg: function (userInfo){
            if(userInfo.user_id == undefined || userInfo == null) {
                return "";
            }

            global.mxMatrixClientPeg.matrixClient.getProfileInfo(userInfo.matrix_id).then((profileInfo) => {
                let userIconElement = document.getElementById(userInfo.user_id);
                if(!userIconElement)
                    return;
                if(!profileInfo.avatar_url){
                    userIconElement.setAttribute("src", './static/Img/User/user-40px@2x.png');
                    return;
                }
                    
                let validUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
                userIconElement.setAttribute("src", validUrl);
            }).catch((e) => {
                console.log(e);
            });
        },
        getAppBaseData:async function() {
            var rootDepartment = await Department.GetRoot();
            console.log(rootDepartment);
            var departments = await Department.GetSubDepartment(rootDepartment.department_id);
            console.log(departments);
            var tempDepartments = departments;
            tempDepartments.sort(this.compare("show_order"));
            this.departments = tempDepartments;
            var departmentModels = await Department.GetSubDepartment(rootDepartment.department_id);
            var tempDepartments = [];           
            var tempUsers = await UserInfo.GetSubUserinfo(rootDepartment.department_id);

            var organization = {};
            organization.departments = departmentModels;//tempDepartments;
            organization.users = tempUsers;
            this.organizationList.push(organization);
            this.headerTitle = this.parentInfo.display_name;
            console.log(this.organizationList);

        },

        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        }
    },

    created: async function() {
        await this.getAppBaseData();
        var that = this;
        document.addEventListener('click',function(e){
            console.log(e.target.className)
            if(e.target.className.indexOf('userInfo') == -1 && e.target.id != 'user-info-save'){
                that.showUserInfoTips = false;
            }
        });
    }
}
</script>
<style lang="scss" scoped>
::-webkit-scrollbar-track-piece {
    background-color: #FFFFFF;
    border-radius: 10px;
}

::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

::-webkit-scrollbar-thumb {
    height: 57px;
    width: 57px;
    background-color: #C1C1C1;
    border-radius: 10px;
    outline: none;
}

::-webkit-scrollbar-thumb:hover {
    height: 50px;
    background-color: #A8A8A8;
    border-radius: 10px;
}

.organization-header {
    display: float;
    width: 100%;
    height: 56px;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(238, 238, 238);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
    -webkit-app-region: drag;
    //-webkit-app-region: drag;
    // * {            
    //     -webkit-app-region: no-drag;
    // }
}
.organization-header-title{
    width:100%;
    height:20px;
    font-size:14px;
    font-weight:500;
    color:rgba(0,0,0,1);
    line-height:20px;
    padding-left: 16px;
    margin-top: 18px;
    margin-bottom: 18px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing: 0px;
}
.organization-list {
    overflow: scroll;
    list-style: none;
    height: 100%;
    width: 100%;
    padding: 0px;
    margin: 0px;
    .organization {
        display: inline-block;
        width: 280px;
        padding: 0px;
    }
}
.organization-view-one {
    width: 100%;
    height: 100%;
    min-width: 280px;
    flex-direction: column;
    margin: 0px;
    cursor: pointer;
}
.organization-view {
    width: 280px;
    height: 100%;
    //display: flex;
    flex-direction: column;
    border-left: 0.5px solid rgb(221, 221, 221);
    //border-right: 1px solid rgb(221, 221, 221);
    overflow-y: scroll;
    overflow-x: hidden;
    // ::-webkit-scrollbar-track {
    //     border-radius: 10px;
    // }
    margin: 0px;
    cursor: pointer;
}
.departments-view {
    width: 100%;
    
    margin: 0px;
    //background-color: orange;
}
.managers-view {
    width: 100%;
    
    margin: 0px;
    //background-color: red;
}
.users-view {
    width: 100%;
    
    margin: 0px;
    //background-color: blue;
}
.managers-header {
    width: 100%;
    height: 32px;
    padding-top: 10px;
    padding-left: 16px;
    background:rgba(247,248,250,1);
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0px;
}
.users-header {
    width: 100%;
    height: 28px;
    padding-top: 10px;
    padding-left: 16px;
    background:rgba(247,248,250,1);
    color:rgba(102,102,102,1);
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
}
.managers-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    //border-top: 1px solid rgb(221, 221, 221);
}
.departments-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    //border-top: 1px solid rgb(221, 221, 221);
}
.department {
    height: 60px;
    //border-bottom: 1px solid rgb(221, 221, 221);
    
}
.department:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}
.manager {
    height: 60px;
    //border-bottom: 1px solid rgb(221, 221, 221);
    
}
.manager:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}
.department-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
    border-radius: 50%;
}
.manager-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
    border-radius: 4px;
    border-radius: 50%;
}
.manager-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 120px);
}
.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 69%;
}
.department-name {
    display: flex;
    place-items: center;
    text-align: left;
    height: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
}
.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 6.5px;
    margin-top: 23.5px;
    margin-bottom: 23.5px;
    margin-right: 0px;
    margin-bottom: 0px;
    width: 7px;
    height: 13px;
}

.el-container {
    width: 100%;
    height: 100%;
    border: hidden;
    .el-header {
        padding: 0px;
    }
    .el-breadcrumb {
        display: block;
        margin-left: 16px;
        padding-top: 16px;
        font-size: 14px;
        line-height: 20px;
        padding-left: 0px;
    } 
    .el-main {
        width: auto;
        height: 100%;
        overflow: scroll;
        padding: 0px;
    .bottom-container {
        overflow: scroll;
    }
    }
    .avatarTUrl {
        width:40px;
        height: 40px;
    }
}

</style>