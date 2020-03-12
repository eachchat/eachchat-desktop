<template>
    <el-container class="mainpage">
        <el-header class="headbar" height="50px">
            <HeadBar/>
        </el-header>
        <el-container class="main-container">
            <el-aside class="navigate-panel" width="68px">
                <el-menu
                    default-active="0"
                    class="nav-menu"
                    @open="handleOpen"
                    @close="handleClose"
                    active-text-color="#ffd04b">
                    <el-menu-item
                        class="nav-item"
                        v-for="(tabitem, index) in Navigate"
                        v-bind:key="index"
                        @click="menuClicked(index, tabitem.name, tabitem.link, tabitem.view)"
                        :class="{active: index===curindex}"
                        >
                        <i :class="getCurNavIcon(index)"></i>
                    </el-menu-item>
                    <el-menu-item class="nav-item">
                        <i class="el-icon-more-outline"></i>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main class="tabcontainer">
                <component :is="curView"></component>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
import loginpage from './name-login.vue'
import organization from './organization.vue'
import HeadBar from './headbar.vue'
import ChatContent from './chat-content.vue'

import {ServerApi} from '../server/serverapi.js'

export default {
    name: 'mainpage',
    data () {
        return {
            curindex: 0,
            curView: 'ChatContent',
            serverapi: new ServerApi('http', '139.198.15.253'),
            Navigate:[
                {    
                    text: "聊天",
                    name: "chat",
                    link: "/chat",
                    view: "ChatContent"
                },
                {
                    text: "组织",
                    name: "contact list",
                    link: "/organization",
                    view: "organization"   
                }
            ]
        }
    },
    methods: {
        menuClicked (cur_index, cur_name, cur_link, cur_view) {
            this.curindex = cur_index;
            this.curView = cur_view;
            console.log(cur_index);
            console.log(cur_name);
            console.log(cur_link);
        },
        getCurNavIcon (cur_index) {
            if(cur_index === 0)
            {
                return "el-icon-s-comment"
            }
            else if(cur_index === 1)
            {
                return "el-icon-share"
            }
            else{
                return "el-icon-more-outline"
            }
        }
    },
    components: {
        loginpage,
        organization,
        HeadBar,
        ChatContent
    },
    created: function () {
        //setToken(this.$store.state.accesstoken, this.$store.state.refreshtoken)
        // GetUserinfo(this.$store.state.userAccount)
        //     .then((response) => {
        //         console.log(response.data.results)
        //     }) 
    }
}
</script>

<style lang="scss" scoped>
    .mainpage {
        overflow:hidden;
        margin: 0 0 0 0;
        width: 100%;
        height: 100%;
    }

    .nav-menu {
        width: 60;
        height: 100%;
        padding: 0px;
        margin: 0px;
        background: rgb(49, 51, 72);
    }

    .main-container {
        overflow: hidden;
        width: 100%;
        height: calc(100% - 50px);
    }

    .navigate-panel {
        width: 68px;
        height: 100%;
        background: rgb(49, 51, 72);
    }

    .nav-item {
        overflow: hidden;
        width: 60;
        height: 60px;
        text-align: center;
        line-height: 60px;
    }

    .el-menu-item.is-active {
        background-color: #247bb4;
    }

    .tabcontainer {
        padding: 0px;
        width: calc(100% - 70px);
        height: 100%;
        vertical-align: top;
    }

    .headbar {
        width: 100%;
        background: rgb(70, 77, 116);
        margin: 0 0 0 0;
        line-height: 50px;
        padding: 0px;
    }

</style>
