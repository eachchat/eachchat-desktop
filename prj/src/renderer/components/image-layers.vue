<template>
    <div class="ImageLayers" id="imageLayers">
        <div class="image-layers-buttons">
            <i class="el-icon-close" @click="Close()"></i>
        </div>
        <img class="image-layers-image" id="imageLayersImage">
    </div>
</template>

<script>
import {downloadGroupAvatar, strMsgContentToJson} from '../../packages/core/Utils.js'
import {services, environment} from '../../packages/data/index.js'
import {APITransaction} from '../../packages/data/transaction.js'
export default {
    name: 'ImageLayers',
    props: ['imgSrcInfo', 'access_token'],
    data () {
        return {
            ImgElement: null,
            ImgLayersElement: null,
            LoadingElement: null,
            imgHeight: 400,
            imgWidth: 600,
        }
    },
    methods: {
        Close: function() {
            this.$emit("closeImageOfMessage");
        },
        calcImgPosition: function() {
            if(this.ImgElement == null) {
                this.ImgElement = document.getElementById("imageLayersImage");
            }
            if(this.ImgLayersElement == null) {
                this.ImgLayersElement = document.getElementById("imageLayers");
            }
            var showScreenHeight = this.ImgLayersElement.offsetHeight;
            var showScreenWidth = this.ImgLayersElement.offsetWidth - 281;
            var left = 100;
            var top = 100;
            if(showScreenWidth > this.imgWidth) {
                left = (showScreenWidth - this.imgWidth) / 2;
            }
            else {
                left = showScreenWidth / 2;
            }
            if(showScreenHeight > this.imgHeight) {
                top = (showScreenHeight - this.imgHeight) / 2;
            }
            else {
                top = showScreenHeight / 2;
            }

            var ret = {
                "left": left,
                "top": top
            }

            return ret;
        }
    },
    components: {
    },
    created: async function () {
        this.serverapi = new APITransaction('139.198.15.253', 8888)
        this.loginInfo = await services.common.GetLoginModel();
    },
    mounted: function() {
        setTimeout(() => {
            this.$nextTick(() => {
                this.ImgLayersElement = document.getElementById("imageLayers");
                this.ImgElement = document.getElementById("imageLayersImage");
            })
        }, 0)
    },
    watch: {
        imgSrcInfo: function() {
            if(this.ImgElement == null) {
                this.ImgElement = document.getElementById("imageLayersImage");
            }
            if(this.ImgLayersElement == null) {
                this.ImgLayersElement = document.getElementById("imageLayers");
            }
            if(this.imgSrcInfo == "") {
                return;
            }
            
            var msgContent = strMsgContentToJson(this.imgSrcInfo.message_content);
            this.imgHeight = msgContent.imgHeight;
            this.imgWidth = msgContent.imgWidth;
            if(this.imgHeight > 400) {
                this.imgHeight = 400;
            }
            var showPosition = this.calcImgPosition();
            this.serverapi.downloadTumbnail(this.loginInfo.access_token, "T", this.imgSrcInfo.time_line_id)
                .then((ret) => {
                    let reader = new FileReader();
                    reader.readAsDataURL(ret.data);
                    reader.onloadend = () => {
                        this.ImgElement.setAttribute("src", reader.result);
                        this.ImgElement.setAttribute("height", this.imgHeight);
                        this.ImgElement.style.left = showPosition.left.toString() + "px";
                        this.ImgElement.style.top = showPosition.top.toString() + "px";
                    }
                })
        }
    }
}
</script>

<style lang="scss" scoped>
    .ImageLayers {
        height: calc(100% - 20px);
        width: calc(100% - 64px);
        position: absolute;
        top:20px;
        left:64px;
        background: rgba(0, 0, 0, 0.6);
    }

    .image-layers-buttons {
        position: absolute;
        top: 0px;
        left: 0px;
        margin:0;
        height: 56px;
        width: 100%;
        background: rgba(0, 0, 0, 0.6);
    }
    
    .el-icon-close {
        display: inline-block;
        float: right;
        height: 56px;
        width: 56px;
        line-height: 56px;
        color: white;
    }
    
    .el-icon-close:hover {
        display: inline-block;
        float: right;
        margin: 0;
        height: 56px;
        width: 56px;
        line-height: 56px;
        color: red;
    }
    
    .image-layers-image {
        position: absolute;
        margin:0;
        background: rgb(1, 1, 1);
        border: none;
    }

</style>
