<template>
        <el-container class="topContainer">
            <el-aside >
                <div class="list-content" v-show="!showBreadCrumbs">
                    <div class="organization-view">
                        <div class="item" @click="organizationMenuItemClicked()">
                            <img class="item-icon" src="../../../static/Image/organization_list@2x.png">
                            <div class="item-info">
                                <p class="item-title">组织架构</p>
                            </div>
                            <div class="item-arrow">
                                <img class="right-arrow" src="../../../static/Image/right_arrow@2x.png">
                            </div>
                        </div>
                        <ul class="organization-menu-list" v-show="showOrganizationMenuItem">
                            <li class="department"
                            v-for="(department, index) in departments"
                            @click="departmentMenuItemClicked(department.id, department.displayName)" 
                            :key="index">
                            <img class="department-icon" src="../../../static/Image/department_list@2x.png">
                            <div class="department-info">
                                <p class="department-name">{{ department.displayName }}</p>
                            </div>
                            <div align="center" class="item-arrow">
                                <img class="right-arrow"  src="../../../static/Image/right_arrow@2x.png">
                            </div>
                        </li>
                        </ul>
                    </div>
                    <div class="recentUsers-view">
                        <div class="item" @click="recentUsersMenuItemClicked()">
                            <img class="item-icon" src="../../../static/Image/recentUsers_list@2x.png">
                            <div class="item-info">
                                <p class="item-title">常用联系人</p>
                            </div>
                            <div class="item-arrow">
                                <img class="right-arrow" src="../../../static/Image/right_arrow@2x.png">
                            </div>
                        </div>
                        <ul class="recentUsers-menu-list" v-show="showRecentUsersMenuItem">
                        </ul>
                    </div>
                </div>
                <el-container class="organization-check-view" v-show="showBreadCrumbs">
                    <el-header height="60px" class="aside-header">
                        <el-breadcrumb separator="/">
                            <el-breadcrumb-item v-for="(item, index) in breadCrumbs" :key="index">
                                <a href="javascript:void(0)" 
                                @click="departmentBreadCrumbsClicked(item.id, item.name, index)">
                                {{ item.name }}</a>
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                    </el-header>
                    <el-main>
                        <ul class="department-list" v-show="departments.length">
                            <li class="department" v-for="(item, index) in departments" 
                            @click="departmentMenuItemClicked(item.id, item.displayName)" :key="index"> 
                            <img class="department-icon" src="../../../static/Image/department_list@2x.png">
                            <div class="department-info">
                                <p class="department-name">{{ item.displayName }}</p>
                            </div>
                            <div align="center" class="item-arrow">
                                <img class="right-arrow"  src="../../../static/Image/right_arrow@2x.png">
                            </div>
                            </li>
                        </ul>
                        <div class="users-list-header">
                            <input type="checkBox" class="checkBox-all" :checked="currentDepartmentSelectAll" 
                            @click="currentDepartmentSelectAllClicked()"> 全选
                            <p class="checkBox-label">已选{{ currentDepartmentSelectedUsers.length }}人</p>
                        </div>
                        <ul class="user-list" v-show="users.length">
                            <li class="user" v-for="(item, index) in users" :key="index"> 
                            <img class="user-avatarTUrl" :src="item.avatarTUrl">
                            <div class="user-info">
                                <p class="user-name">{{ item.displayName }}</p>
                            </div>
                            <input type="checkBox" class="user-checkBox" :checked="item.checkState"
                            @click="userCheckBoxClicked(item.id)">
                            
                            </li>
                        </ul>
                    </el-main>
                </el-container>
                <!-- <el-menu mode="vertical" v-show="!showBreadCrumbs">
                    <el-submenu index="organization-item" >
                        <template slot="title"><i class="el-icon-menu"></i> 组织架构</template>
                        <el-menu-item-group>
                            <el-menu-item v-for="(item, index) in departments" 
                            @click="departmentMenuItemClicked(item.id, item.displayName)" :key="index">
                            {{ item.displayName }}</el-menu-item>
                        </el-menu-item-group>
                    </el-submenu>
                    <el-submenu index="recent-menu">
                        <template slot="title"><i class="el-icon-menu"></i> 最近联系人</template>
                        <el-menu-item-group>
                            <el-menu-item>测试用户</el-menu-item>
                            <el-menu-item>测试用户</el-menu-item>
                            <el-menu-item>测试用户</el-menu-item>
                            <el-menu-item>测试用户</el-menu-item>
                        </el-menu-item-group>
                    </el-submenu>
                </el-menu>
                <el-container class="aside-container" v-show="showBreadCrumbs">
                    <el-header height="60px" class="aside-header">
                        <el-breadcrumb separator="/">
                            <el-breadcrumb-item v-for="(item, index) in breadCrumbs" :key="index">
                                <a href="javascript:void(0)" 
                                @click="departmentBreadCrumbsClicked(item.id, item.name, index)">
                                {{ item.name }}</a>
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                        <div>
                            <input type="checkBox" :checked="currentDepartmentSelectAll" 
                            @click="currentDepartmentSelectAllClicked()"> 全选
                        </div>
                    </el-header>
                    <el-main>
                        <ul class="department-list" v-show="departments.length">
                            <li v-for="(item, index) in departments" 
                            @click="departmentMenuItemClicked(item.id, item.displayName)" :key="index"> 
                            {{ item.displayName }}
                            </li>
                        </ul>
                        <ul class="user-list" v-show="departments.length">
                            <li v-for="(item, index) in users" :key="index"> 
                            <img class="avatarTUrl" :src="item.avatarTUrl">
                            {{ item.displayName }}
                            <input type="checkBox" :checked="item.checkState" 
                            @click="userCheckBoxClicked(item.id)">
                            
                            </li>
                        </ul>
                    </el-main>
                </el-container> -->
            </el-aside>
            <el-main>
                <el-header>
                    <div>已选{{ selectedUsers.length }}人
                    </div>
                </el-header>
                <el-main>
                    <ul class="user-list" v-show="selectedUsers.length">
                            <li class="select-user" v-for="(item, index) in selectedUsers" :key="index"> 
                            <img class="user-avatarTUrl" :src="item.avatarTUrl">
                            <div class="user-info">
                                <p class="user-name">{{ item.displayName }}</p>
                            </div>
                            <div class="item-arrow">
                                <img class="close-icon" src="../../../static/Image/close_icon@2x.png" 
                                    @click="selectedUserMenuItemClicked(item.id, item.displayName)" :key="index">
                            </div>
                            </li>
                    </ul>
                </el-main>
            </el-main>
        </el-container>

