<template>
    <el-container>
        <el-aside width="280px">
            <div class="list-header">
                <div class="search">
                    <input class="search-input" v-model="searchKey" @input="search" placeholder="搜索..." >
                </div><div class="search-action">
                        
                        <div class="search-delete">
                            <img class="icon-delete" v-show="searchKey" @click="searchDeleteClicked()" src="../../../static/Img/Navigate/searchDelete-20px@2x.png">
                            
                        </div><div class="search-search">
                    
                            <img class="icon-search" src="../../../static/Img/Chat/search-20px@2x.png" >
                        </div>
                        </div>
            </div>
            
            <div class="organization-view">
                <ul class="departments-list">
                    <li class="department"
                        v-for="(department, index) in departments"
                        @click="departmentMenuItemClicked(department)" 
                        :key="index">
                        <img class="department-icon" src="../../../static/Img/Organization/Navigate/organization_list@2x.png">
                        <div class="department-info">
                            <p class="department-name">{{ department.display_name }}</p>
                        </div>
                        <div align="center" class="item-arrow">
                            <img class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </li>
                </ul>
            </div>
        </el-aside>
        <el-container class="right-container">
            
            <organizationList :parentInfo="currentDepartment" :key="organizationListTimer"></organizationList>

        </el-container>
        <el-dialog title="创建群聊天" :visible.sync="dialogVisible" width="70%" @close="handleDialogClose()">
            <div class="el-dialog-content">
                <chatGroupCreater ref="chatGroupCreater" @getCreateGroupUsersSelected="getUsersSelected">
                </chatGroupCreater>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button class="dialog-confirm-button" type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>        
    </el-container>
</template>
<script>
import {services} from '../../packages/data/index.js';
import {Department} from '../../packages/data/sqliteutil.js';
import organizationList from './organization-list';
import chatGroupCreater from './chatgroup-creater';
import listHeader from './listheader';
export default {
    name: 'organization',
    data() {
        return {
            departments: [],

            dialogVisible: false,
            usersSelected: [],
            currentDepartment: {},
            organizationListTimer: '',

            searchKey:'',
            //arrowImageSrc: "../../../static/Image/right_arrow@2x.png"
        }
    },
    methods: {
        searchDeleteClicked(){
            this.searchKey = '';
        },
        search:function () {

        },
        getOrganizationBaseData:async function() {
            var rootDepartment = await Department.GetRoot();
            console.log(rootDepartment);
            var departments = await Department.GetSubDepartment(rootDepartment.department_id);
            console.log(departments);
            var tempDepartments = [];
            for(var i = 0; i < departments.length; i ++){
                tempDepartments[departments[i].show_order] = departments[i];
            }
            this.departments = tempDepartments;
            this.currentDepartment = this.departments[0];
            this.organizationListTimer = new Date().getTime();
        },
        departmentMenuItemClicked(department) {
            this.currentDepartment = department;
            this.organizationListTimer = new Date().getTime();
        },

        recentUsersMenuItemClicked:async function() {
            this.dialogVisible = true;
            /*
            if (this.showRecentUsersMenuItem) {
                this.arrowImageSrc = "../../../static/Image/right_arrow@2x.png";
            }else {
                this.recentUsers = await services.common.GetRecentUsers();
                this.arrowImageSrc = "../../../static/Image/down_arrow@2x.png";
            }
            this.showRecentUsersMenuItem = !this.showRecentUsersMenuItem;
            */
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
        },
        handleDialogClose() {
            this.$refs.chatGroupCreater.initData();
        }
    },
    components: {
        organizationList,
        chatGroupCreater,
        listHeader
    },
    created:async function() {
        await this.getOrganizationBaseData();

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
.list-header {
    width: 100%;
    //height: 56px;
    line-height: 56px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    margin: 0px 0px 0px 0px;
    display: block;
}

.departments-list {
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0;
    list-style: none;
}
.department {
    height: 60px;
    //border-bottom: 1px solid rgba(221, 221, 221, 1);
    
}
.department:hover {
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
    margin-top: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 1px;
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
.el-dialog {
    height: 250px;
    overflow: none;
}


.el-container {
    width: auto;
    height: 100%; 
    border:1px solid #eee;   
    background-color: white; 
    .el-aside {
        width: 150px;
        overflow: hidden;
        border-right: 1px solid rgb(221, 221, 221);
    }
    .right-container {
        width: 100%;
        height: 100%;  
        background-color: white; 
        border: hidden;
    }
}
.el-dialog-content {
    height: 300px;
    width: 600px;
    overflow: hidden;
}
.dialog-footer{
    text-align: center;
}
    .search {
        margin: 12px 0px 0px 16px;
        text-align: left;
        width: calc(100% - 86px);
        height: 32px;
        border: 1px solid rgb(221, 221, 221);
        border-right: none;
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        display: inline-block;
    }
    .search-action{
        border: 1px solid rgb(221, 221, 221);
        border-left: none;
        margin: 12px 16px 12px 0px;
        text-align: left;
        width: 52px;
        height: 32px;
        display: inline-block;
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
    }
    .search-delete{
        display: inline-block;
        height: 20px;
        width: 20px;
        font-size: 0px;
        margin: 6px 0px 6px 0px;
    }
    .search-search{
        display: inline-block;
        height: 20px;
        width: 30px;
        font-size: 0px;
        margin: 6px 0px 6px 0px;
    }
    .icon-delete{
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin-right: 2px;
    }
    .icon-search {
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin-right: 8px;
        color: rgb(51, 51, 51);
    }
    
    .icon-search:hover {
        display: inline-block;
        color: rgb(255,204,102);
    }
    
    .search-input {
        display: inline-block;
        position: absolute;
        text-indent: 10px;
        width: 194px;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: 'Microsoft YaHei';
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
        letter-spacing:1px;
    }
</style>