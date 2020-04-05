<template>
    <el-container>
        <el-aside width="200px">
            <div class="header">
                <div class="organization-title">组织</div>
            </div>
            <el-menu mode="vertical">
                <el-menu-item index="organization-item" @click="organizationMenuItemClicked()">
                    <i class="el-icon-menu"> 组织架构</i>
                </el-menu-item>
                <div class="other-title">其他</div>
                <el-menu-item index="channel-item" @click="myChannelMenuItemClicked()">
                    <i class="el-icon-menu" > 我的频道</i>
                    
                </el-menu-item>
                <el-menu-item index="focus">
                    <i class="el-icon-view"> 特别关注</i>
                </el-menu-item>
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
        </el-aside>
        <el-container class="right-container">
            
                <component :is="curView"></component>
            
        </el-container>
        <el-dialog
            title="提示"
            :visible.sync="dialogVisible"
            width="70%"
            :before-close="handleClose">
            <div>
                <chatGroupCreater>
                </chatGroupCreater>
            </div>
            
        </el-dialog>
    </el-container>
</template>
<script>
import { ServerApi } from '../server/serverapi';
import organizationList from './organization-list';
import chatGroupCreater from './chatgroup-creater';
export default {
    name: 'organization',
    data() {
        return {
            curindex: 0,
            curView: 'organizationList',
            Navigate:[
                {    
                    link: "/organization-list",
                    view: "organizaionList"
                }
            ],
            dialogVisible: false,
        }
    },
    methods: {
        organizationMenuItemClicked() {
            this.curindex = 0;
            this.curView = "organizationList";
        },
        myChannelMenuItemClicked() {
            this.dialogVisible = true;
        },
        focusMenuItemClicked() {

        },
        recentMenuItemClicked() {

        }
    },
    components: {
        organizationList,
        chatGroupCreater,
    },
    created() {
        
    }
}
</script>

<style lang="scss" scoped>


.el-container {
    width: auto;
    height: 100%; 
    border:1px solid #eee;   
    background-color: white; 
    .el-aside {
        background-color: #eee;
        width: 150px;
        .el-menu-item {
            width: auto;
            
        }
        .header{
            width: auto;
            height: 40px;
        }
        .organization-title {
            width: auto;
            height: 20px;
            padding-top: 10px;
            padding-left: 10px;
            font-size: 20px;
            cursor: default;
            background-color: rgb(243, 243, 243);
        }
        .other-title {
            width: auto;
            height: 30px;
            padding-top: 15px;
            padding-left: 10px;
            font-size: 15px;
            cursor: default;
            background-color: rgb(243, 243, 243);
        }
    }
    .right-container {
        width: auto;
        height: 100%; 
        border:1px solid #eee;   
        background-color: white; 
        .el-header {
            background-color: rgb(243, 243, 243);
        }
    }
}
</style>