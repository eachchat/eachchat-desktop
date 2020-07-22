<template>
    <div class="toastMessageBox" v-if="show" :style="boxStyle">
        <img class="message-icon" :src="imageSrc">
        <p class="message-content">{{ message }}</p>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    name: 'toastMessage',
    data () {
        return {
            message: '',
            show: false,
            type: '',
            imageSrc: '../../../static/Img/Login/toastSuccess@2x.png',
            
            boxStyle:{},
        }
    },
    watch:{
        type: function(){
            // if(this.boxWidth != 0){
            //     this.boxStyle.width = this.boxWidth.toString() + "px";
            // }
            // var position = this.calcImgPosition();
            // this.boxStyle.top = position.top.toString() + "px";
            // this.boxStyle.left = position.left.toString() + "px";
            if (this.type == 'error'){
            this.imageSrc = '../../../static/Img/Login/toastError@2x.png';
            }
            if (this.type == 'success'){
            this.imageSrc = '../../../static/Img/Login/toastSuccess@2x.png';
            }
        }
    },
    created(){

    },
    mounted:function(){
        
    }
}
</script>

<style lang='scss' scoped>
.toastMessageBox{
    position: absolute;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    background-color:white;
    height: 60px;
    box-shadow:0px 0px 15px 0px rgba(103,103,103,0.24);
    border-radius:4px;
    .message-icon{
        display: inline-block;
        width: 24px;
        height: 24px;
        margin-top: 18px;
        margin-bottom: 18px;
        margin-left: 18px;
    }
    .message-content{
        display: inline-block;
        margin-left: 16px;
        margin-right: 28px;
        margin-top: 19px;
        margin-bottom: 19px;
        height:22px;
        font-size:16px;
        font-weight:500;
        color:rgba(0,0,0,1);
        line-height:22px;
        letter-spacing:2px;
        vertical-align: top;
        text-align: left;
    }
}
</style>