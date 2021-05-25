<template>
    <div class="ChatCreaterLayers" id="ChatCreaterLayersId" >
        <div :style="dlgPosition" class="ChatCreaterDlg" id="ChatCreaterDlgId">
            <div class="ChatCreaterHeader">
                <div class="ChatCreaterHeaderTitle">{{$t("contact.newContact")}}</div>
                <img ondragstart="return false" class="ChatCreaterClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
            </div>
            
            <div class="ChatCreaterContent">
                <label for="ID"></label>
                    <div class = 'ContactLabelInputDiv'>
                        <div class = 'ContactLabelID'>{{$t("contact.ID")}}</div>
                        <el-input class = 'ContactInput' v-model="contactInfo.matrix_id" size='mini' :placeholder = '$t("contact.IDPlaceHolder")' clearable></el-input>
                        <div class = 'ErrStyle' v-show = 'sError.length != 0'>{{sError}}</div>
                    </div>
                    <div class = 'ContactLabelInputDiv'>
                        <div class = 'ContactLabel'>{{$t("contact.remarkName")}}</div>
                        <el-input class = 'ContactInput' v-model="contactInfo.display_name"  size='mini' :placeholder = '$t("contact.remarkNamePlaceHolder")' clearable></el-input>
                    </div>
                    
                    <div class = 'ContactLabelInputDiv'>
                        <div class = 'ContactLabel'>{{$t("contact.mobile")}}</div>
                        <el-input class = 'ContactInput' v-model="contactInfo.mobile" size='mini' :placeholder = '$t("contact.mobilePlaceHolder")' clearable></el-input>
                    </div>
                    <div class = 'ContactLabelInputDiv'>
                        <div class = 'ContactLabel'>{{$t("contact.telephone")}}</div>
                        <el-input class = 'ContactInput' v-model="contactInfo.telephone" size='mini' :placeholder = '$t("contact.telephonePlaceHolder")' clearable></el-input>
                    </div>
       
                    <div class = 'ContactLabelInputDiv'>
                        <div class = 'ContactLabel'>{{$t("contact.email")}}</div>
                        <el-input class = 'ContactInput' v-model="contactInfo.email" size='mini' :placeholder = '$t("contact.emailPlaceHolder")' clearable></el-input>
                    </div>
                    <div class = 'ContactLabelInputDiv'>
                        <div class = 'ContactLabel'>{{$t("contact.company")}}</div>
                        <el-input class = 'ContactInput' v-model="contactInfo.company_name" size='mini' :placeholder = '$t("contact.companyPlaceHolder")' clearable></el-input>
                    </div>
                    <div class = 'ContactLabelInputDiv'>
                        <div class = 'ContactLabel'>{{$t("contact.title")}}</div>
                        <el-input class = 'ContactInput' v-model="contactInfo.title" size='mini' :placeholder = '$t("contact.titlePlaceHolder")' clearable></el-input>
                    </div>
            </div>
            <div class  ='ContactInputButton'>
                <button class = 'CancelButton' @click="closeDialog()">{{$t("contact.cancel")}}</button>  
                <button class = 'SaveButton' @click="SaveContact()">{{$t("contact.confirm")}}</button>                     
            </div>
        </div>
 
    </div>
</template>

<script>
import log from 'electron-log';
import {Contact} from '../../packages/data/sqliteutil.js'; 

