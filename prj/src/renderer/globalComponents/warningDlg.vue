<template>
    <div id="tip_alertModal" class="wrap-layer">
        <div class="mx-setting-dialog">
            <div class="inner-wrap">
                <div class="title">
                    <img class="kobe" src="../../../static/Img/Main/mgs.png"/>
                    <div class="titleText">退出群聊</div>
                </div>
                <!-- <img class="close" @click.stop="close" src="../../../static/Img/Main/xincaca.png"> -->
                <div class="desc">是否退出群聊？</div>
                <div class="submit-field">
                    <div class="button buttonConfirm" @click.stop="confirm">确定</div>
                    <div class="button buttonCancel" @click.stop="cancel">取消</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'warningDlg',
    data () {
        return {
            show: true, // 通过这个属性，控制是否移除dom元素
            title:'', //顶部标题
            content:'', // 内容
            cancelBtn: false // 取消按钮

        }
    },
    props: ['roomId'],
    puborprtTimer: null,
    methods: {
        close() {
            // 右上角关闭
            this.a_close && this.a_close();
            this.show = false;
            // 删除判断增加的window属性
            delete window.alertIsShow;
        },
        confirm() {
            // 确定
            this.a_confirm && this.a_confirm();
            this.show = false;
            // 删除判断增加的window属性
            delete window.alertIsShow;
        },
        cancel() {
            // 取消
            this.a_cancel && this.a_cancel();
            this.show = false;
            // 删除判断增加的window属性
            delete window.alertIsShow;
        }
    },
    watch: {
        show(cur, old) {
            // 通过监控data里的show属性  弹框有三个事件（右上角取消  确定按钮  取消按钮）
            // 每个事件写了 this.show = false
            // 当弹框出现的时候 点击任何一个事件  都会触发这里的监控事件  将页面上的弹框Dom移除
            if (cur === false) {
            let tip_alert = document.getElementById('tip_alertModal');
            tip_alert.parentNode.removeChild(tip_alert);
            }
        }
    },
    components: {
    },
    created: function () {     
    },
    mounted: function() {
    }
}
</script>

<style lang="scss" scoped>
    .wrap-layer {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }
    .mx-setting-dialog {
        position: fixed;
        left: 50%;
        top: 50%;
        margin-top: -80px;
        margin-left: -200px;
        background-color: #fff;
        border-radius: 4px;
        width: 400px;
        height: 160px;
        z-index: 9998;
        .inner-wrap {
            height: 100%;
            .title {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                margin-left: 32px;
                margin-top: 32px;
                .kobe {
                    height: 24px;
                    width: 24px;
                    margin-right: 16px;
                }
                .titleText {
                    height: 22px;
                    font-size: 16px;
                    font-family: PingFangSC-Medium, PingFang SC;
                    font-weight: 500;
                    color: #000000;
                    line-height: 22px;
                }
            }
            .desc {
                height: 20px;
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #000000;
                line-height: 20px;
                margin-left: 72px;
            }
            .close {
                position: absolute;
                top: 24px;
                right: 24px;
                cursor: pointer;
                height: 20px;
                widows: 20px;
            }
            .setting-field {
                margin-bottom: 20px;
                font-size: 12px;
                .filed-title {
                    font-size: 16px;
                    margin-bottom: 12px;
                }
                .title-input {
                    height: 40px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .desc-text {
                    height: 120px;
                    width: 100%;
                    box-sizing: border-box;
                    resize: none;
                }
                .input-tip {
                    color:rgb(118, 118, 118);
                    font-size: 14px;
                }
            }
            .submit-field {
                display: flex;
                align-items: center;
                flex-direction: row-reverse;
                margin-top: 20px;
                .button {
                    box-sizing: border-box;
                    width: 100px;
                    height: 32px;
                    border-radius: 4px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 14px;
                    font-family: PingFangSC-Medium, PingFang SC;
                    font-weight: 500;
                    line-height: 20px;
                    cursor: pointer;
                }
                .buttonCancel {
                    background: #fff;
                    border: 1px solid #DDDDDD;
                    margin-right: 20px;
                }
                .buttonConfirm {
                    background: #24B36B;
                    color: #FFFFFF;
                    margin-right: 20px;
                }
            }
        }
    }
</style>