<template>
    <el-container>
        <el-header height="55px" class="organization-header">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item v-for="(item, index) in breadCrumbs" :key="index">
                    <a href="javascript:void(0)" 
                    @click="departmentBreadCrumbsClicked(item.id, item.name, index)">
                    {{ item.name }}</a>
                </el-breadcrumb-item>
            </el-breadcrumb>
        </el-header>
        <el-main>
            <el-container>
            <div class="organization-view">
                <div class="departments-view">
                    <ul class="departments-list">
                        <li class="department"
                            v-for="(department, index) in departments"
                            @click="departmentMenuItemClicked(department.department_id, department.display_name)" 
                            :key="index">
                            <img class="department-icon" src="../../../static/Img/Organization/Common/department_list@2x.png">
                            <div class="department-info">
                                <p class="department-name">{{ department.display_name }}</p>
                            </div>
                            <div align="center" class="item-arrow">
                                <img class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="managers-view" v-show="managers.length">
                    <div class="managers-header">
                        管理
                    </div>
                    <ul class="managers-list">
                        <li class="manager"
                            v-for="(manager, index) in managers"
                            @click="userMenuItemClicked(manager.user_id)" 
                            :key="index">
                            <img class="manager-icon" :src="manager.avatar_t_url">
                            <div class="manager-info">
                                <p class="manager-name">{{ manager.user_display_name }}</p>
                                <p class="manager-title">{{ manager.user_title }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="users-view" v-show="users.length">
                    <div class="users-header">
                        成员
                    </div>
                    <ul class="managers-list">
                        <li class="manager"
                            v-for="(manager, index) in users"
                            @click="userMenuItemClicked(manager.user_id)" 
                            :key="index">
                            <img class="manager-icon" :src="manager.avatar_t_url">
                            <div class="manager-info">
                                <p class="manager-name">{{ manager.user_display_name }}</p>
                                <p class="manager-title">{{ manager.user_title }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="userInfo-view" v-show="showUserInfoDrawer">
                <yidrawer :showTitle = "false" :display.sync="showUserInfoDrawer" :inner="true" width="336px" :closable="true">
                    <userInfoContent :userInfo = "userInfo"></userInfoContent>
                </yidrawer>
            </div>
            </el-container>
        </el-main>
    </el-container>
</template>
<script>
import {services} from '../../packages/data/index.js';
import yidrawer from './yi-drawer';
import userInfoContent from './user-info';
export default {
    name: 'organizationList',
    components: {
        yidrawer,
        userInfoContent
    },
    data () {
        return {
            breadCrumbs: [],
            allDepartments: [],
            allUsers: [],
            allEmails: [],
            allAddress: [],
            allPhones: [],
            departments: [],
            users: [],
            managers: [],
            userInfo: {},
            showUserInfoDrawer: false,
        }
    },
    methods: {
        departmentBreadCrumbsClicked(id, name, index) {
            this.showUserInfoDrawer = false;
            var tempDepartments = [];
            for (var i = 0; i < this.allDepartments.length; i ++) {
                var department = this.allDepartments[i];
                if (department.parent_id == id) {
                    tempDepartments[department.show_order] = department;
                }
            }
            var tempManagers = [];
            var tempUsers = [];
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                if (user.belong_to_department_id == id) {
                    tempUsers.push(user);
                    if (user.manager) {
                        tempManagers.push(user);
                    }
                }
            }
            this.departments = tempDepartments;
            this.users = tempUsers;
            this.managers = tempManagers;
            this.breadCrumbs.splice(index + 1, this.breadCrumbs.length - index + 1);
        },
        departmentMenuItemClicked(id, name) {
            this.showUserInfoDrawer = false;
            var tempDepartments = [];
            for (var i = 0; i < this.allDepartments.length; i ++) {
                var department = this.allDepartments[i];
                if (department.parent_id == id) {
                    tempDepartments[department.show_order] = department;
                }
            }
            var tempManagers = [];
            var tempUsers = [];
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                if (user.belong_to_department_id == id) {
                    tempUsers.push(user);
                    if (user.manager) {
                        tempManagers.push(user);
                    }
                }
            }
            this.departments = tempDepartments;
            this.users = tempUsers;
            this.managers = tempManagers;
            this.breadCrumbs.push({
                name: name,
                id: id
            });
        },
        userMenuItemClicked(id) {
            if (this.showUserInfoDrawer&&(this.userInfo.id == id)){
                this.showUserInfoDrawer = false;
                return;
            }
            var tempUserInfo = {};
            for (var i = 0; i < this.users.length; i ++) {
                var user = this.users[i];
                if(user.user_id == id) {
                    
                    tempUserInfo.id = user.user_id;
                    tempUserInfo.avatarTUrl = user.avatar_t_url;
                    tempUserInfo.displayName = user.user_display_name;
                    tempUserInfo.title = user.user_title;
                    tempUserInfo.statusDescription = user.status_description;
                    tempUserInfo.workDescription = user.work_description;
                    tempUserInfo.managerId = user.manager_id;
                    tempUserInfo.departmentId = user.belong_to_department_id;


                    break;
                }
            }
            for (var i = 0; i < this.allDepartments.length; i ++) {
                var department = this.allDepartments[i];
                if(department.department_id == tempUserInfo.departmentId){
                    tempUserInfo.department = department;
                    break;
                }
                
            }
            for (var i = 0; i < this.allEmails.length; i ++) {
                var email = this.allEmails[i];
                if(email.owner_user_id == id) {
                    tempUserInfo.email = email;
                    break;
                }
            }
            for (var i = 0; i < this.allPhones.length; i ++) {
                var phone = this.allPhones[i];
                if(phone.owner_user_id == id) {
                    tempUserInfo.phone = phone;
                    break;
                }
            }
            this.userInfo = tempUserInfo;
            this.showUserInfoDrawer = true;
        },
        getAppBaseData:async function() {
            this.allDepartments = await services.common.GetAllDepartmentsModel();
            this.allUsers = await services.common.GetAllUserinfo();
            this.allEmails = await services.common.GetAllUserEmail();
            this.allPhones = await services.common.GetAllUserPhone();
            this.allAddress = await services.common.GetAllUserAddress();

            var tempDepartments = [];
            var tempRootDepartment = [];
            var tempManagers = [];
            var tempUsers = [];

            for (var i = 0; i < this.allDepartments.length; i ++){
                var department = this.allDepartments[i];
                if (!department.parent_id) {
                    tempRootDepartment = department;
                    break;
                }
            }
            for (var i = 0; i < this.allDepartments.length; i ++){
                var department = this.allDepartments[i];
                if (department.parent_id == tempRootDepartment.department_id) {
                    tempDepartments[department.show_order] = department;
                }
            }
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                if (user.department_id == tempRootDepartment.department_id) {
                    tempUsers.push(user);
                    if (user.manager) {
                        tempManagers.push(user);
                    }
                }
            }
                
            this.departments = tempDepartments;
            this.managers = tempManagers;
            this.users = tempUsers;
            this.breadCrumbs.push({
                name: "组织架构",
                id: tempRootDepartment.department_id
            });
        },
    },
    created: async function() {
        await this.getAppBaseData();
        /*
        this.serverApi.GetAllDepartmentInfo()
        .then(function(res){
            _this.allDepartments = res.data;
            
            var tempDepartments = [];
            var tempRootDepartment = [];
            var tempManagers = [];
            var tempUsers = [];
            for (var i = 0; i < _this.allDepartments.length; i ++){
                var department = _this.allDepartments[i];
                if (department.level == 1){
                    tempDepartments[department.showOrder] = department;
                }
                if (department.level == 0) {
                    tempRootDepartment = department;
                }
            }
            _this.serverApi.GetAllUserInfo()
            .then(function(res){
                _this.allUsers = res.data;
                
                for (var i = 0; i < _this.allUsers.length; i ++) {
                    var user = _this.allUsers[i];
                    if (user.departmentId == tempRootDepartment.id) {
                        tempUsers.push(user);
                        if (user.manager) {
                            tempManagers.push(user);
                        }
                    }
                }
                
                _this.departments = tempDepartments;
                _this.managers = tempManagers;
                _this.users = tempUsers;
                _this.breadCrumbs.push({
                    name: "组织架构",
                    id: tempRootDepartment.id
                })
            })
            .catch(err=>{console.log(err)}
            )
        })
        .catch(err=>{console.log(err)}
        )
        */
        
    }
}
</script>
<style lang="scss" scoped>
// ::-webkit-scrollbar-track-piece {
//     background-color: #F1F1F1;
//     border-radius: 10px;
// }

