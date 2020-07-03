<template>
    <div class="personalCenter-view" :style="pagePosition">
        <div class="personalCenterBaseInfo-view">
            <img class="personalCenter-icon" :src="userInfo.avatar_t_url">
            <div class="personalCenter-baseInfo">
                
                <p class="personalCenter-name">{{ userInfo.user_display_name }}</p>
                <div class="personalCenter-state">
                    <input class="personalCenter-stateInput" v-model="stateInput" @keyup.enter="stateChangeConfirm()">
                    <img class="personalCenter-stateSelectArrow"  @click="stateListArrowClicked()" src="../../../static/Img/personalCenter/statusArrow-20px@2x.png">
                </div>
            </div>
        </div>
        <div class="personalCenter-stateSelectListView" v-show="showStateList">
            <ul class="personalCenter-stateSelectList">
                <li class="personalCenter-stateSelect" v-for="(state, index) in stateList" @click="stateItemClicked(state, index)" :key="index">
                    <p class="personalCenter-stateSelectTitle">{{ state.state }}</p>
                        <img class="personalCenter-stateSelectCheck" v-show="state.check" src="../../../static/Img/personalCenter/selected-20px@2x.png">
                        </li>
                    </ul>
                </div>
        <div class="personalCenter-workDescription">
            <img class="personalCenter-descriptionIcon" src="../../../static/Img/personalCenter/workDescription-20px@2x.png">
            <input class="personalCenter-descriptionInput" placeholder="请添加工作描述" v-model="workDescriptionInput" @keyup.enter="workDescriptionChangeConfirm()">
        </div>
    </div>
