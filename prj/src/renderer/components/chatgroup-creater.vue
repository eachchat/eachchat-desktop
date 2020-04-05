<template>
        <el-container class="topContainer">
            <el-aside >
                <el-menu mode="vertical" v-show="!showBreadCrumbs">
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
                </el-container>
            </el-aside>
            <el-main>
                <el-header>

                </el-header>
                <el-main>
                    <ul class="selected-list">
                            <li v-for="(item, index) in selectedUsers" 
                            @click="selectedUserMenuItemClicked(item.id, item.displayName)" :key="index"> 
                            {{ item.displayName }}
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
.topContainer {
    height: 200px;
    width: auto;
}
.el-aside {
    width: auto;
}
.el-menu {
    width: auto;
}
ul {
    list-style: none;
    line-height: 30px;
    margin: 0;
    padding-left: 0px;
    font-size: 12px;
    font-family: sans-serif;
    .titleLi {
        margin-left: -25px;
        font-size: 12px;
        color: darkgray;
        &:hover{
            background-color: white;
        }
    }
    li {
        white-space: nowrap;
        overflow: hidden;
        padding-left: 20px;
        span {
            margin-left: 10px;
            cursor: default;
        }
        &:hover {
        background-color: #e3e3e3;
        }
    }
}
.avatarTUrl {
        width:40px;
        height: 40px;
}
</style>