// ::-webkit-scrollbar {
//     width: 8px;
//     height: 12px;
// }

// ::-webkit-scrollbar-thumb {
//     height: 50px;
//     background-color: #C1C1C1;
//     border-radius: 10px;
//     outline: none;
// }

// ::-webkit-scrollbar-thumb:hover {
//     height: 50px;
//     background-color: #A8A8A8;
//     border-radius: 10px;
// }
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
.organization-list-panel {
    width: 100%;
    height: 100%;
}
.organization-header {
    display: float;
    width: 100%;
    height: 55px;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(221, 221, 221);
    //-webkit-app-region: drag;
    // * {            
    //     -webkit-app-region: no-drag;
    // }
}
.organization-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    margin: -16px;
}
.organization-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    //border-right: 1px solid rgb(221, 221, 221);
    overflow-y: scroll;
    overflow-x: hidden;
    // ::-webkit-scrollbar-track {
    //     border-radius: 10px;
    // }
    margin: 0px;
    cursor: pointer;
}
.empty-content {
    width: 100%;
    height: auto;
    //background-color: orange;
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
    height: 28px;
    padding-top: 10px;
    padding-left: 16px;
    background-color: rgb(239, 240, 241);
    font-size: 13px;
    line-height: 18px;
    letter-spacing: 1px;
}
.users-header {
    width: 100%;
    height: 28px;
    padding-top: 10px;
    padding-left: 16px;
    background-color: rgb(239, 240, 241);
    font-size: 13px;
    line-height: 18px;
    letter-spacing: 1px;
}
.managers-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    border-top: 1px solid rgb(221, 221, 221);
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
    height: 64px;
    border-bottom: 1px solid rgb(221, 221, 221);
    
    
}
.manager {
    height: 64px;
    border-bottom: 1px solid rgb(221, 221, 221);
    
}

.department-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 0px;
    margin-bottom: 12px;
}
.manager-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 0px;
    margin-bottom: 12px;
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
    margin-top: 12px;
    margin-bottom: 2px;;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
}
.manager-title {
    height: 20px;
    width: 100%;
    margin-top: 0px;
    margin-bottom: 12px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
}
.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 92px);
}
.department-name {
    text-align: left;
    height: 40%;
    width: 70%;
    margin-top: 21px;
    margin-left: 16px;
    font-size: 14px;
    line-height: 22px;
}
.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 6.5px;
    margin-top: 25.5px;
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
        padding-top: 18px;
        font-size: 14px;
        line-height: 20px;
        padding-left: 0px;
    } 
    .el-main {
        width: auto;
        height: 100%;
        overflow: hidden;
        padding: 0px;

    }
    .avatarTUrl {
        width:40px;
        height: 40px;
    }
}

</style>