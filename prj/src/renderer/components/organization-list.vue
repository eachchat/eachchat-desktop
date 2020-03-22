<template>
    <el-container>
        <el-header height="40px">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item v-for="(item, index) in breadCrumbs">
                    <a href="javascript:void(0)" 
                    @click="departmentBreadCrumbsClicked(item.id, item.name, index)">
                    {{ item.name }}</a>
                </el-breadcrumb-item>
            </el-breadcrumb>
        </el-header>
        <el-main>
            <el-menu mode="vertical">
                <el-menu-item v-show="departments.length" v-for="item in departments" 
                @click="departmentMenuItemClicked(item.id, item.displayName)">
                    <i> {{ item.displayName }}</i>
                </el-menu-item>
                <div class="other-title" v-show="managers.length">管理</div>
                <el-menu-item v-show="managers.length" v-for="item in managers">
                    <i> <img class="avatarTUrl" :src="item.avatarTUrl"> {{ item.displayName }} {{ item.title }}</i>
                </el-menu-item>
                <div class="other-title" v-show="users.length">成员</div>
                <el-menu-item v-show="users.length" v-for="item in users">
                    <i> <img class="avatarTUrl" :src="item.avatarTUrl"> {{ item.displayName }}</i>
                </el-menu-item>
            </el-menu>
        </el-main>
    </el-container>
</template>
<script>
import {ServerApi} from '../server/serverapi';
export default {
    name: 'organizationList',
    data () {
        return {
            serverApi: new ServerApi(),
            current_level: 1,
            breadCrumbs: [],
            allDepartments: [],
            allUsers: [],
            departments: [],
            users: [],
            managers: [],
        }
    },
    methods: {
        departmentBreadCrumbsClicked(id, name, index) {
            var tempDepartments = [];
            for (var i = 0; i < this.allDepartments.length; i ++) {
                var department = this.allDepartments[i];
                if (department.parentId == id) {
                    tempDepartments[department.showOrder] = department;
                }
            }
            var tempManagers = [];
            var tempUsers = [];
            for (var i = 0; i < this.allUsers.length; i ++) {
                var user = this.allUsers[i];
                if (user.departmentId == id) {
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
        }

    },
    created () {
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
                    if (user.departmentId == tempRootDepartment.id) {
                        tempUsers.push(user);
                        if (user.manager) {
                            tempManagers.push(user);
                        }
                    }
                }
                console.log(tempDepartments);
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
.el-container {
    width: auto;
    height: 100%; 
    .el-header {
    width: auto;
    background-color: rgb(243, 243, 243);
    .el-breadcrumb {
        padding: 10px;
        height: 20px;
    }
    }
    .el-main {
        width: auto;
        height: 100%;
    }
    .avatarTUrl {
        width:40px;
        height: 40px;
    }
}

</style>