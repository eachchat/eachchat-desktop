<template>
<div class="cropper-layer">
    <div class="cropper-content">
        <div class="cropper-header">
            <p class="cropper-title">上传头像</p>
            <img class="cropper-close" src="../../../static/Img/Chat/delete-20px@2x.png" @click="closeDialog()">
        </div>
        <div class="cropper-body">
            <vueCropper class="cropper-vue"
                    ref="cropper"
                    :img="option.img"
                    :outputSize="option.size"
                    :outputType="option.outputType"
                    :info="option.info"
                    :full="option.full"
                    :canScale="option.canScale"
                    :canMove="option.canMove"
                    :canMoveBox="option.canMoveBox"
                    :original="option.original"
                    :autoCrop="option.autoCrop"
                    :autoCropWidth="option.autoCropWidth"
                    :autoCropHeight="option.autoCropHeight"
                    :fixedBox="option.fixedBox"
                    :infoTrue="option.infoTrue"
                    :mode="option.mode"
                    @imgLoad="imgLoad"
                ></vueCropper>
                <div class="cropper-action">
                    <img class="cropper-min-image"  src="../../../static/Img/personalCenter/min-24px@2x.png" @click="changeScale(-1)">
                    <img class="cropper-zoom-image" src="../../../static/Img/personalCenter/zoom-24px@2x.png" @click="changeScale(1)">
                    <img class="cropper-left-image" src="../../../static/Img/personalCenter/left-24px@2x.png" @click="rotateLeft()">
                    <img class="cropper-right-image" src="../../../static/Img/personalCenter/right-24px@2x.png" @click="rotateRight()">
                </div>
        </div>
        <div class="cropper-footer">
            <button class="cropperCancleButton" @click="closeDialog()">取消</button>
            <button class="cropperConfirmButton" @click="cropperConfirmButtonClicked()">确认</button>
        </div>
    </div>
