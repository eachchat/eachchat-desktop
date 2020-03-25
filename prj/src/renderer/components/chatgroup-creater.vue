<template>
        <el-container class="topContainer">
            <el-aside >
                <el-menu mode="vertical" v-show="!showBreadCrumbs">
                    <el-submenu index="organization-item" >
                        <template slot="title"><i class="el-icon-menu"></i> 组织架构</template>
                        <el-menu-item-group>
                            <el-menu-item v-for="item in departments" 
                            @click="departmentMenuItemClicked(item.id, item.displayName)">{{ item.displayName }}</el-menu-item>
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
                            <el-breadcrumb-item v-for="(item, index) in breadCrumbs">
                                <a href="javascript:void(0)" 
                                @click="departmentBreadCrumbsClicked(item.id, item.name, index)">
                                {{ item.name }}</a>
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                    </el-header>
                    <el-main>
                        <ul class="department-list" v-show="departments.length">
                            <li v-for="item in departments" 
                            @click="departmentMenuItemClicked(item.id, item.displayName)"> 
                            {{ item.displayName }}
                            </li>
                        </ul>
                        <ul class="user-list" v-show="departments.length">
                            <li v-for="item in users"> 
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
                            <li v-for="item in usersSelected" 
                            @click="departmentMenuItemClicked(item.id, item.displayName)"> 
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
            usersSelected: [],
            userSelectedState: false,
            recentUsers: [],
            breadCrumbs: [],
            allDepartments: [],
            allUsers: [],
            users: [],
            departments: [],
        }
    },
    watch: {
        'usersSelected':function() {
            this.$emit('getCreateGroupUsersSelected', this.usersSelected);
        }
    },
    computed: {
        
    },
    methods: {
        userCheckBoxClicked(id) {
            console.log("clicked");
            
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                
                if (user.id == id) {
                    console.log(user);
                    console.log(this.usersSelected);
                    if (user.checkState) {
                        this.allUsers[i].checkState = false;
                        for (var i = 0; i < this.usersSelected.length; i ++) {
                            var user1 = this.usersSelected[i];
                            if (user1.id == id) {
                                this.usersSelected.splice(i, 1);
                                break;
                            }
                        }
                    } else {
                        this.allUsers[i].checkState = true;
                        this.usersSelected.push(user);
                    }
                    break;
                }
            }
            
            console.log(this.usersSelected);
            return true;
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