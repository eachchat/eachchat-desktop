<template>
    <div class="mainpage">
        <div class="headbar">
            <HeadBar/>
        </div>
        <div class="navigate-panel">
            <ul class="nav-item">
                <li class="nav-title"
                    v-for="(tabitem, index) in Navigate"
                    v-bind:key="index"
                    @click="menuClicked(index, tabitem.name, tabitem.link, tabitem.view)"
                    :class="{active: index===curindex}"
                    >{{tabitem.text}}
                </li>
            </ul>
        </div>
        <div class="tabcontent">
            <component :is="curView"></component>
        </div>
    </div>
</template>

<script>
import loginpage from './name-login.vue'
import organization from './organization.vue'
import HeadBar from './headbar.vue'
import ChatContent from './chat-content.vue'

import {ListAllGroup, InitServerAPI, setToken, GetUserinfo} from '../server/serverapi.js'

export default {
    name: 'mainpage',
    data () {
        return {
            curindex: 0,
            curView: 'ChatContent',
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
                    view: "loginpage"   
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
        }
    },
    components: {
        loginpage,
        organization,
        HeadBar,
        ChatContent
    },
    created: function () {
        setToken(this.$store.state.accesstoken, this.$store.state.refreshtoken)
        InitServerAPI('http', '139.198.15.253')
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
    .navigate-panel {
        display: inline-block;
        float: left;
        vertical-align: top;
        width: 68px;
        height: 100%;
        background: rgb(49, 51, 72);
        border-bottom: 1px solid #dddddd;
    }
    .tabcontent {
        display: inline-block;
        float: left;
        vertical-align: top;
        width: calc(100% - 68px);
        height: 100%;
    }

    .nav-item {
        list-style: none;
        width: 60;
        height: 100%;
        padding: 0px;
        margin: 0px;
    }

    .nav-title {
        width: 60;
        height: 120px;
        text-align: center;
        line-height: 120px;
        color: white;
        background-color: rbga(255, 255, 255, 0)
    }
    
    .nav-title.active,.nav-title:active {
        border-left: 2px solid #36acf4;
        color: #36acf4;
    }

    .headbar {
        width: 100%;
        height: 50px;
        background: rgb(70, 77, 116);
        margin: 0 0 0 0;
        line-height: 50px;
    }

</style>
