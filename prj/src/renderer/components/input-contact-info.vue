<template>
    <div class="ChatCreaterLayers" id="ChatCreaterLayersId" >
        <div :style="dlgPosition" class="ChatCreaterDlg" id="ChatCreaterDlgId">
            <div class="ChatCreaterHeader">
                <div class="ChatCreaterHeaderTitle">{{ $t('addContactDlgName') }}</div>
                <img ondragstart="return false" class="ChatCreaterClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            
            <el-container class="ChatCreaterContent">
                <el-form :rules="rules" ref="contactInfo" :model="contactInfo" label-width="100px" width='600px'>
                    <el-form-item label="Matrix ID" prop="user_id">
                        <el-input v-model="contactInfo.user_id" size='mini' width="200px"></el-input>
                    </el-form-item>
                    <el-form-item label="备注名">
                        <el-input v-model="contactInfo.display_name"  size='mini' width="100px"></el-input>
                    </el-form-item>
                    <el-form-item label="手机">
                        <el-input v-model="contactInfo.mobile" size='mini'></el-input>
                    </el-form-item>
                    <el-form-item label="座机">
                        <el-input v-model="contactInfo.telephone" size='mini'></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="contactInfo.email" size='mini'></el-input>
                    </el-form-item>
                    <el-form-item label="公司">
                        <el-input v-model="contactInfo.company_name" size='mini'></el-input>
                    </el-form-item>
                    <el-form-item label="职位">
                        <el-input v-model="contactInfo.title" size='mini'></el-input>
                    </el-form-item>
                </el-form>
            </el-container>
            <div style="text-align:center">
                <button class = 'SaveButton' @click="SaveContact()">保存</button>                     
            </div>
        </div>
 
    </div>
</template>

<script>
import {services, environment} from '../../packages/data/index.js'
import {Contact} from '../../packages/data/sqliteutil.js'
import * as fs from 'fs-extra'
import {ipcRenderer} from 'electron'
import { object } from '../../packages/core/types'
import confservice from '../../packages/data/conf_service';
import { strMsgContentToJson, sliceReturnsOfString, generalGuid, FileUtil } from '../../packages/core/Utils.js'
import * as path from 'path'
import { model } from '../../packages/core'
import { models } from '../../packages/data/models.js';