export default {
    name: 'InputContactInfo',
    props: {
    },
    data () {
        return {
            contactInfo: {
                matrix_id: '',
                display_name: '',
                mobile:'',
                telephone:'',
                email:'',
                company_name:'',
                title:''
            },
            matrixClient: undefined,
            imgHeight: 468,
            imgWidth: 724,
            dlgPosition:{},
            viewContentHeight:202,
            services: null,
            sError: ''
        }
    },
    watch:{
        "contactInfo.matrix_id" : function(){
            if(this.contactInfo.matrix_id.length == 0) this.sError = '';
        }
    },
    methods: {
        async SaveContact(){
            if(this.contactInfo.matrix_id.length == 0)
            {
                this.sError = this.$t("contact.sErrorNeedID");
                return;
            }
            this.matrixClient.getProfileInfo(this.contactInfo.matrix_id).then(async (res) => {
                log.info("SaveContact getProfileInfo", res)
                await this.services.GetAllContact();
                let user = await Contact.GetContactInfo(this.contactInfo.matrix_id);
                if(user){
                    this.sError = this.$t("contact.sErrorContactRepeat");
                    return;
                }
                let ret = await this.services.AddContact(this.contactInfo);
                if(ret) this.closeDialog();
                this.sError = this.$t("contact.sErrorAddContactFailed");
            }).catch(e => {
                log.info("SaveContact getProfileInfo error", e)
                this.sError = this.$t("contact.sErrorUserNotExist");
            });
        },

        closeDialog() {
            this.$emit("closeInputContact", "");
        }
    },
    components: {
    },

    created() {

    },
    mounted:async function() {
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
        this.services = global.services.common;
        this.contactInfo.matrix_id = '';
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
::-webkit-scrollbar-track-piece {
    background-color: #FFFFFF;
    border-radius: 10px;
}

::-webkit-scrollbar {
    width: 4px;
}

::-webkit-scrollbar-thumb {
    height: 57px;
    background-color: #C1C1C1;
    border-radius: 10px;
    outline: none;
}

::-webkit-scrollbar-thumb:hover {
    height: 57px;
    background-color: #A8A8A8;
    border-radius: 10px;
}

.ErrStyle{
    margin-top: -3px;
    height: 18px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #EF403A;
    line-height: 18px;
}

.ContactLabelInputDiv{
    margin-bottom:12px;
}

/deep/.el-input--mini .el-input__inner {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
}

.ContactLabelID{
    height: 20px;
    font-size: 13px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #666666;
    line-height: 20px;
    margin-bottom: 8px;
}

.ContactLabelID:after{
     content:"*" ;
     color:red   
     }

.ContactLabel{
    height: 20px;
    font-size: 13px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #666666;
    line-height: 20px;
    margin-bottom: 8px;
}

.ContactInput{
    width: 360px;
    height: 36px;
    background: #FFFFFF;
    border-radius: 4px;
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
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 440px;
    height: 486px;
    display: block;
    background: rgba(255, 255, 255, 1);
}

.ChatCreaterHeader {
    margin-left: 32px;
    margin-top: 17px;
    margin-right: 20px;
    height: 56px;
    background: rgba(255, 255, 255, 1);
}

.ChatCreaterHeaderTitle {
    height: 22px;
    line-height: 22px;
    display: inline-block;
    vertical-align: top;
    font-weight: 500;
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    color: #000000;
}

.ChatCreaterClose {
    width: 20px;
    height: 20px;
    float:right;
    display: inline-block;
}

.ChatCreaterContent {
    overflow-x: hidden;
    //width: 370px;
    height: 350px;
    margin-left: 40px;
}

.CancelButton {
    width: 100px;
    height: 32px;
    margin-right: 20px;
    background: white;
    border-radius:4px;
    border:1px solid rgba(221,221,221,1);      
    font-family: PingFangSC-Medium, PingFang SC;
}

.SaveButton{
    width: 100px;
    height: 32px;
    margin-right: 5px;
    background: #00A971;
    border-radius:4px;
    font-family: PingFangSC-Medium, PingFang SC;
    color: white;
    border:none;
}
.el-table__body tr,
    .el-table__body td {
        padding: 0;
        height: 40px;
    }

.ContactInputButton{
    margin-top: 20px;
    margin-bottom: 20px;
    text-align:center;
    letter-spacing: -3px;
}

/deep/.el-input--mini .el-input__inner {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    margin-top: 1px;
}
</style>