</div>
</template>
<script>
import * as path from 'path'
import * as fs from 'fs-extra'
import {FileUtil, fileMIMEFromType} from '../../packages/core/Utils.js';
import {services} from '../../packages/data/index.js';
import { read } from 'fs'
import confservice from '../../packages/data/conf_service.js'
export default {
    name: 'cropper',
    data() {
        return {
            //剪切图片上传
            crap: false,
            previews: {},
            option: {
                img: '', // 裁剪图片的地址
                info: false, // 裁剪框的大小信息
                outputSize: 0.5, // 剪切后的图片质量（0.1-1）
                full: false, // 输出原图比例截图 props名full
                outputType: 'png', // 裁剪生成额图片的格式
                canMove: true,  // 能否拖动图片
                canScale: false, //滑轮缩放
                original: true,  // 上传图片是否显示原始宽高
                canMoveBox: false,  // 能否拖动截图框
                autoCrop: true, // 是否默认生成截图框
                autoCropWidth: 240, 
                autoCropHeight: 240, 
                fixedBox: true, // 截图框固定大小
                infoTrue: true,
                mode:"100% auto"
            }, 
            fileName:'',  // 本机文件地址
            scaleNumber:0,
            downImg: '#',
            imgFile:'',
            uploadImgRelaPath:'', // 上传后的图片的地址（不带服务器域名）
        }
    },
    props:{
        imageSource:{
            type:String,
            default:function(){
                return '';
            }
        },
        groupId: {
            type: String,
            default: '',
        }
    },
    created:{

    },
    mounted:function(){
        var showfu = new FileUtil(this.imageSource);
        let showfileObj = showfu.GetUploadfileobj();
        var reader = new FileReader();
        reader.onloadend = (evt) => {
            var image = new Image();
            this.option.img = evt.target.result;
            image.src = evt.target.result;
            console.log(image.width);
        }
        reader.readAsDataURL(showfileObj);
    },
    methods: { 

        closeDialog() {
            this.display = false;
            this.$emit("closeCropperDlg", "");
            
        },
      // 放大/缩小
        changeScale(num) { 
            if((this.scaleNumber + num) < 0){
                return;
            }
            this.scaleNumber += num;
            num = num || 1; 
            this.$refs.cropper.changeScale(num); 
        }, 
        cropperConfirmButtonClicked:async function(){
            if(this.groupId.length != 0) {
                var targetDir = confservice.getUserThumbHeadPath();
                var targetPath = path.join(targetDir, this.groupId + '.png');
                if(fs.existsSync(targetPath)) {
                    fs.unlinkSync(targetPath);
                }

                var _this = this;
                this.$refs.cropper.getCropBlob((data) => { 
                    services.common.UpdateGroupAvatarByData(this.groupId, data,this.imageSource,'image/png');
                    _this.closeDialog();
                    _this.$toastMessage({message:'头像修改成功', time:2000, type:'success'});
                    
                });
            }
            else {
                var _this = this;
                this.$refs.cropper.getCropBlob((data) => { 
                    services.common.UpdateUserAvatarByData(data,this.imageSource,'image/png');
                    _this.closeDialog();
                    _this.$toastMessage({message:'头像修改成功', time:2000, type:'success'});
                    
                });
            }
        },
        // 坐旋转
        rotateLeft() { 
            this.$refs.cropper.rotateLeft(); 
        }, 
        // 右旋转
        rotateRight() { 
            this.$refs.cropper.rotateRight(); 
        }, 
        getScaleNumber(width, height){
            var max = height;
            var min = width;
            if(width >= height){
                max = width;
                min = height;
            }
            var p = 20 / max;
            return (240 - min)/(min*p);
        },
        imgLoad (msg) { 
            var showfu = new FileUtil(this.imageSource);
            let showfileObj = showfu.GetUploadfileobj();
            var reader = new FileReader();
            reader.onloadend = (evt) => {
                var image = new Image();
                this.option.img = evt.target.result;
                image.src = evt.target.result;
                console.log(image.width);
                this.$refs.cropper.changeScale(this.getScaleNumber(image.width, image.height)); 
            }
            reader.readAsDataURL(showfileObj);
        }
    }
}
</script>
<style lang="scss" scoped>
.cropper-layer{
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.3);
        .cropper-content{
            position: absolute;
            width: 380px;
            height: 440px;
            top: calc(50% - 220px);
            left: calc(50% - 190px);
            background:rgba(255,255,255,1);
            box-shadow:0px 0px 30px 0px rgba(103,103,103,0.24);
            border-radius:4px;
            .cropper-header{
                width: 100%;
                height: 56px;
                margin: 0px;
                padding: 0px;
                .cropper-title{
                    display: inline-block;
                    width: calc(100% - 80px);
                    margin: 0px;
                    margin-top: 17px;
                    margin-left: 32px;
                    height:22px;
                    font-size:16px;
                    font-weight:500;
                    color:rgba(0,0,0,1);
                    line-height:22px;
                    letter-spacing:2px;
                    font-family: PingFangSC-Medium;
                }
                .cropper-close{
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    margin: 0px;
                    margin-top: 20px;
                }
            }
            .cropper-body{
                height: 284px;
                width: 240px;
                margin: 0px;
                margin-top: 20px;
                margin-left: 70px;
                .cropper-vue{
                    width: 240px;
                    height: 240px;
                    margin:0px;
                    border-radius:4px;
                    border:1px solid rgba(221,221,221,1);
                    background-color: white;
                }
                .cropper-action{
                    height: 24px;
                    width: 240px;
                    margin: 0px;
                    margin-top: 20px;
                    .cropper-min-image{
                        display: inline-block;
                        width: 24px;
                        height: 24px;
                        margin-left: 24px;
                    }
                    .cropper-zoom-image{
                        display: inline-block;
                        width: 24px;
                        height: 24px;
                        margin-left: 32px;
                    }
                    .cropper-left-image{
                        display: inline-block;
                        width: 24px;
                        height: 24px;
                        margin-left: 32px;
                    }
                    .cropper-right-image{
                        display: inline-block;
                        width: 24px;
                        height: 24px;
                        margin-left: 32px;
                    }
                }
            }
            .cropper-footer{
                height: 84px;
                widows: 100%;
                display: inline-block;
                .cropperCancleButton{
                    outline: none;
                    width: 100px;
                    height: 32px;
                    margin-right: 5px;
                    margin-top: 32px;
                    margin-bottom: 20px;
                    margin-left: 80px;
                    background: white;
                    border-radius:4px;
                    border:1px solid rgba(221,221,221,1);
                    font-family: PingFangSC-Regular;
                }
                .cropperConfirmButton{
                    outline: none;
                    width: 100px;
                    height: 32px;
                    margin-left: 5px;
                    margin-top: 32px;
                    margin-bottom: 20px;
                    //margin-right: 110px;
                    background: rgba(36, 179, 107, 1);
                    border:1px solid rgba(221,221,221,1);
                    color: white;
                    border-radius:4px;
                    font-family: PingFangSC-Regular;
                }
            }
        }
}

</style>