</template>
<script>
import {services} from '../../packages/data/index.js';
export default {
    name: 'user-info',
    data() {
        return {
            pagePosition: {},
            stateInput:'',
            workDescriptionInput:'',
            stateList:[],
            showStateList: false,
        }
    },
    props: {
        userInfo: {
            type:Object,
            default:function () {
                return {};
            }
        },

    },
    computed: {

    },
    methods: {
        stateListArrowClicked(){
            if(this.showStateList){
                this.showStateList = false;
            }
            else{
                this.showStateList = true;
            }
        },
        stateItemClicked:async function(state, index){
            var temp = this.stateList;
            var checkIndex = 0;
            for(var i = 0; i < this.stateList.length; i ++){
                if(this.stateList[i].check){
                    checkIndex = i;
                    break;
                }
            }
            temp[checkIndex].check = false;
            temp[index].check = true;
            this.stateInput = state.state;
            this.stateList = temp;
            await this.stateChangeConfirm();
            this.showStateList = false;
        },
        stateChangeConfirm:async function(){
            await services.common.updateUserStatusDescription(this.stateInput);
            this.$message('修改成功');
        },
        workDescriptionChangeConfirm:async function(){

        },
        isEmpty(obj){
            if(typeof obj == "undefined" || obj == null || obj == ""){
                return true;
            }else{
                return false;
            }
        },
        
    },
    created () {
        console.log(this.userInfo);

        var leftPosition = 64;
        var topPosition = 32;
        
        this.pagePosition.left = leftPosition.toString() + "px";
        this.pagePosition.top = topPosition.toString() + "px";
        this.stateInput = this.userInfo.status_description;
        this.workDescriptionInput = this.userInfo.work_description;
        var stateArray = ['空闲', '出差中', '会议中', '外出中', '生病中', '休假中'];
        var temp = [];
        for(var i = 0; i < stateArray.length; i ++){
            var state = {};
            state.state = stateArray[i];
            
            if(this.userInfo.status_description == stateArray[i]){
                state.check = true;
            }
            temp.push(state);
        }
        this.stateList = temp;
        var _this = this;
        document.addEventListener('click',function(e){
            if(e.target.className.indexOf('personalCenter-stateSelect') == -1){
                _this.showStateList = false;
            }
        });
    }
}
</script>
<style lang="scss" scoped>
.personalCenter-view {
    height: 124px;
    width: 260px;
    padding: 0px;
    //border: 1px solid rgb(242, 242, 246);
    box-shadow:0px 0px 30px 0px rgba(103,103,103,0.24);
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    position: absolute;
    cursor: default;
    overflow: visible;
}
.personalCenterBaseInfo-view {
    height: 48px;
    width: calc(100% - 40px);
    margin: 0px;
    margin-top: 20px;
    margin-left: 20px;
}
.personalCenter-icon {
    width: 48px;
    height: 48px;
    margin: 0px;
    margin-bottom: 0px;
    border-radius: 4px;
    display: inline-block;
}
.personalCenter-baseInfo {
    display: inline-block;
    height: 48px;
    width: 100px;
    vertical-align: top;
    margin-left: 12px;
    .personalCenter-state:hover{
        background:rgba(243,244,247,1);
    }
    .personalCenter-state{
        height: 22px;
        width: 64px;
        border: none;
        background:rgba(255,255,255,1);
        .personalCenter-stateInput{
            display: inline-block;
            position: absolute;
            text-indent: 4px;
            width: 42px;
            padding: 0;
            margin: 0px;
            height: 18px;
            outline:none;
            border: 0px;
            font-family: 'Microsoft YaHei';
            font-size: 12px;
        
            background-color: rgba(1, 1, 1, 0);

            font-weight:400;
            color: rgb(153, 153, 153);
            line-height:18px;
            letter-spacing:1px;
        }
        .personalCenter-stateSelectArrow{
            width: 20px;
            height: 20px;
            display: none;
            padding: 0px;
            margin-left: 42px;
        }
    }
    .personalCenter-state:hover{
        border: 1px solid rgba(221,221,221,1);
        border-radius:2px;
        background:rgba(255,255,255,1);
        .personalCenter-stateSelectArrow{
            display: inline-block;
        }
        .personalCenter-stateInput{
            color: black;
        }
    }
}
.personalCenter-name {
    height: 22px;
    margin: 0px;

    width: 100%;
    text-align: left;
    font-size: 16px;
    font-weight:500;
    color:rgba(0,0,0,1);
    line-height:22px;
    letter-spacing:2px;
}
.personalCenter-stateSelectListView{
    position: absolute;
    left: 73px;
    top: 71px;
    width:80px;
    height:192px;
    background:rgba(255,255,255,1);
    box-shadow:0px 0px 12px 0px rgba(103,103,103,0.14);
    border-radius:4px;
    border:1px solid rgba(221,221,221,1);
    padding: 0px;
    z-index: 100;
    .personalCenter-stateSelectList{
        width: 68px;
        height: 100%;
        padding: 0px;
        margin: 0px;
        padding-left: 12px;
        list-style: none;
        .personalCenter-stateSelect{
            width: 68px;
            height: 32px;
            vertical-align: top;
            .personalCenter-stateSelectTitle{
                width: 40px;
                padding: 0px;
                margin-top: 7px;
                margin-bottom: 7px;
                font-size:12px;
                font-weight:400;
                color:rgba(51,51,51,1);
                line-height:18px;
                letter-spacing:1px;
                display: inline-block;
            }
            .personalCenter-stateSelectCheck{
                width: 20px;
                height: 20px;
                margin-top: 6px;
                margin-left: 4px;
                vertical-align: top;
                display: inline-block;
            }
        }
    }
}
.personalCenter-workDescription{
    width: calc(100% - 40px);
    height: 20px;
    margin-left: 20px;
    border: none;
    margin-top: 16px;
    .personalCenter-descriptionIcon{
        width: 20px;
        height: 20px;
        display: inline-block;
        margin-left: 0px;
    }
    .personalCenter-descriptionInput{
            display: inline-block;
            position: absolute;
            //text-indent: 10px;
            width: 105px;
            padding: 0px;
            margin: 0px;
            height: 18px;
            outline:none;
            border: 0px;
            font-family: 'Microsoft YaHei';
            font-size: 12px;
            border: none;
            background-color: rgba(1, 1, 1, 0);

            font-weight:400;
            color: rgb(153, 153, 153);
            line-height:18px;
            letter-spacing:1px;
    }
}
.personalCenter-workDescription:hover{
    .personalCenter-descriptionInput{
            color: black;

    }
}


</style>