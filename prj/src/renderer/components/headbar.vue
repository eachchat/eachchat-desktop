<template>
    <div class="HeadBar">
        <div class="Search">
            <input placeholder="搜索" class="search-input">
        </div>
        <div class="User">
            <img class="login-logo" :src="userIco">
        </div>
        <div class="Button">
            <Button class="login-btn-mini" on-click={this.minimize} />
            <Button class="login-btn-close" on-click={this.quitApp} />
        </div>
    </div>
</template>


<script>
import {ListAllGroup, InitServerAPI, setToken, GetUserinfo} from '../server/serverapi.js'

export default {
    name: 'headbar',
    data () {
        return {
            userIco: '',
        }
    },
    methods: {
    },
    components: {
    },
    created: function () {
        InitServerAPI('http', '139.198.15.253')
        GetUserinfo(this.$store.state.userAccount)
            .then((response) => {
                console.log(response.data.results[0].avatarOUrl)
                this.userIco = response.data.results[0].avatarOUrl
            }) 
    }
}
</script>

<style lang="scss" scoped>
    .HeadBar {
        position: absolute;
        height: 50px;
        width: 100%;
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
    }
    .Button {
        float: right;
        width:180;
        height: 40px;
        margin-top: 5px;
        overflow:hidden;
                
        .login-btn-mini {
            width: 40px;
            height: 32px;
            border: 0px;
            line-height: 40px;
            background-color: rgba(255,255,255,0);
            background-image: url("../assets/Login_Btn_Minimize_Normal.png");
        }
        .login-btn-close {
            width: 40px;
            height: 32px;
            border: 0px;
            line-height: 40px;
            background-color: rgba(255,255,255,0);
            background-image: url("../assets/Login_Btn_Close_Normal.png")
        }
    }
    .Search {
        width: 40%;
        height: 50px;
        display: inline-block;
        background: rgba(255,255,255,0);
        overflow:hidden;
        margin-left: 250px;
        border-radius: 5px;
        border: 0px;

        .search-input {
            border: 0px;
            width: 96%;
            height: 30px;
            border-radius: 5px;
            padding-left: 10px;
            margin-right: 5px;
            background-color:whitesmoke;
        }
        .search-input:hover {
            background-color: white;
        }
        .search-input:focus {
            background-color: white;
        }
    }
    .User {
        display: inline-block;
        overflow:hidden;
        width: 40px;
        height: 40px;
        margin-left: 30px;
        margin-top: 5px;
        margin-bottom: 5px;
    }
    .login-logo {
        width:40px;
        height: 40px;
    }
</style>
