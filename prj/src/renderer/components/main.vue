<template>
    <el-container class="mainpage">
        <el-aside class="navigate-panel" width="64px">
            <div class="User">
                <img class="login-logo" :src="userIco">
            </div>
            <el-menu
                class="nav-menu">
                <el-menu-item
                    class="nav-item"
                    v-for="(tabitem, index) in Navigate"
                    v-bind:key="index"
                    @click="menuClicked(index, tabitem.name, tabitem.link, tabitem.view)"
                    :class="{active: index===curindex}"
                    >
                    <i :class="getCurNavIcon(index)"></i>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main class="tabcontainer">
            <component :is="curView"></component>
        </el-main>
    </el-container>
</template>

<script>
import loginpage from './name-login.vue'
import organization from './organization.vue'
import ChatContent from './chat-content.vue'

import {ServerApi} from '../server/serverapi.js'

export default {
    name: 'mainpage',
    data () {
        return {
            userIco: '',
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
                },
                {
                    text: "更多",
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
            var endding = " active"
            if(cur_index != this.curindex) {
                endding = ""
            }
            if(cur_index === 0)
            {
                return "el-icon-s-comment" + endding
            }
            else if(cur_index === 1)
            {
                return "el-icon-share" + endding
            }
            else{
                return "el-icon-more-outline" + endding
            }
        }
    },
    components: {
        loginpage,
        organization,
        ChatContent
    },
    created: function () {
        let filter = [{'field':'email', 'operator':'co', 'logic':1, 'value':this.$store.state.userAccount}];

        this.serverapi = new ServerApi('http', '139.198.15.253');
        this.serverapi.m_accesstoken = this.$store.state.accesstoken;
        this.serverapi.GetUserinfo(filter, 50, 1, 0)
            .then((response) => {
                this.$store.commit("setUserInfo", response.data.results[0]);
                this.userIco = response.data.results[0].avatarOUrl;
            }) 
    }
}
</script>

<style lang="scss" scoped>
    .mainpage {
        margin: 0 0 0 0;
        width: 100%;
        height: 100%;
    }

    .nav-menu {
        width: 64px;
        height: 100%;
        padding: 0px;
        margin: 0px;
        background: rgb(61, 62, 73);
    }

    .navigate-panel {
        height: 100%;
        background: rgb(61, 62, 73);
        overflow: hidden;
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
    }

    .User {
        width: calc(100%-6px);
        height: 40px;
        text-align: center;
        line-height: 40px;
        margin: 20px 0px 10px 0px;
    }

    .login-logo {
        width: 40px;
        height: 40px;
    }

    .nav-item {
        height: 60px;
        text-align: center;
        line-height: 60px;
        background-color: rgb(61, 62, 73);
    }

    .nav-item.active {
        height: 60px;
        text-align: center;
        color: rgba(255, 255, 255, 1);
        line-height: 60px;
        background-color: rgb(61, 62, 73);
    }

    .nav-item:hover {
        height: 60px;
        text-align: center;
        line-height: 60px;
        background-color: rgb(61, 62, 73);
    }

    .el-icon-s-comment.active {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-s-comment:hover {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-s-comment {
        color:rgba(255, 255, 255, 0.3);
    }

    .el-icon-share {
        color:rgba(255, 255, 255, 0.3);
    }

    .el-icon-share.active {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-share:hover {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-more-outline {
        color:rgba(255, 255, 255, 0.3);
    }

    .el-icon-more-outline:hover {
        color:rgba(255, 255, 255, 1);
    }

    .el-icon-more-outline.active {
        color:rgba(255, 255, 255, 1);
    }

    .tabcontainer {
        padding: 0px;
        width: calc(100% - 70px);
        height: 100%;
        vertical-align: top;
        margin: 0px;
        overflow-y:hidden;
        overflow-x: hidden;
    }

</style>
