<template>
    <el-container>
        <el-header height="56px" class="organization-header">
            <p class="organization-header-title">{{ headerTitle }}</p>
        </el-header>
        <el-main>
            <el-container class="bottom-container" id="organization-main-container">
                    <div class="organization-view-one">
                        <div class="departments-view" v-show="organizationList[0].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[0].departments"
                                    @click="departmentMenuItemClicked(department, 0)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[0].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <RecycleScroller class="managers-List" :items="organizationList[0].users" :item-size="60" key-field="user_id" v-slot="{ item }">
                                <div class="manager" @click="userMenuItemClicked(item.user_id)">
                                    <img ondragstart="return false" class="manager-icon" :id="item.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ item.user_display_name }}</p>
                                        <p class="manager-title">{{ item.user_title }}</p>
                                    </div>
                                </div>
                            </RecycleScroller>
                        </div>
                    </div>
                
                    <div>
                    <div class="organization-view" v-if="showOrganizationLevelTwo">
                        <div class="departments-view" >
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[1].departments"
                                    @click="departmentMenuItemClicked(department, 1)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[1].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <ul class="managers-list">
                                <li class="manager"
                                    v-for="(manager, index) in organizationList[1].users"
                                    @click="userMenuItemClicked(manager.user_id)" 
                                    
                                    :key="index">
                                    <img ondragstart="return false" class="manager-icon" :id="manager.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ manager.user_display_name }}</p>
                                        <p class="manager-title">{{ manager.user_title }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    </div>
                <div>
                    <div class="organization-view" v-if="showOrganizationLevelThree">
                        <div class="departments-view" v-if="organizationList[2].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[2].departments"
                                    @click="departmentMenuItemClicked(department, 2)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[2].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <ul class="managers-list">
                                <li class="manager"
                                    v-for="(manager, index) in organizationList[2].users"
                                    @click="userMenuItemClicked(manager.user_id)" 
                                    
                                    :key="index">
                                    <img ondragstart="return false" class="manager-icon" :id="manager.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ manager.user_display_name }}</p>
                                        <p class="manager-title">{{ manager.user_title }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                                <div>
                    <div class="organization-view" v-if="showOrganizationLevelFour">
                        <div class="departments-view" v-if="organizationList[3].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[3].departments"
                                    @click="departmentMenuItemClicked(department, 3)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[3].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <ul class="managers-list">
                                <li class="manager"
                                    v-for="(manager, index) in organizationList[3].users"
                                    @click="userMenuItemClicked(manager.user_id)" 
                                    
                                    :key="index">
                                    <img ondragstart="return false" class="manager-icon" :id="manager.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ manager.user_display_name }}</p>
                                        <p class="manager-title">{{ manager.user_title }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                                <div>
                    <div class="organization-view" v-if="showOrganizationLevelFive">
                        <div class="departments-view" v-if="organizationList[4].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[4].departments"
                                    @click="departmentMenuItemClicked(department, 4)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[4].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <ul class="managers-list">
                                <li class="manager"
                                    v-for="(manager, index) in organizationList[4].users"
                                    @click="userMenuItemClicked(manager.user_id)" 
                                    
                                    :key="index">
                                    <img ondragstart="return false" class="manager-icon" :id="manager.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ manager.user_display_name }}</p>
                                        <p class="manager-title">{{ manager.user_title }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                                <div>
                    <div class="organization-view" v-if="showOrganizationLevelSix">
                        <div class="departments-view" v-if="organizationList[5].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[5].departments"
                                    @click="departmentMenuItemClicked(department, 5)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[5].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <ul class="managers-list">
                                <li class="manager"
                                    v-for="(manager, index) in organizationList[5].users"
                                    @click="userMenuItemClicked(manager.user_id)" 
                                    
                                    :key="index">
                                    <img ondragstart="return false" class="manager-icon" :id="manager.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ manager.user_display_name }}</p>
                                        <p class="manager-title">{{ manager.user_title }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                                <div>
                    <div class="organization-view" v-if="showOrganizationLevelSeven">
                        <div class="departments-view" v-if="organizationList[6].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[6].departments"
                                    @click="departmentMenuItemClicked(department, 6)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[6].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <ul class="managers-list">
                                <li class="manager"
                                    v-for="(manager, index) in organizationList[6].users"
                                    @click="userMenuItemClicked(manager.user_id)" 
                                    
                                    :key="index">
                                    <img ondragstart="return false" class="manager-icon" :id="manager.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ manager.user_display_name }}</p>
                                        <p class="manager-title">{{ manager.user_title }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                                <div>
                    <div class="organization-view" v-if="showOrganizationLevelEight">
                        <div class="departments-view" v-if="organizationList[7].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[7].departments"
                                    @click="departmentMenuItemClicked(department, 7)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[7].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <ul class="managers-list">
                                <li class="manager"
                                    v-for="(manager, index) in organizationList[7].users"
                                    @click="userMenuItemClicked(manager.user_id)" 
                                    
                                    :key="index">
                                    <img ondragstart="return false" class="manager-icon" :id="manager.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ manager.user_display_name }}</p>
                                        <p class="manager-title">{{ manager.user_title }}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                                <div>
                    <div class="organization-view" v-if="showOrganizationLevelNine">
                        <div class="departments-view" v-if="organizationList[8].departments.length">
                            <ul class="departments-list">
                                <li class="department"
                                    v-for="(department, index) in organizationList[8].departments"
                                    @click="departmentMenuItemClicked(department, 8)" 
                                    :key="index">
                                    <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                                    <div class="department-info">
                                        <p class="department-name">{{ department.display_name }}</p>
                                    </div>
                                    <div align="center" class="item-arrow">
                                        <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="users-view" v-if="organizationList[8].users.length">
                            <div class="users-header">
                                成员
                            </div>
                            <ul class="managers-list">
                                <li class="manager"
                                    v-for="(manager, index) in organizationList[8].users"
                                    @click="userMenuItemClicked(manager.user_id)" 
                                    
                                    :key="index">
                                    <img ondragstart="return false" class="manager-icon" :id="manager.user_id" src="../../../static/Img/User/user-40px@2x.png">
                                    <div class="manager-info">
                                        <p class="manager-name">{{ manager.user_display_name }}</p>
                                        <p class="manager-title">{{ manager.user_title }}</p>
                                    </div>
                                </li>
                            </ul>
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
        }
    },
    computed: {
        showOrganizationLevelTwo: function(){
            if (this.organizationList.length >= 2) {
                return true;
            }
            else{
                return false;
            }
        },
        
        showOrganizationLevelThree: function(){
            if (this.organizationList.length >= 3) {
                return true;
            }
            else{
                return false;
            }
        },
        showOrganizationLevelFour: function(){
            if (this.organizationList.length >= 4) {
                return true;
            }
            else{
                return false;
            }
        },
                showOrganizationLevelFive: function(){
            if (this.organizationList.length >= 5) {
                return true;
            }
            else{
                return false;
            }
        },
                showOrganizationLevelSix: function(){
            if (this.organizationList.length >= 6) {
                return true;
            }
            else{
                return false;
            }
        },
                showOrganizationLevelSeven: function(){
            if (this.organizationList.length >= 7) {
                return true;
            }
            else{
                return false;
            }
        },
                showOrganizationLevelEight: function(){
            if (this.organizationList.length >= 8) {
                return true;
            }
            else{
                return false;
            }
        },
                showOrganizationLevelNine: function(){
            if (this.organizationList.length >= 9) {
                return true;
            }
            else{
                return false;
            }
        },
    },
    methods: {
        // departmentBreadCrumbsClicked:async function(id, name, index) {
        //     this.showUserInfoDrawer = false;
        //     var departmentModels = await Department.GetSubDepartment(id);

        //     var tempDepartments = [];
        //     for(var i = 0; i < departmentModels.length; i ++){
        //         tempDepartments[departmentModels[i].show_order] = departmentModels[i];
        //     }
        //     this.departments = tempDepartments;
        //     this.users = await UserInfo.GetSubUserinfo(id);
        //     this.$nextTick(function(){
        //         for(var i = 0; i < this.users.length; i ++){
        //             this.getUserImg(this.users[i]);
        //         }
        //     });

        //     this.breadCrumbs.splice(index + 1, this.breadCrumbs.length - index + 1);
        // },
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
            
            this.$nextTick(function(){
                var element = document.getElementById("organization-main-container");
                element.scroll(element.offsetWidth,0);
                for(var i = 0; i < organization.users.length; i ++){
                    this.getUserImg(organization.users[i]);
                }
            });
            

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
            var tempUserInfo = {};
            //get userinfo
            var user = await UserInfo.GetUserInfo(id);
            tempUserInfo.id = user.user_id;
            tempUserInfo.avatarTUrl = user.avatar_t_url;
            tempUserInfo.displayName = user.user_display_name;
            tempUserInfo.title = user.user_title;
            tempUserInfo.statusDescription = user.status_description;
            tempUserInfo.workDescription = user.work_description;
            tempUserInfo.managerId = user.manager_id;
            tempUserInfo.departmentId = user.belong_to_department_id;
            
            //get department
            var department = await Department.GetDepartmentInfoByUserID(id);
            tempUserInfo.department = department;
            //get email
            var email = await UserInfo.GetUserEmailByUserID(id);
            tempUserInfo.email = email;
            //get phone
            var phone = await UserInfo.GetUserPhoneByUserID(id);
            var tempPhone = {};
            for (var i = 0; i < phone.length; i ++){
                var temp = phone[i];
                if(temp.phone_type == 'mobile'){
                    tempPhone.mobile = temp.phone_value;
                }else{
                    tempPhone.work = temp.phone_value;
                }
            }
            tempUserInfo.phone = tempPhone;


            var leaders = await UserInfo.GetLeaders(id);
            tempUserInfo.leaders = leaders;

            this.userInfo = tempUserInfo;
            this.userInfoTipKey ++;
            this.showUserInfoTips = true;
        },
        getUserImg: async function (userInfo){
            if(userInfo.user_id == undefined || userInfo == null) {
                return "";
            }
            var userId = userInfo.user_id;
            var userAvatarUrl = userInfo.avatar_t_url;
            var localPath = confservice.getUserThumbHeadLocalPath(userId);
            let userIconElement = document.getElementById(userInfo.user_id);
            if(fs.existsSync(localPath)){
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    userIconElement.setAttribute("src", reader.result);
                }
            }else{
                services.common.downloadUserTAvatar(userInfo.avatar_t_url, userInfo.user_id);
            }
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
        updateUserImage: function(e, args) {
            var state = args[0];
            var stateInfo = args[1];
            var id = args[2];
            var localPath = args[3];
            var elementImg = document.getElementById(id);
            if(elementImg != null){
                var showfu = new FileUtil(localPath);
                let showfileObj = showfu.GetUploadfileobj();
                let reader = new FileReader();
                reader.readAsDataURL(showfileObj);
                reader.onloadend = () => {
                    elementImg.setAttribute("src", reader.result);
                }
                
            }
            
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
        return;
        setTimeout(() => {
        this.$nextTick(function(){
            var users = this.organizationList[0].users;
            for(var i = 0; i < users.length; i ++){
                this.getUserImg(users[i]);
            }
        });
        }, 0);
        var that = this;
        document.addEventListener('click',function(e){
            if(e.target.className.indexOf('userInfo') == -1){
                that.showUserInfoTips = false;
            }
            
        });
        const ipcRenderer = require('electron').ipcRenderer;
        ipcRenderer.on('updateUserImage', this.updateUserImage);
    }
}
</script>
<style lang="scss" scoped>

::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
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
    letter-spacing:1px;
    padding-left: 16px;
    margin-top: 18px;
    margin-bottom: 18px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    letter-spacing: 1px;
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
    //display: flex;
    flex-direction: column;
    //border-right: 0.5px solid rgb(221, 221, 221);
    overflow-y: scroll;
    overflow-x: hidden;
    // ::-webkit-scrollbar-track {ß
    //     border-radius: 10px;
    // }
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
    letter-spacing: 1px;
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
    letter-spacing: 1px;
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
}
.manager-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 120px);
}
.manager-name {
    height: 20px;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 2px;;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    font-weight:400;
    letter-spacing:1px;
    color:rgba(0,0,0,1);
    font-family: PingFangSC-Regular;
}
.manager-title {
    height: 18px;
    width: 100%;
    margin-top: 0px;
    margin-bottom: 10px;
    margin-left: 12px;
    font-size: 12px;
    line-height: 18px;
    font-weight:400;
    color:rgba(153,153,153,1);
    letter-spacing:1px;
    font-family: PingFangSC-Regular;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
}
.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 92px);
}
.department-name {
    display: flex;
    place-items: center;
    text-align: left;
    height: 20px;
    width: 70%;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 1px;
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