export default {
    name: 'InputContactInfo',
    props: {
    },
    data () {
        return {
            contactInfo: {
                user_id: '',
                display_name: '',
                mobile:'',
                telephone:'',
                email:'',
                company_name:'',
                title:''
            },
            rules:{
                user_id:[
                    {required: true, message:'请输入用户ID', trigger: 'blur'}
                ]
            },
            matrixClient: undefined,
            imgHeight: 468,
            imgWidth: 724,
            dlgPosition:{},
            viewContentHeight:202,
            services: null
        }
    },
    watch:{

    },
    methods: {
        async SaveContact(){
            if(this.contactInfo.user_id.length == 0)
                return;
            await this.services.AddContact(this.contactInfo);
            await this.services.GetAllContact();
            this.closeDialog();
        },

        closeDialog() {
            //this.display = false;
            this.$emit("closeInputContact", "");
        },
    },
    components: {
    },
    created() {
        var showPosition = this.calcImgPosition();
        this.dlgPosition.left = showPosition.left.toString() + "px";
        this.dlgPosition.top = showPosition.top.toString() + "px";
    },
    mounted:async function() {
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
        this.services = global.services.common;
        this.contactInfo.user_id = '';
        this.contactInfo.display_name = '';
        this.contactInfo.mobile = '';
        this.contactInfo.telephone = '';
        this.contactInfo.email = '';
        this.contactInfo.company_name = '';
        this.contactInfo.title = '';
    },
    
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
    .ChatCreaterLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .ChatCreaterDlg {
        position: absolute;
        width: 624px;
        height: 568px;
        display: block;
        background: rgba(255, 255, 255, 1);
    }

    .ChatCreaterHeader {
        width: 100%;
        height: 56px;
        background: rgba(255, 255, 255, 1);
    }

    .ChatCreaterHeaderTitle {
        width: calc(100% - 68px);
        height: 56px;
        line-height: 56px;
        display: inline-block;
        margin-left: 32px;
        vertical-align: top;
        font-family: PingFangSC-Medium;
        font-weight: 500;
        letter-spacing: 2px;
    }

    .ChatCreaterClose {
        width: 20px;
        height: 20px;
        margin-top: 18px;
        margin-bottom: 18px;
        display: inline-block;
    }
    .ChatCreaterBody {
        width: 560px;
        height: 340x;
    }
            .OrganizationView{
            height: 284px;
            width: 100%;
            padding: 0px;
            margin: 0px;
        }
    .ChatCreaterContent {
        width: 560px;
        height: 440x;
        margin: 0;
        margin-left: 32px;
        border-radius: 4px;
        border: 1px solid rgba(221,221,221,1);
        background:rgba(255,255,255,1);
    }
    .search {
        margin: 12px 0px -1px 16px;
        text-align: left;
        width: 80%;
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
        width: 40px;
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
        width: 20px;
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
        width: 70%;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
        letter-spacing:1px;
    }

    .search-label{
        color:rgba(153,153,153,1);
        font-size: 12px;
        margin-left: 16px;
    }

    .TransmitFotter {
        width: 100%;
        height: 72px;
        display: inline-block;
        text-align: center;
    }
    .TransmitConfirmButton{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(36, 179, 107, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }
 
    .TransmitConfirmButton:disabled{
        width: 100px;
        height: 32px;
        margin-left: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-right: 110px;
        background: rgba(167, 224, 196, 1);
        border:1px solid rgba(221,221,221,1);
        color: white;
        border-radius:4px;
        font-family: PingFangSC-Regular;
    }
 
    .TransmitCancleButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 110px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }
    .multiSelectCheckbox {
        display: inline-block;
        position:relative;
        width: 20px;
        height: 20px;
        background-color: rgba(255, 255, 255, 1);
        border: 1px solid rgb(221,221,221);
        border-radius: 4px;
        font-size: 10px;
        margin-top: 14px;
        margin-bottom: 14px;
        vertical-align:top;
        cursor: pointer;
        -webkit-appearance:none;
        -webkit-user-select:none;
        user-select:none;
        -webkit-transition:background-color ease 0.1s;
        transition:background-color ease 0.1s;
        float: left;
        outline: none;
    }

    .multiSelectCheckbox:checked {
        background-color: rgb(36, 179, 107);
        cursor: pointer;
        outline: none;
    }
    .multiSelectCheckbox:indeterminate {
        background-color: rgb(36, 179, 107);
        cursor: pointer;
        outline: none;
    }
    .multiSelectCheckbox:indeterminate::after{
        content:'';
        top:7px;
        left:4px;
        font-size: 10px;
        position: absolute;
        background:transparent;
        border:#fff solid 2px;
        border-top:none;
        border-right:none;
        border-left: none;
        height:1px;
        width:10px;
        // -moz-transform:rotate(-45deg);
        // -ms-transform:rotate(-45deg);
        // -webkit-transform:rotate(-45deg);
        // transform:rotate(-45deg);
        outline: none;
    }
    .multiSelectCheckbox:checked::after {
        content:'';
        top:3px;
        left:3px;
        font-size: 10px;
        position: absolute;
        background:transparent;
        border:#fff solid 2px;
        border-top:none;
        border-right:none;
        height:6px;
        width:10px;
        -moz-transform:rotate(-45deg);
        -ms-transform:rotate(-45deg);
        -webkit-transform:rotate(-45deg);
        transform:rotate(-45deg);
        outline: none;
    }

    .SaveButton {
        width: 100px;
        height: 32px;
        margin-right: 5px;
        margin-top: 20px;
        margin-bottom: 20px;
        margin-left: 110px;
        background: white;
        border-radius:4px;
        border:1px solid rgba(221,221,221,1);
        font-family: PingFangSC-Regular;
    }
    .el-table__body tr,
        .el-table__body td {
            padding: 0;
            height: 40px;
        }
</style>
