<template>
    <div>

    </div>
</template>

<script>
import {CallChat} from "../../packages/data/callchat.js"
export default {
    data(){
        return{

        }
    },
    methods:{

    },
    mounted(){
        console.log("videochat mounted")
        let callChat = new CallChat();
        callChat.createMatrix();
    }
}
</script>

<style>

</style>