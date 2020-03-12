<template>
    <el-container>
        <el-aside width="200px">
            <div class="header">
                <div class="organization-title">组织</div>
            </div>
            <el-menu mode="vertical">
                <el-menu-item index="organization-item">
                    <i class="el-icon-menu"> 组织架构</i>
                </el-menu-item>
                <div class="other-title">其他</div>
                <el-menu-item index="channel-item">
                    <i class="el-icon-menu"> 我的频道</i>
                    
                </el-menu-item>
                <el-menu-item>
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
            <el-header height="40px">Header</el-header>
            <el-main>Main</el-main>
        </el-container>
    </el-container>
</template>
<script>
import { ServerApi } from '../server/serverapi';
export default {
    name: 'organization',
    data() {
        return {
            serverapi: undefined,
        };
    },
    methods: {

    },
    created() {
        console.log(this.$store.state.accesstoken);
        
        this.serverapi = new ServerApi('http', '139.198.15.253');
        this.serverapi.m_accesstoken = this.$store.state.accesstoken;
        this.serverapi.GetDepartmentInfo(100, 1, 0)
        .then((response) => {
            console.log(response);

        });
        this.serverapi.GetUserinfo(10000, 1, 0)
        .then((response) => {
            console.log(response);
        });
    
        
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