</template>
<script>
import {ServerApi} from '../server/serverapi';
export default {
    name: 'chatgroup-creater',
    data () {
        return {
            serverApi: new ServerApi(),
            showBreadCrumbs: false,
            selectedUsers: [],
            recentUsers: [],
            breadCrumbs: [],
            allDepartments: [],
            allUsers: [],
            users: [],
            departments: [],
            showOrganizationMenuItem: false,
            showRecentUsersMenuItem: false,
        }
    },
    props: {
        disableUsers: {
            type: Array,
            default: []
        }
    },
    watch: {
        'selectedUsers':function() {
            this.$emit('getCreateGroupUsersSelected', this.selectedUsers);
        }
    },
    computed: {
        currentDepartmentSelectedUsers: function() {
            var temp = [];
            for (let i = 0; i < this.selectedUsers.length; i++) {
                const element = this.selectedUsers[i];
                if (this.users.indexOf(element) != -1){
                    temp.push(element);
                }
            }
            return temp;
        },
        currentDepartmentSelectAll: function() {
            var selectAll = true;
            console.log("test");
            console.log(this.users);
            for (let i = 0; i < this.users.length; i++) {
                const user = this.users[i];
                if (this.selectedUsers.indexOf(user)==-1){
                    selectAll = false;
                    break;
                }
            }
            return selectAll;
        }
    },
    methods: {
        userCheckBoxClicked(id) {
            console.log("clicked");
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                
                if (user.id == id) {
                    if (user.checkState) {
                        this.allUsers[i].checkState = false;
                        //this.userSelected.$remove(user);
                        for (var i = 0; i < this.selectedUsers.length; i ++) {
                            var user1 = this.selectedUsers[i];
                            if (user1.id == id) {
                                this.selectedUsers.splice(i, 1);
                                break;
                            }
                        }
                    } else {
                        this.allUsers[i].checkState = true;
                        this.selectedUsers.push(user);
                    }
                    break;
                }
            }
            return true;
        },
        selectedUserMenuItemClicked(id) {
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                
                if (user.id == id) {
                    this.allUsers[i].checkState = false;
                    for (var i = 0; i < this.selectedUsers.length; i ++) {
                        var user1 = this.selectedUsers[i];
                        if (user1.id == id) {
                            this.selectedUsers.splice(i, 1);
                            break;
                        }
                    }
                    break;
                }
            }
        },
        departmentMenuItemClicked(id, name) {
            if (!this.showBreadCrumbs) {
                this.showBreadCrumbs = true;
            }
            var tempDepartments = [];
            for (var i = 0; i < this.allDepartments.length; i ++) {
                var department = this.allDepartments[i];
                if (department.parentId == id) {
                    tempDepartments.push(department);
                }
            }
            var tempManagers = [];
            var tempUsers = [];
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                if (user.departmentId == id) {
                    tempUsers.push(user);
                }
            }
            this.departments = tempDepartments;
            this.users = tempUsers;
            this.breadCrumbs.push({
                name: name,
                id: id
            });
        },
        departmentBreadCrumbsClicked(id, name, index) {
            var tempDepartments = [];
            for (var i = 0; i < this.allDepartments.length; i ++) {
                var department = this.allDepartments[i];
                if (department.parentId == id) {
                    tempDepartments[department.showOrder] = department;
                }
            }
            var tempUsers = [];
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                if (user.departmentId == id) {
                    tempUsers.push(user);
                }
            }
            this.departments = tempDepartments;
            this.users = tempUsers;
            this.breadCrumbs.splice(index + 1, this.breadCrumbs.length - index + 1);
            if (index == 0) {
                console.log(this.departments);
                this.showBreadCrumbs = false;
            }
        },
        currentDepartmentSelectAllClicked() {
            var temp = true;
            if (!this.currentDepartmentSelectAll){
                for (let i = 0; i < this.users.length; i++) {
                    const element = this.users[i];
                    for (var j = 0; j < this.allUsers.length; j ++) {
                        var user = this.allUsers[j];
                        if (user.id == element.id) {
                            if (element.checkState == false){
                                this.allUsers[j].checkState = true;
                                this.users[i].checkState = true;
                                // 添加到选中列表中
                                if (this.selectedUsers.indexOf(this.users[i]) == -1) {
                                    this.selectedUsers.push(this.users[i]);
                                }
                                break;
                            }
                        }
                    }
                }
            }else {
                for (let i = 0; i < this.users.length; i++) {
                    const element = this.users[i];
                    for (var j = 0; j < this.allUsers.length; j ++) {
                        var user = this.allUsers[j];
                        if (user.id == element.id) {
                            if (element.checkState == true){
                                this.allUsers[j].checkState = false;
                                this.users[i].checkState = false;
                                // 选中列表中移除
                                if (this.selectedUsers.indexOf(element) != -1){
                                    this.selectedUsers.splice(this.selectedUsers.indexOf(element), 1);
                                }
                                break;
                            }
                        }
                    }
                }
            }
            return temp;
        },
        organizationMenuItemClicked() {
            this.showOrganizationMenuItem = !this.showOrganizationMenuItem;
        },
        recentUsersMenuItemClicked() {
            this.showRecentUsersMenuItem = !this.showRecentUsersMenuItem;
        }
    },
    created () {
        console.log('createchatgroup');
        var _this = this;
        this.serverApi.GetAllDepartmentInfo()
        .then(function(res){
            _this.allDepartments = res.data;
            console.log(_this.allDepartments);
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
                console.log(_this.allUsers);
                for (var i = 0; i < _this.allUsers.length; i ++) {
                    var user = _this.allUsers[i];
                    // if (this.disableUsers){
                    //     if (this.disableUsers.indexOf(user) != -1){
                    //         user.disabled = true;
                    //     }else {
                    //         user.disabled = false;
                    //     }
                    // }
                    
                    user.checkState = false;
                    _this.allUsers[i] = user;
                }
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
    }
}
</script>
<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
.el-aside{
    width: 300px;
    
    border-right: 1px solid rgb(221, 221, 221);
}
.aside-header {
    padding: 0px;
    border-bottom: 1px solid rgb(221, 221, 221);
}
.el-main {
    padding: 0px;
}
.el-breadcrumb {
        display: block;
        margin-left: 16px;
        padding-top: 20px;
        font-size: 14px;
        line-height: 20px;
        padding-left: 0px;
}
.list-content {
    height: 100%;
    width: 100%;
    margin: 0px;
    padding: 0px;
    overflow-x: hidden;
    
}

.item {
    height: 60px;
    cursor: pointer;
}

.item.active {
    height: 60px;
    background-color: rgb(101, 115, 128);
}
.item-icon {
    width: 36px;
    height: 36px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 0px;
    margin-bottom: 12px;
}
.item-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 92px);
}
.item-title {
    text-align: left;
    height: 40%;
    width: 70%;
    margin-top: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
}
.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 5px;
    margin-top: 25px;
    margin-right: 0px;
    margin-bottom: 0px;
    width: 7px;
    height: 13px;
}
.close-icon {
    margin-left: 6.5px;
    margin-top: 25.5px;
    margin-right: 0px;
    margin-bottom: 0px;
    width: 10px;
    height: 10px;
}
// .down-arrow {
//     margin-left: 6.5px;
//     margin-top: 25.5px;
//     margin-right: 0px;
//     margin-bottom: 0px;
//     width: 7px;
//     height: 13px;
// }
.organization-check-view {
    height: 100%;
    width: 100%;
    margin: 0px;
    padding: 0px;
    overflow-x: hidden;
    
}
.department-list {
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0px;
    list-style: none;
    border-bottom: 1px solid rgb(221, 221, 221);
    cursor: pointer;
}
.users-list-header {
    height: 52px;
    width: 100%;
    margin: 0px;
    padding: 0px;
    border-bottom: 1px solid rgb(221, 221, 221);
}
.checkBox-all{
    display: inline-block;
    margin-left: 16px;
}
.checkBox-label {
    display: inline-block;
    margin-left: 153px;
    color: rgb(153, 153, 153);
    font-size: 14px;
    text-align: right;
    line-height: 20px;
}
.user-list {
    width: 100%;
    height: 100%;
    padding-left: 0px;
    margin: 0px;
    list-style: none;
    cursor: pointer;
}
.user {
    height: 60px;
    border-bottom: 1px solid rgb(221, 221, 221);
}
.select-user {
    height: 60px;
}
.user-avatarTUrl{
    width: 36px;
    height: 36px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 12px;
    margin-right: 0px;
    margin-bottom: 12px;
    border-radius: 3.6px;
}
.user-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 205px;
}
.user-name {
    margin-top: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
}
.user-checkBox {
    display: inline-block;
    vertical-align: top;
    width: 20px;
    height: 20px;
    margin-left: 0px;
    margin-top: 20px;
    margin-bottom: 20px;
}
.organization-menu-list {
    width: 100%;
    height: 100%;
    padding-left: 0px;
    margin: 0px;
    list-style: none;
    cursor: pointer;
    //border-top: 1px solid rgb(221, 221, 221);
}

.department {
    height: 60px;
}
.department-icon {
    width: 36px;
    height: 36px;
    display: inline-block;
    margin-left: 36px;
    margin-top: 12px;
    margin-right: 0px;
    margin-bottom: 12px;
    border-radius: 3.6px;
}
.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 117px);
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
.topContainer {
    height: 200px;
    width: auto;
}

// ul {
//     list-style: none;
//     line-height: 30px;
//     margin: 0;
//     padding-left: 0px;
//     font-size: 12px;
//     font-family: sans-serif;
//     .titleLi {
//         margin-left: -25px;
//         font-size: 12px;
//         color: darkgray;
//         &:hover{
//             background-color: white;
//         }
//     }
//     li {
//         white-space: nowrap;
//         overflow: hidden;
//         padding-left: 20px;
//         span {
//             margin-left: 10px;
//             cursor: default;
//         }
//         &:hover {
//         background-color: #e3e3e3;
//         }
//     }
// }
.avatarTUrl {
        width:40px;
        height: 40px;
}
</style>